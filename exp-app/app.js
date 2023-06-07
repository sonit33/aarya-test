var express = require("express");
var app = express();
// var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var csrf = require("csurf");
const cors = require("cors");
const port = 3001;
require("dotenv").config();

const { connect } = require("./server/lib/utils/mongoose-connect");
(async function () {
  await connect(process.env.MONGO_APP);
})();

// view engine setup
app.set("views", "./server/views");
app.set("view engine", "pug");

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrf({ cookie: true }));
app.use(express.static("./public"));
app.locals.basedir = path.join(__dirname, "public");

app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  // handle CSRF token errors here
  res.status(403);
  res.send("Invalid CSRF token");
});

app.use(function (req, res, next) {
  const requestedWithHeader = req.headers["x-requested-with"];
  req.isXMLHttpRequest = requestedWithHeader === "XMLHttpRequest";
  next();
});

// set routes
var indexRouter = require("./server/routes/index");
var emailAuthRouter = require("./server/routes/authn/email-auth");
var googleAuthRouter = require("./server/routes/authn/google-auth");
var chatRouter = require("./server/routes/chat");
// var facebookAuthRouter = require("./routes/facebook-auth");

app.use("/", indexRouter);
app.use("/", emailAuthRouter);
app.use("/auth/google", googleAuthRouter);
app.use("/chat", chatRouter);
// app.use("/", facebookAuthRouter);

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// module.exports = app;

app.listen(port, () => console.log(`server started on port:${port}`));
