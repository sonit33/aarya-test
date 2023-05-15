const { promisify } = require("util");
const model = require("../schema/user-schema");
var { randomBytes, pbkdf2, timingSafeEqual, randomInt } = require("crypto");
const pbkdf2Async = promisify(pbkdf2);

module.exports = class User {
  makeSalt() {
    return randomBytes(16);
  }

  makeSixDigitCode() {
    return randomInt(100000, 999999).toString();
  }

  async makeHash(password, salt) {
    return await pbkdf2Async(password, salt, 310000, 32, "sha256");
  }

  verifyHash(source, target) {
    return timingSafeEqual(source, target);
  }

  async insert(firstName, lastName, email, passwordHash, salt) {
    const user = new model({
      provider: "email",
      email: email,
      firstName: firstName,
      lastName: lastName,
      passwordHash: passwordHash,
      salt: salt,
      verificationCode: this.makeSixDigitCode(),
    });
    await user.save();
    return user._id;
  }

  async insertWith(provider, firstName, lastName, displayName, email, photoUrl) {
    const user = new model({
      provider: provider,
      email: email,
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      photoUrl: photoUrl,
      isVerified: true,
    });
    await user.save();
    return user._id;
  }

  async create(firstName, lastName, email, password) {
    try {
      const salt = this.makeSalt();
      const passwordHash = this.makeHash(password, salt);
      const userId = this.insert(userId, firstName, lastName, email, passwordHash, salt);
      return userId;
    } catch (e) {
      console.log(e);
      throw new Error("Create User Failed", e);
    }
  }

  async createWith(provider, firstName, lastName, displayName, email, photoUrl) {
    try {
      const userId = await this.insertWith(
        provider,
        firstName,
        lastName,
        displayName,
        email,
        photoUrl
      );
      return userId;
    } catch (e) {
      console.log(e);
      throw new Error(`Create User with ${provider} failed`, e);
    }
  }

  async findByEmail(email) {
    const user = await model.findOne({ email: email }).exec();
    return user;
  }

  async findById(userId) {
    const user = await model.findOne({ _id: userId }).exec();
    return user;
  }

  async findCode(userId) {
    const user = await this.findById(userId);
    return user.verificationCode;
  }

  async verifyEmail(userId, code) {
    const user = await this.findById(userId);
    if (user.code == code) {
      user.updateOne({ isVerified: true });
    } else {
      const msg = `Email verification failed for ${userId} with code ${code}`;
      console.log(msg);
      throw new Error(msg);
    }
  }
};