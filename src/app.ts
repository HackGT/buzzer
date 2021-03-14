import express from "express";
import compression from "compression";
import dotenv from "dotenv";
import http from "http";
import { graphqlExpress, graphiqlExpress } from "graphql-server-express";
import { makeExecutableSchema } from "graphql-tools";
import cors from "cors";
import morgan from "morgan";

import config from "./config";
import { setupPlugins } from "./plugins";
import typeDefs from "./typeDefs";
import { isAdmin } from "./middleware";
import { resolvers } from "./graphql";
import { scheduleAll } from "./schedule";

dotenv.config();

const SOCKET_OPTIONS = {
  handlePreflightRequest: (req: any, res: any) => {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
  allowUpgrades: true,
  transports: ["polling", "websocket"],
  origins: "*:*",
};

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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const io = require("socket.io")(SOCKET_OPTIONS).listen(server);

io.origins((origin: any, callback: any) => callback(null, true));

process.on("unhandledRejection", err => {
  throw err;
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(
  "/graphql",
  isAdmin,
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
  await scheduleAll();
}

runSetup()
  .then(() => {
    server.listen(config.port, () => {
      console.log(`Buzzer system started on port ${config.port}`);
    });
  })
  .catch(error => {
    console.log("App setup failed");
    throw error;
  });

export default app;
