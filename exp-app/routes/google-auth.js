var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3001/auth/google/callback"
);
const TOKEN_NAME = "googleIdToken";
const Api = require("../lib/api/user-api");
const api = new Api();

router.get("/logout", function (req, res) {
  res.clearCookie(TOKEN_NAME);
  res.send("You are logged out");
});

router.get("/login", async function (req, res) {
  const authorizeUrl = client.generateAuthUrl({
    scope: ["profile", "email"],
  });
  res.redirect(authorizeUrl);
});

router.get("/callback", async function (req, res) {
  const code = req.query.code;

  try {
    const { tokens } = await client.getToken(code);
    const { id_token } = tokens;
    const decodedToken = jwt.decode(id_token);
    await api.addOrUpdateUser("google", decodedToken);
    res.cookie(TOKEN_NAME, id_token, {
      httpOnly: true,
      secure: process.env.HTTPS_ENABLED == "true" ? true : false,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Google OAuth failed:", error);
    res.redirect("/login");
  }
});

module.exports = router;
