var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
const User = require("../lib/user");
const user = new User();

// Configure password authentication strategy
passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    // db.get("SELECT * FROM users WHERE username = ?", [username], function (err, row) {
    //   if (err) {
    //     return cb(err);
    //   }
    //   if (!row) {
    //     return cb(null, false, { message: "Incorrect username." });
    //   }
    //   crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", function (err, hashedPassword) {
    //     if (err) {
    //       return cb(err);
    //     }
    //     if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
    //       return cb(null, false, { message: "Incorrect password." });
    //     }
    //     return cb(null, row);
    //   });
    // });
  })
);

// Configure session management.
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// GETs
router.get("/forgot-password", function (req, res) {
  res.render("auth/forgot-password/index", {
    title: "Aarya: Forgot Password",
    csrfToken: req.csrfToken(),
  });
});

router.get("/login", function (req, res) {
  res.render("auth/login/index", { title: "Aarya: Login", csrfToken: req.csrfToken() });
});

router.get("/signup", async function (req, res) {
  res.render("auth/signup/index", { title: "Aarya: Signup", csrfToken: req.csrfToken() });
});

// POSTs

// This route authenticates the user by verifying a username and password.
router.post(
  "/login",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  })
);

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
