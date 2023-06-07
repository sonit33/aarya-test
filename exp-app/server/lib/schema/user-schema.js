const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  provider: {
    type: String,
    required: true,
    enum: ["email", "facebook", "google"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  firstName: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  displayName: {
    type: String,
    required: false,
    maxLength: 255,
  },
  photoUrl: {
    type: String,
    required: false,
    maxLength: 512,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  verificationCode: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 8,
  },
  timeCreated: { type: String, default: Date.now().toString() },
  passwordHash: String,
  salt: String,
  children: [{ type: mongoose.Types.ObjectId }],
});

module.exports = mongoose.model("Users", userSchema);
