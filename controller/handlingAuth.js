const { where } = require("sequelize");
const { sellerAuths, buyerAuths } = require("../model");
const sendEmail = require("../utils/nodeMailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const handlingAuth = async (role, req) => {
  const { userName, email, password, confirmPassword, phoneNumber } = req.body;

  if (!userName || !email || !password || !confirmPassword) {
    throw new Error("Provide all the credentials");
  }

  if (password !== confirmPassword) {
    throw new Error("Password did not match");
  }

  if (role === "seller" && req.files) {
    const files = req.files;
    if (files.length !== 2) {
      throw new Error("Exactly 2 citizenship documents must be uploaded.");
    }

    const filesImage = files.map((file) => file.filename);
    const data1 = await sellerAuths.create({
      userName,
      email,
      password: await hashPassword(password),
      phoneNumber,
      citizenship: filesImage,
    });
    return email;
  } else if (role === "bidder") {
    const data1 = await buyerAuths.create({
      userName,
      email,
      password: await hashPassword(password),
      phoneNumber,
    });
    return email;
  }

  throw new Error("Invalid role provided");
};

module.exports = handlingAuth;
