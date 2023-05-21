var express = require("express");
var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth2").Strategy;
var db = require("../lib/schema/user-schema");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/callback/google",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log(profile);
      // create a new profile user
      return done();
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    console.log("serializeUser:", user);
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user, cb) {
  console.log("deserializeUser:", user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

var router = express.Router();

router.get("/login/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get(
  "/callback/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.post("/logout/google", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
