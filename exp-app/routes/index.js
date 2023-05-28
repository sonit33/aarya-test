var express = require("express");
var router = express.Router();
const mustAuth = require("../lib/middleware/mustAuth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/secure", mustAuth, function (err, req, res) {
  res.send("hello");
});

module.exports = router;
