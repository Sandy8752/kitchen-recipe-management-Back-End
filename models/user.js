var { Schema, model } = require("mongoose");
var validator = require("validator");

const userSchema = new Schema(
  {
    userName: { type: String, required: [true, " Please enter your name"] },
    email: {
      type: String,
      lowercase: true,
      required: [true, "Please enter an email address"],
      unique: true,
      validate: (value) => {
        return validator.isEmail(value);
      },
    },
    password: {
      type: String,
      min: 8,
      required: [true, "please enter your password"],
    },
  },
  { timestamps: true }
);

const userDetails = model("users", userSchema);

module.exports = { userDetails };