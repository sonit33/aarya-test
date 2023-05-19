var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
const Api = require("../lib/api/user-api");
const api = new Api();
const validatePasswordString = require("../lib/utils/password");

// Configure password authentication strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
    },
    async function verify(email, password, done) {
      const user = await api.findByEmail(email);
      if (user) {
        if (await api.matchPassword(password, user.passwordHash, user.salt)) {
          done(user);
        } else {
          done(null, false, { message: "Incorrect password" });
        }
      } else {
        done(null, false, { message: "Incorrect username" });
      }
    }
  )
);

// Configure session management
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

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
    messages: req.session.messages,
  });
});

router.get("/signup", async function (req, res) {
  res.render("auth/signup/index", { title: "Aarya: Signup", csrfToken: req.csrfToken() });
});

router.get("/verification/:userId", async function (req, res) {
  console.log(req.params.userId);
  const user = await api.findById(req.params.userId);
  console.log(user);
  res.render("auth/signup/verification", {
    title: "Aarya: Email verification",
    email: user.email,
    csrfToken: req.csrfToken(),
  });
});

// POSTs
router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info, status) {
    if (err) {
      return next(err);
    }
    if (info.message) {
      res.status(400).send({ message: info.message });
    } else {
      res.status(200).send(user);
    }
  })(req, res, next);
});

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
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
    let userId = "",
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

module.exports = router;

// ref: https://github.com/passport/todos-express-password/blob/master/routes/auth.js
