module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "",
  DB: "biddingSystem",
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 1800000, // 60 seconds
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
