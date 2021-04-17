/* eslint-disable import/first, import/order */
import "source-map-support/register";
import * as Sentry from "@sentry/node";
import express from "express";
import compression from "compression";
import dotenv from "dotenv";
import http from "http";
import { graphqlExpress, graphiqlExpress } from "graphql-server-express";
import { makeExecutableSchema } from "graphql-tools";
import cors from "cors";
import morgan from "morgan";
import { Server } from "socket.io";

import { setupPlugins } from "./plugins";
import mergedTypeDefs from "./api/typeDefs";
import { resolvers } from "./api/graphql";
import { scheduleJobs } from "./jobs";

dotenv.config();

process.on("unhandledRejection", err => {
  throw err;
});

export const app = express();

// Sentry setup
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });

  app.use(Sentry.Handlers.requestHandler());
}

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(compression());
app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

const server = new http.Server(app);
const io = new Server(server, {
  cors: {
    origin: "*:*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

import { isAdmin } from "./auth/auth";
import { authRoutes } from "./routes/auth";

app.get("/status", (req, res) => {
  res.status(200).send("Success");
});

app.use("/auth", authRoutes);

const schema = makeExecutableSchema({
  typeDefs: mergedTypeDefs,
  resolvers,
});

app.use(isAdmin);

app.use(
  "/graphql",
  graphqlExpress({
    schema,
  })
);

app.use(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql",
  })
);

app.all("*", (req, res) => {
  res.redirect("/graphql");
});

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

async function runSetup() {
  setupPlugins(io);
  await scheduleJobs();
}

runSetup()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Buzzer system started on port ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.log("App setup failed");
    throw error;
  });
