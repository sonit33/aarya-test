var express = require("express");
var router = express.Router();

router.get("/forgot-password", function (req, res) {
  res.render("auth/forgot-password/index", { title: "Forgot Password" });
});

router.get("/login", function (req, res) {
  res.render("auth/login/index", { title: "Login" });
});

router.get("/signup", async function (req, res) {
  res.render("auth/signup/index", { title: "Signup" });
});

module.exports = router;
