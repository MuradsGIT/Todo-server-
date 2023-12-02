const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const UserModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});
// static register
UserModel.statics.signup = async function (email, password) {
  // validation
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  if (!validator.isEmail(email)) {
    throw Error("Enter a valid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Enter a stronger password");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hash });
  return user;
};

// static login
UserModel.statics.login = async function (email, password) {
  // validation
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("User does not exist");
  }
  const match = await bcrypt.compare(password, user.password)
  if(!match){
    throw Error('Incorrect password')
  }
  return user
};

module.exports = mongoose.model("users", UserModel);
