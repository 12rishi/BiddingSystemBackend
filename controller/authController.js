const { where } = require("sequelize");

const sendEmail = require("../utils/nodeMailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sellerAuths, buyerAuths, otpModels } = require("../model");
const handlingAuth = require("./handlingAuth");
exports.handleGenerateOTP = async (req, res) => {
  const { email } = req.body;
  const { role } = req.params;
  if (!email) {
    return res.status(400).json({
      message: "please provide the email",
    });
  }
  const otp = Math.floor(1000 + Math.random() * 9000);
  await otpModels.create({
    email,
    OTP: otp,
  });
  const emailData = {
    email: email,
    role: role,
    subject: "Verify Your Email",
    text: `Your OTP is ${otp}. Please don't share this with anyone.`,
  };
  await sendEmail(emailData);
};

exports.handleRegister = async (req, res) => {
  try {
    const { role } = req.params;
    const email = await handlingAuth(role, req);

    if (role === "seller" || role === "bidder") {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log("otp", otp);

      const emailData = {
        email: email,
        subject: "Verify Your Email",
        text: `Your OTP is ${otp}. Please don't share this with anyone.`,
      };
      await sendEmail(emailData);

      const authModel = role === "seller" ? sellerAuths : buyerAuths;
      const user = await authModel.findOne({ where: { email } });

      if (user) {
        user.Otp = otp;
        user.OtpgenerateTime = Date.now();
        await user.save();

        return res.status(200).json({
          message: "Successfully stored the data",
          email: user.email,
        });
      }
    }

    res.status(400).json({ message: "Invalid role or user creation failed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handleSendOtp = async (req, res) => {
  try {
    const { OTP } = req.body;
    const { email, role } = req.params;

    const authModel = role === "seller" ? sellerAuths : buyerAuths;
    const user = await authModel.findOne({
      where: { email, Otp: OTP },
    });

    if (!user) {
      return res.status(400).json({ message: "Please enter the correct OTP" });
    }

    const currentTime = Date.now();
    if (currentTime - user.OtpgenerateTime >= 120000) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.Otp = null;
    user.OtpgenerateTime = null;
    await user.save();

    res.status(200).json({ message: "Email has been verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handleLogin = async (req, res) => {
  try {
    const { role } = req.params;
    const { email, password } = req.body;

    const authModel = role === "seller" ? sellerAuths : buyerAuths;
    const user = await authModel.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Email is not registered" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Password did not match" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_KEY, {
      expiresIn: "20d",
    });

    res.status(200).json({
      message: "Successfully logged in",
      id: user.id,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.handleProfilePicture = async (req, res) => {
  const { role } = req.params;
  try {
    const profilePicture = "http://localhost:3000/" + req.file.filename;
    const userId = req.userId;
    let data;
    if (role === "seller") {
      data = await sellerAuths.findAll({
        where: {
          id: userId,
        },
      });
    } else if (role === "bidder") {
      data = await buyerAuths.findAll({
        whwre: {
          id: userId,
        },
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        message: "no user has beeen found",
      });
    }
    data[0].profilePicture = profilePicture;
    await data[0].save();
    return res.status(200).json({
      message: "successfully uploaded profile picture",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      error: error?.message,
    });
  }
};
exports.handleSingleProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { role } = req.params;
    let data;
    if (role === "seller") {
      data = await sellerAuths.findByPk(userId);
    } else if (role === "bidder") {
      data = await buyerAuths.findByPk(userId);
    }

    if (!data) {
      return res.status(400).json({
        message: "no user has been found",
      });
    }
    res.status(200).json({
      message: "successfully fetched single item",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};
