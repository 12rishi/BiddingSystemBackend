module.exports = (sequelize, DataTypes) => {
  const SellerAuth = sequelize.define("sellerAuth", {
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
    },

    citizenship: {
      type: DataTypes.JSON,
      allowNull: false,
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
    citizenshipNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return SellerAuth;
};
