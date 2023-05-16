var express = require("express");
var app = express();
var createError = require("http-errors");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var csrf = require("csurf");
var passport = require("passport");
require("dotenv").config();

const db = require("./lib/utils/mongoose-connect");
(async function () {
  await db(process.env.MONGO_APP);
})();

const MongoStore = require("connect-mongo");

// view engine setup
app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrf({ cookie: true }));
app.use(express.static("./public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true, // don't save session if unmodified
    saveUninitialized: true, // don't create session until something stored
    store: MongoStore.create({ mongoUrl: process.env.MONGO_SESSION }),
  })
);
// app.use(passport.authenticate("session"));
app.use(passport.session());
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
var emailAuthRouter = require("./routes/email-auth");
var googleAuthRouter = require("./routes/google-auth");
// var facebookAuthRouter = require("./routes/facebook-auth");

app.use("/", indexRouter);
app.use("/", emailAuthRouter);
app.use("/", googleAuthRouter);
// app.use("/", facebookAuthRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
