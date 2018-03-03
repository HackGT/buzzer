import * as express from "express";

import config from "./config";

export function isAdmin(
	request: express.Request,
	response: express.Response,
	next: express.NextFunction
) {
	response.setHeader("Cache-Control", "private");
	const auth = request.headers.authorization;

	if (auth && typeof auth === "string" && auth.indexOf(" ") > -1) {
		const key = new Buffer(auth.split(" ")[1], "base64").toString();
		if (key === config.secrets.admin) {
			next();
		}
		else {
			response.status(401).json({
				"error": "Incorrect auth token!"
			});
		}
	}
	else {
		response.status(401).json({
			"error": "No auth token!"
		});
	}
}
