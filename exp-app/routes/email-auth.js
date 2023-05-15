var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
const User = require("../lib/api/user-api");
const user = new User();

// Configure password authentication strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
    },
    async function verify(email, password, done) {
      const found = await user.findByEmail(email);
      if (found) {
        const cookedHash = await user.makeHash(password, found.salt);
        if (user.verifyHash(cookedHash, found.passwordHash)) {
          done(null, found);
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

// POSTs
router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info, status) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("auth/login/index", {
        title: "Aarya: Login",
        csrfToken: req.csrfToken(),
        message: info.message,
      });
    }
    res.redirect("/");
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
  console.log(firstName, lastName);
  const userId = await user.create(firstName, lastName, email, password);
  res.send({ userId: userId });
});

module.exports = router;

// ref: https://github.com/passport/todos-express-password/blob/master/routes/auth.js
