import "mocha";
import * as request from "supertest";
import * as express from "express";

// Mock config data
const ADMIN_KEY = "hello admin key whats up";
process.env.ADMIN_KEY_SECRET = ADMIN_KEY;

import { isAdmin } from "../middleware";

describe("Middleware", () => {

	describe("Basic Admin Key Auth", () => {

		const app = express();
		app.use("/admin", isAdmin, (req, res) => res.sendStatus(200));

		it("Rejects requests without a key.", done => {
			request(app)
				.get("/admin")
				.expect(401)
				.end(done);
		});

		it("Rejects requests with the wrong key.", done => {
			request(app)
				.get("/admin")
				.set("Authorization", "Basic af")
				.expect(401)
				.end(done);
		});

		it("Accepts requests with the right key.", done => {
			const key = Buffer.from(ADMIN_KEY).toString("base64");

			request(app)
				.get("/admin")
				.set("Authorization", `Basic ${key}`)
				.expect(200)
				.end(done);
		});
	});
});