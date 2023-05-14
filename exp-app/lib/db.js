var sqlite3 = require("sqlite3");

var db = new sqlite3.Database("./var/db/app.db");

db.serialize(function () {
  // create the database schema for the app
  db.run(
    "CREATE TABLE IF NOT EXISTS users ( \
    userId TEXT PRIMARY KEY, \
    email TEXT UNIQUE, \
    provider TEXT, \
    timeCreated TEXT, \
    photoUrl TEXT, \
    firstName TEXT, \
    lastName TEXT, \
    isConfirmed INTEGER, \
    passwordHash BLOB, \
    salt BLOB \
  )"
  );

  db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);");
});

module.exports = db;
