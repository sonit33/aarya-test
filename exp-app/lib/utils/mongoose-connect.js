const mongoose = require("mongoose");

async function connect(uri) {
  try {
    await mongoose.connect(uri);
    console.log(`mongo connected to ${uri}`);
  } catch (e) {
    console.error(`failed to connect mongo to ${uri}`);
  }
}

async function destroy() {
  if (mongoose.connection.db.databaseName.indexOf("-test") > -1) {
    await mongoose.connection.db.dropDatabase();
    console.log("dropped database");
  } else {
    console.log("fcuk u");
  }
}

async function disconnect() {
  await mongoose.connection.close();
}

module.exports = { connect, destroy, disconnect };
