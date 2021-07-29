import express from "express";
import fetch from "node-fetch";
import passport from "passport";

export const authRoutes = express.Router();

authRoutes.get("/login", passport.authenticate("groundtruth"));

authRoutes.route("/login/callback").get((req, res, next) => {
  if (req.query.error === "access_denied") {
    res.redirect("/auth/login");
    return;
  }

  passport.authenticate("groundtruth", {
    failureRedirect: "/",
    successReturnToOrRedirect: "/",
  })(req, res, next);
});

authRoutes.route("/check").get((req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(400).json({ success: false });
  }
});

authRoutes.route("/logout").all(async (req, res) => {
  if (req.user) {
    try {
      await fetch(new URL("/api/user/logout", process.env.GROUND_TRUTH_URL).toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${req.user.token}`,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      req.logout();
    }
  }

  res.redirect("/auth/login");
});
