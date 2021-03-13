import "mocha";
import request from "supertest";
import express from "express";

import { isAdmin } from "../middleware";

// Mock config data
const ADMIN_KEY = "hello admin key whats up";
process.env.ADMIN_KEY_SECRET = ADMIN_KEY;

describe("Middleware", () => {
  describe("Basic Admin Key Auth", () => {
    const app = express();
    app.use("/admin", isAdmin, (req, res) => res.sendStatus(200));

    it("Rejects requests without a key.", done => {
      request(app).get("/admin").expect(401).end(done);
    });

    it("Rejects requests with the wrong key.", done => {
      request(app).get("/admin").set("Authorization", "Basic af").expect(401).end(done);
    });
  });
});
