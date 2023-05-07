import express from "express";
import { scriptsRoot, defaultStyles } from "../lib/env-loader.js";
const authRouter = express.Router();

authRouter.get("/login", (req, res) => {
  res.render("public/auth/page", {
    context: "login",
    pageTitle: "Login",
    stylesHref: defaultStyles(),
    scriptsSrc: `${scriptsRoot()}/login.js`,
  });
});

authRouter.get("/signup", (req, res) => {
  res.render("public/auth/page", {
    context: "signup",
    pageTitle: "Signup",
    stylesHref: defaultStyles(),
  });
});

authRouter.post("/signup", (req, res) => {
  console.log(req.body);
  res.status(200).send({ message: "all good" });
});

authRouter.get("/forgot-password", (req, res) => {
  res.render("public/auth/page", {
    context: "forgot-password",
    pageTitle: "Forgot password?",
    stylesHref: defaultStyles(),
  });
});

export default authRouter;
