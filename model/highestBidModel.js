module.exports = (sequelize, DataTypes) => {
  const HighestBidModel = sequelize.define("highestBid", {
    highestBiddingprice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return HighestBidModel;
};
