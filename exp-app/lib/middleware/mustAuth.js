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
      return next();
    } catch (e) {
      console.log("Google ID token verification failed: ", e.message);
      return res.redirect("/login");
    }
  } else if (emailIdToken) {
    try {
      jwt.verify(emailIdToken, process.env.JWT_SECRET);
      return next();
    } catch (err) {
      console.log(err.message);
      return res.redirect("/login");
    }
  } else {
    console.log("missing ID tokens");
    return res.redirect("/login");
  }
};
