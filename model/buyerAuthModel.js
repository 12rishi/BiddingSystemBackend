module.exports = (sequelize, DataTypes) => {
  const BuyerAuth = sequelize.define("buyerAuth", {
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    OtpgenerateTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return BuyerAuth;
};
