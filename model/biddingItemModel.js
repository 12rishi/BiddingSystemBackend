module.exports = (sequelize, DataTypes) => {
  const BiddingItem = sequelize.define("biddingItem", {
    biddingprice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return BiddingItem;
};
