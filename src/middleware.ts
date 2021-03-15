import express from "express";

export function isAdmin(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  response.setHeader("Cache-Control", "private");

  const auth = request.headers.authorization;
  if (auth && typeof auth === "string" && auth.includes(" ")) {
    const key = auth.split(" ")[1];
    if (key === process.env.ADMIN_KEY_SECRET) {
      next();
    } else {
      response.status(401).json({
        error: "Incorrect auth token!",
      });
    }
  } else {
    response.status(401).json({
      error: "No auth token!",
    });
  }
}
