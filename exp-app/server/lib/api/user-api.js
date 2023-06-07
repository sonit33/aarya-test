const { promisify } = require("util");
const model = require("../schema/user-schema");
var { randomBytes, pbkdf2, timingSafeEqual, randomInt } = require("crypto");
const pbkdf2Async = promisify(pbkdf2);

module.exports = class User {
  makeSalt() {
    return randomBytes(16).toString("hex");
  }

  makeSixDigitCode() {
    return randomInt(100000, 999999).toString();
  }

  async makeHashAsync(password, salt) {
    if (!password) throw new Error("empty password");
    if (!salt) throw new Error("empty salt");
    return (await pbkdf2Async(password, salt, 310000, 32, "sha256")).toString("hex");
  }

  verifyHash(source, target) {
    if (!source) throw new Error("empty password");
    if (!target) throw new Error("empty salt");
    return timingSafeEqual(Buffer.from(source, "utf-8"), Buffer.from(target, "utf-8"));
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
    return user._id.toString();
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
      verificationCode: this.makeSixDigitCode(),
    });
    await user.save();
    return user._id.toString();
  }

  async create(firstName, lastName, email, password) {
    try {
      const salt = this.makeSalt();
      const passwordHash = await this.makeHashAsync(password, salt);
      const userId = await this.insert(firstName, lastName, email, passwordHash, salt);
      return userId;
    } catch (e) {
      throw new Error(`Create User Failed: ${e.message}`);
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
      throw new Error(`Create User with ${provider} failed: ${e.message}`);
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
    if (user.verificationCode.trim() !== code.trim()) {
      throw new Error(`Email verification failed for ${userId} with code ${code}`);
    }
    await user.updateOne({ isVerified: true });
  }

  async generateNewCode(userId) {
    const user = await this.findById(userId);
    const code = this.makeSixDigitCode();
    await user.updateOne({ verificationCode: code, isVerified: false });
    return code;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.findById(userId);
    if (!(await this.matchPassword(oldPassword, user.passwordHash, user.salt))) {
      throw new Error(`Old password is incorrect for user: ${userId}`);
    }
    await user.updateOne({ passwordHash: await this.makeHashAsync(newPassword, user.salt) });
  }

  async resetPassword(userId, code, newPassword) {
    const user = await this.findById(userId);
    if (!user.verificationCode == code)
      throw new Error(`Invalid verification code for user: ${userId}`);
    await user.updateOne({ passwordHash: await this.makeHashAsync(newPassword, user.salt) });
  }

  async matchPassword(password, passwordHash, salt) {
    const cookedHash = await this.makeHashAsync(password, salt);
    return this.verifyHash(cookedHash, passwordHash);
  }

  async destruct(userId) {
    const user = await this.findById(userId);
    await user.deleteOne({ _id: userId });
  }

  async addChild(parentId, childId) {
    const user = await this.findById(parentId);
    const child = await this.findById(childId);
    user.children.push(child);
    await user.updateOne({ children: user.children });
  }

  async addOrUpdateUser(provider, decodedToken) {
    try {
      const { email, given_name, family_name, name, picture } = decodedToken;
      const user = await this.findByEmail(email);
      if (user) {
        await user.updateOne({
          firstName: given_name,
          lastName: family_name,
          displayName: name,
          photoUrl: picture,
        });
        return user._id.toString();
      } else {
        return await this.createWith(provider, given_name, family_name, name, email, picture);
      }
    } catch (e) {
      throw new Error(`Failed to add or update user: ${e.message}`);
    }
  }
};
