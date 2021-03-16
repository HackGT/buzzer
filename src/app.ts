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
import typeDefs from "./api/typeDefs";
import { isAdmin } from "./api/middleware";
import { resolvers } from "./api/graphql";
import { scheduleJobs } from "./jobs";

dotenv.config();

process.on("unhandledRejection", err => {
  throw err;
});

const app = express();

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

const schema = makeExecutableSchema({
  typeDefs,
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
