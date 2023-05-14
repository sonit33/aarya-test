var express = require("express");
var app = express();
var createError = require("http-errors");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var csrf = require("csurf");
var passport = require("passport");
var logger = require("morgan");
require("dotenv").config();
var rfs = require("rotating-file-stream");

var SQLiteStore = require("connect-sqlite3")(session);

// view engine setup
app.set("views", "./views");
app.set("view engine", "pug");

var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: "./var/logs",
});

app.use(logger("combined", { stream: accessLogStream }));
app.use(express.json());
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(csrf({ cookie: true }));
app.use(express.static("./public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  })
);
app.use(passport.authenticate("session"));
app.use(function (req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// set routes
var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var googleAuthRouter = require("./routes/google-auth");
// var facebookAuthRouter = require("./routes/facebook-auth");

app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", googleAuthRouter);
// app.use("/", facebookAuthRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
