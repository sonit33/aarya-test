const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ID tokens contain all the claims e.g. userId, email, etc.
module.exports = async function (req, res, next) {
  const { emailIdToken, googleIdToken } = req.cookies;
  if (googleIdToken) {
    try {
      await client.verifyIdToken({
        idToken: googleIdToken,
        audience: GOOGLE_CLIENT_ID,
      });
      req.body.idToken = jwt.decode(googleIdToken);
      return next();
    } catch (e) {
      if (req.isXMLHttpRequest) {
        return res.status(401).send({ message: "login again" });
      } else {
        return res.redirect("/login");
      }
    }
  } else if (emailIdToken) {
    try {
      jwt.verify(emailIdToken, process.env.JWT_SECRET);
      req.body.idToken = jwt.decode(emailIdToken);
      return next();
    } catch (err) {
      if (req.isXMLHttpRequest) {
        return res.status(401).send({ message: "login again" });
      } else {
        return res.redirect("/login");
      }
    }
  } else {
    if (req.isXMLHttpRequest) {
      return res.status(400).send({ message: "missing tokens" });
    } else {
      return res.redirect("/login");
    }
  }
};
