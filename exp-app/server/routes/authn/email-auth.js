var express = require("express");
var router = express.Router();
const Api = require("../../lib/api/user-api");
const api = new Api();
const validatePasswordString = require("../../lib/utils/password");
const jwt = require("jsonwebtoken");
const TOKEN_NAME = "emailIdToken";

// GETs
router.get("/forgot-password", function (req, res) {
  res.render("auth/forgot-password/index", {
    title: "Aarya: Forgot Password",
    csrfToken: req.csrfToken(),
  });
});

router.get("/login", function (req, res) {
  res.render("auth/login/index", {
    title: "Aarya: Login",
    csrfToken: req.csrfToken(),
  });
});

router.get("/signup", async function (req, res) {
  res.render("auth/signup/index", { title: "Aarya: Signup", csrfToken: req.csrfToken() });
});

router.get("/verification/:userId", async function (req, res) {
  const user = await api.findById(req.params.userId);
  // render a verified page if already verified
  // otherwise render the verification page
  res.render("auth/signup/verification", {
    title: "Aarya: Email verification",
    email: user.email,
    userId: req.params.userId,
    csrfToken: req.csrfToken(),
  });
});

router.get("/logout", function (req, res, next) {
  res.clearCookie(TOKEN_NAME);
  res.send("You are logged out");
});

// POSTs
router.post("/login", async function (req, res) {
  const { email, password } = req.body;
  const user = await api.findByEmail(email);
  if (user) {
    if (await api.matchPassword(password, user.passwordHash, user.salt)) {
      try {
        const token = await jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET);
        res.cookie(TOKEN_NAME, token, {
          httpOnly: true,
          secure: process.env.HTTPS_ENABLED == "true" ? true : false,
        });
        res.status(200).json({ next: "/" });
      } catch (e) {
        res.status(500).send(e.message);
      }
    } else {
      res.status(400).send({ message: "Incorrect password" });
    }
  } else {
    res.status(400).send({ message: "Incorrect username" });
  }
});

// signup
router.post("/signup", async function (req, res) {
  const { firstName, lastName, email, password } = req.body;
  const validationErrors = validatePasswordString(password);
  if (validationErrors.length > 0) {
    return res.status(400).send({ message: "Invalid password" });
  }
  try {
    const user = await api.findByEmail(email);
    let userId = null,
      isVerified = false,
      newUser = false;
    if (user) {
      userId = user._id.toString();
      isVerified = user.isVerified;
      console.log(`Attempt to use an existing email: ${email} having an Id: ${userId}`);
    } else {
      userId = await api.create(firstName, lastName, email, password);
      newUser = true;
      console.log(`New user created with Id: ${userId}`);
    }
    res.send({ userId: userId, newUser: newUser, isVerified: isVerified });
  } catch (e) {
    console.log(`Failed to created a new user: ${e.message}`);
    res.status(400).send({ message: e.message });
  }
});

router.post("/verification", async function (req, res) {
  try {
    console.log(req.body);
    const { code, userId } = req.body;
    await api.verifyEmail(userId, code);
  } catch (e) {
    console.log(e.message);
    return res.status(400).send({ message: e.message });
  }
  res.send({ message: "Email validated", next: "/login" });
});

module.exports = router;
