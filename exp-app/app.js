var express = require("express");

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");

var app = express();

app.use("/", indexRouter);
app.use("/", authRouter);

module.exports = app;
