module.exports = (sequelize, DataTypes) => {
  const SellerItem = sequelize.define("sellerItem", {
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startingPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    delivery: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryRadius: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryCost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    itemImages: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    availableForBidding: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return SellerItem;
};
