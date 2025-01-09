module.exports = (sequelize, DataTypes) => {
  const OtpModel = sequelize.define("otpModel", {
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return OtpModelModel;
};
