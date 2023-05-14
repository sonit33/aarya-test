const db = require("./db");
const { promisify } = require("util");
var { randomBytes, pbkdf2, timingSafeEqual, randomUUID } = require("crypto");
const pbkdf2Async = promisify(pbkdf2);

module.exports = class User {
  makeSalt() {
    return randomBytes(16);
  }

  async makeHash(password, salt) {
    return await pbkdf2Async(password, salt, 310000, 32, "sha256");
  }

  verifyHash(source, target) {
    return timingSafeEqual(source, target);
  }

  async create(firstName, lastName, email, password) {
    try {
      const salt = this.makeSalt();
      const passwordHash = this.makeHash(password, salt);
      const userId = randomUUID();
      const qs = `insert into users(userId, 
        firstName,
        lastName,
        email,
        passwordHash,
        salt,
        timeCreated,
        isConfirmed) values(?,?,?,?,?,?,?,?)`;
      await db.run(qs, [
        userId,
        firstName,
        lastName,
        email,
        passwordHash,
        salt,
        Date.now().toString(),
        0,
      ]);
      return userId;
    } catch (e) {
      console.log(e);
      throw new Error("Create User Failed", e);
    }
  }
  async createWith(provider, userId, firstName, lastName, displayName, email, photoUrl) {}
  async retrieve(userId) {
    const result = await db.run("select * from users where user_id=?", [userId]);
    console.log(result);
  }
  async update(userId) {}
  async del(userId) {}
};
