const { promisify } = require("util");
const { sellerAuths, buyerAuths } = require("../model");

const jwt = require("jsonwebtoken");
const { buyerId } = require("../utils/buyerId");
const { sellerId } = require("../utils/sellerId");
exports.handleAuthenticate = async (req, res, next) => {
  try {
    const storagetoken = req.headers["authorization"];

    if (!storagetoken) {
      return res.status(401).json({
        message: "invalid token",
      });
    }

    const token = storagetoken.split(" ")[1];
    const validateToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_KEY
    );
    const { role } = req.params;
    let data;
    if (role === "bidder") {
      data = await buyerAuths.findByPk(validateToken.userId);
      if (data) {
        buyerId.id = validateToken.userId;
      }
    } else if (role === "seller") {
      data = await sellerAuths.findByPk(validateToken.userId);
      if (data) {
        sellerId.id = validateToken.userId;
      }
    }

    if (!data) {
      return res.status(401).json({
        message: "invaild user",
      });
    }
    req.userId = validateToken.userId;

    next();
  } catch (error) {
    res.status(401).json({
      message: "invalid user",
    });
  }
};
