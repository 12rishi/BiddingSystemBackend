module.exports = (sequelize, DataTypes) => {
  const NotificationModel = sequelize.define("notificationModel", {
    clicked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bidAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sellerClicked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    buyerClicked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
  });
  return NotificationModel;
};
