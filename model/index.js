const dbConfig = require("../config/dbConfig");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: 3306,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected!");
  })
  .catch((err) => {
    console.log("Error" + err);
  });
const db = {};

db.Sequelize = Sequelize;
db.sellerAuths = require("./sellerAuthModel")(sequelize, DataTypes);
db.otpModels = require("./otpModel")(sequelize, DataTypes);
db.buyerAuths = require("./buyerAuthModel")(sequelize, DataTypes);
db.sellerItems = require("./sellerItemModel")(sequelize, DataTypes);
db.biddingItems = require("./biddingItemModel")(sequelize, DataTypes);
db.highestBids = require("./highestBidModel")(sequelize, DataTypes);
db.notificationModels = require("./notificationModel")(sequelize, DataTypes);
db.sellerAuths.hasMany(db.sellerItems);
db.sellerItems.belongsTo(db.sellerAuths);
db.buyerAuths.hasMany(db.biddingItems);
db.biddingItems.belongsTo(db.buyerAuths);
db.sellerItems.hasMany(db.biddingItems);
db.biddingItems.belongsTo(db.sellerItems);
db.sellerItems.hasMany(db.highestBids);
db.highestBids.belongsTo(db.sellerItems);
db.buyerAuths.hasMany(db.highestBids);
db.highestBids.belongsTo(db.buyerAuths);
db.sellerItems.hasMany(db.notificationModels);
db.notificationModels.belongsTo(db.sellerItems);
db.sellerAuths.hasMany(db.notificationModels);
db.notificationModels.belongsTo(db.sellerAuths);
db.buyerAuths.hasMany(db.notificationModels);
db.notificationModels.belongsTo(db.buyerAuths);

db.sequelize = sequelize;
db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done");
});
module.exports = db;
