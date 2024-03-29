import express from "express";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { Strategy as GroundTruthStrategy } from "passport-ground-truth";

import { app } from "../app";
import { IUser, User } from "../schema";

dotenv.config();

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
if (process.env.PRODUCTION === "true") {
  app.enable("trust proxy");
} else {
  console.warn("OAuth callback(s) running in development mode");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("Session secret not specified");
}

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

export function isAdmin(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void {
  response.setHeader("Cache-Control", "private");
  const user = request.user as IUser;
  const auth = request.headers.authorization;

  if (auth && typeof auth === "string" && auth.includes(" ")) {
    const key = auth.split(" ")[1];
    if (key === process.env.ADMIN_KEY_SECRET) {
      next();
    } else {
      response.status(401).json({
        error: "Incorrect auth token",
      });
    }
  } else if (!request.isAuthenticated() || !request.user) {
    if (request.session) {
      request.session.returnTo = request.originalUrl;
    }
    response.redirect("/auth/login");
  } else if (!user.admin) {
    response.status(403).json({
      error: "You must be an admin to access this endpoint",
    });
  } else {
    next();
  }
}

passport.use(
  new GroundTruthStrategy(
    {
      clientID: process.env.GROUND_TRUTH_CLIENT_ID,
      clientSecret: process.env.GROUND_TRUTH_CLIENT_SECRET,
      baseURL: process.env.GROUND_TRUTH_URL,
      callbackURL: "/auth/login/callback",
    },
    async (req, accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ email: profile.email });

      if (!user) {
        user = new User({
          uuid: profile.uuid,
          token: profile.token,
          name: profile.name,
          email: profile.email,
          admin: false,
        });
      } else {
        user.token = accessToken;
        user.uuid = profile.uuid;
      }

      await user.save();
      done(null, user);
    }
  )
);

passport.serializeUser<string>((user, done) => {
  done(null, user.uuid);
});
passport.deserializeUser<string>(async (id, done) => {
  User.findOne({ uuid: id }, (err: any, user: any) => {
    done(err, user);
  });
});

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

declare module "express-session" {
  interface Session {
    returnTo?: string;
  }
}
