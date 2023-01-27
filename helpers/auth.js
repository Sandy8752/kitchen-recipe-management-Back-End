var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { SESSION_KEY, ACCESS_KEY, REFRESH_KEY } = process.env;

const saltRounds = 12;

async function hashPassword(password) {
  var salt = await bcrypt.genSalt(saltRounds);
  var hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function hashCompare(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

let createToken = {
  session: (payload) => {
    return jwt.sign(payload, SESSION_KEY, { expiresIn: "8h" });
  },

  // Token for Password reset.
  access: (payload) => {
    return jwt.sign(payload, ACCESS_KEY, { expiresIn: "15m" });
  },
};

module.exports = { hashPassword, hashCompare, createToken };