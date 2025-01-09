const express = require("express");

const app = express();
const authRoute = require("./routes/authRoute");
const itemRoute = require("./routes/itemRoute");
const { Server } = require("socket.io");
const cron = require("node-cron");
require("./model/index");
require("dotenv").config();
const cors = require("cors");
const {
  sellerItems,
  sequelize,
  biddingItems,
  buyerAuths,
  highestBids,
  notificationModels,
  sellerAuths,
} = require("./model/index");
const { buyerId } = require("./utils/buyerId");
const { sellerId } = require("./utils/sellerId");
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.static("./storage/"));

app.use(express.urlencoded({ extended: false }));
// app.use(express.static("./"));
app.use("/", authRoute);
app.use("/", itemRoute);
let io;

const server = app.listen(3000, () => {
  console.log("server has started at port number 3000");
});
const sellerSocketId = {};
const buyerSocketId = {};
cron.schedule("59 11 * * *", async () => {
  console.log("hello");
  try {
    const allItems = await sellerItems.findAll({
      where: {
        availableForBidding: "available",
      },
    });

    for (let i = 0; i < allItems.length; i++) {
      try {
        const allBiddingItems = await biddingItems.findAll({
          where: {
            sellerItemId: allItems[i].id,
          },

          order: [
            ["biddingprice", "DESC"],
            ["createdAt", "ASC"],
          ],
        });

        if (allBiddingItems.length > 0) {
          await highestBids.create({
            highestBiddingprice: allBiddingItems[0].biddingprice,
            sellerItemId: allBiddingItems[0].sellerItemId,
            buyerAuthId: allBiddingItems[0].buyerAuthId,
          });
          await notificationModels.create({
            bidAmount: allBiddingItems[0].biddingprice,
            sellerAuthId: allItems[i].sellerAuthId,
            buyerAuthId: allBiddingItems[0].buyerAuthId,
            sellerItemId: allItems[i].id,
          });
        }
      } catch (error) {
        console.error(
          `Error processing seller item ID ${allItems[i].id}:`,
          error
        );
      }
    }
    const data = await sellerItems.findAll({
      where: {
        availableForBidding: ["available", "notAvailable"],
      },
    });

    if (data.length <= 0) {
      throw new Error("no data is present");
    }
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].availableForBidding === "available") {
          data[i].availableForBidding = "completed";
        } else if (data[i].availableForBidding === "notAvailable") {
          data[i].availableForBidding = "available";
        }

        await data[i].save({ transaction: t });
      }
    });
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  console.log("connection has been established with" + socket.id);
  const id = socket.id;

  socket.on("hello", (role) => {
    if (id && role === "seller") {
      const sellerId1 = sellerId.id && sellerId.id;

      sellerSocketId[sellerId1] = id;
      console.log(sellerSocketId);
      if (sellerSocketId) {
        console.log("sellerId is ", sellerId.id);
        console.log("i am inside notification");
      }
    } else if (id && role === "bidder") {
      const buyerId1 = buyerId.id && buyerId.id;

      buyerSocketId[buyerId1] = id;
      console.log(buyerSocketId);
      if (buyerSocketId) {
        console.log("buyerId is ", buyerId.id);
        console.log("i am inside notification");
      }
    }
  });

  socket.on("biddingAmount", async (data) => {
    console.log(data.biddingAmount);
    const { id: bidderId } = buyerId;
    const data1 = await biddingItems.findOne({
      where: {
        sellerItemId: data.data.id,
        buyerAuthId: bidderId,
      },
    });
    if (!data1) {
      const data2 = await biddingItems.create({
        sellerItemId: data.data.id,
        buyerAuthId: bidderId,
        biddingprice: data.biddingAmount,
      });
    }
  });
  socket.on("sendBiddingData", async (itemId) => {
    try {
      const response = await biddingItems.findAll({
        where: {
          sellerItemId: itemId,
        },
        include: [
          {
            model: buyerAuths,
            attributes: ["userName", "email", "phoneNumber", "profilePicture"],
          },
        ],
      });
      console.log(response);
      socket.emit("fetchBiddingData", response);
    } catch (error) {
      console.error("Error fetching bidding data:", error);

      socket.emit("biddingDataError", "Failed to fetch bidding data");
    }
  });
  socket.on("editBidding", async (editData) => {
    console.log(editData);
    console.log(buyerId);
    if (editData !== null) {
      const data = await biddingItems.findOne({
        where: {
          sellerItemId: editData.id,
          buyerAuthId: buyerId.id,
        },
      });
      console.log(data);
      if (data) {
        data.biddingprice = editData.bidAmount;
        await data.save();
      }
    }
  });
  socket.on("sellerClicked", async (id) => {
    console.log("i am clicked");
    await notificationModels.update(
      {
        sellerClicked: true,
      },
      {
        where: {
          sellerClicked: false,
          sellerAuthId: id,
        },
      }
    );
  });
  socket.on("bidderClicked", async (id) => {
    await notificationModels.update(
      {
        buyerClicked: true,
      },
      {
        where: {
          buyerClicked: false,
          buyerAuthId: id,
        },
      }
    );
  });
  socket.on("numberOfBids", async (id) => {
    const length = await biddingItems.count({
      where: {
        sellerItemId: id,
      },
    });
    socket.emit("countedLength", length);
  });
  socket.on("sellerClicked", async (id) => {
    const data = await notificationModels.findAll({
      where: {
        sellerAuthId: id,
        sellerClicked: false,
      },
    });
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        data[i].sellerClicked = true;
        await data[i].save();
      }
    }
  });
  socket.on("bidderClicked", async (id) => {
    const data = await notificationModels.findAll({
      where: {
        buyerAuthId: id,
        buyerClicked: false,
      },
    });
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        data[i].buyerClicked = true;
        await data[i].save();
      }
    }
  });
  socket.on("sendStatus", async (id) => {
    const data = await notificationModels.findOne({
      where: {
        id: id,
      },
    });
    const value = data.paymentStatus;
    socket.emit("receivedStatus", value);
  });
  socket.on("messageSend", async (data) => {
    console.log(data);
    let receiverData;
    if (data.role === "seller") {
      console.log("hello");
      console.log(sellerSocketId[data.senderId]);
      console.log(buyerSocketId[data.receiverId]);
      if (buyerSocketId[data.receiverId] && sellerSocketId[data.senderId]) {
        receiverData = await buyerAuths.findAll({
          where: {
            id: data.receiverId,
          },
        });
        io.to(buyerSocketId[data.receiverId]).emit("messageReceived", {
          text: data.text,
          receiverData,
        });
      }
    }
    if (data.role === "bidder") {
      console.log(buyerSocketId[data.senderId]);
      console.log(sellerSocketId[data.receiverId]);
      if (buyerSocketId[data.senderId] && sellerSocketId[data.receiverId]) {
        receiverData = await sellerAuths.findAll({
          where: {
            id: data.receiverId,
          },
        });
        io.to(sellerSocketId[data.receiverId]).emit("messageReceived", {
          text: data.text,
          receiverData,
        });
      }
    }
  });
  socket.on("disconnect", () => {
    console.log("client has disconnected", id);
  });
});
