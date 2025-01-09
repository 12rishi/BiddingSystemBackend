const {
  sellerItems,
  sellerAuths,
  biddingItems,
  highestBids,
  notificationModels,
  buyerAuths,
} = require("../model");
const { Op } = require("sequelize"); // Add this at the top of your file
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.handleHomePage = (req, res) => {
  res.status(200).json({
    message: "home page has been found",
  });
};
exports.handleAddItem = (req, res) => {
  try {
    const {
      itemName,
      description,
      category,
      startingPrice,
      location,
      delivery,
      deliveryRadius,
      deliveryCost,
      phoneNumber,
      availableForBidding,
    } = req.body;

    const files = req.files;
    const image = files.map((file) => {
      return `http://localhost:3000/${file.filename}`;
    });

    const itemdata = sellerItems.create({
      itemName,
      description,
      category,
      startingPrice,
      location,
      delivery,
      deliveryRadius: delivery === "available" ? deliveryRadius : null,
      deliveryCost: delivery === "available" ? 50 : null,
      phoneNumber: phoneNumber,
      availableForBidding,
      itemImages: image,
      sellerAuthId: req.userId,
    });
    console.log(req.userId);
    res.status(200).json({
      message: "successfully addedItem",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.handleEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      itemName,
      description,
      category,
      startingPrice,
      location,
      delivery,
      deliveryRadius,
      phoneNumber,
      availableForBidding,
    } = req.body;
    console.log("availabale for bidding", availableForBidding);
    const files = req.files;
    const image = files.map((file) => {
      return `http://localhost:3000/${file.filename}`;
    });
    console.log("hello i am inside edit", image);

    await sellerItems.update(
      {
        itemName,
        description,
        category,
        startingPrice,
        location,
        delivery,
        deliveryRadius: delivery === "available" ? deliveryRadius : null,
        deliveryCost: delivery === "available" ? 50 : null,
        phoneNumber,

        itemImages: image,
        sellerAuthId: req.userId,
      },
      {
        where: {
          id,
        },
      }
    );

    res.status(200).json({
      message: "Successfully edited",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.handleItemList = async (req, res) => {
  const { role } = req.params;

  try {
    let data;
    {
      role === "seller"
        ? (data = await sellerItems.findAll({
            where: {
              sellerAuthId: req.userId,
            },
          }))
        : (data = await biddingItems.findAll({
            where: {
              buyerAuthId: req.userId,
            },
            include: [
              {
                model: sellerItems,
                attributes: [
                  "id",
                  "itemName",
                  "description",
                  "category",
                  "itemImages",
                  "startingPrice",
                ],
              },
            ],
          }));
    }
    console.log(data);
    if (data.length == 0) {
      return res.status(400).json({
        message: "No items has been added till",
      });
    }

    res.status(200).json({
      message: "successfully fetched the items",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message,
    });
  }
};
exports.handleSingleItem = async (req, res) => {
  try {
    const { role, id } = req.params;

    // Ensure id is provided
    if (!id) {
      return res.status(400).json({
        message: "Item ID is required",
      });
    }

    const response = await sellerItems.findByPk(id);

    if (response) {
      return res.status(200).json({
        message: "Successfully fetched single item",
        data: response,
      });
    }

    return res.status(404).json({
      message: "No data found for the given ID",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.renderAllItem = async (req, res) => {
  const buyerId = req.userId;

  try {
    const previousBids = await biddingItems.findAll({
      where: {
        buyerAuthId: buyerId,
      },
      include: {
        model: sellerItems,
        attributes: ["category"],
      },
    });
    console.log(previousBids);

    const bidCategories = [
      ...new Set(previousBids.map((bid) => bid.sellerItem.category)),
    ];

    let itemsInBidCategories = [];
    if (bidCategories.length > 0) {
      itemsInBidCategories = await sellerItems.findAll({
        where: {
          category: {
            [Op.in]: bidCategories,
          },
        },
      });
    }

    const otherItems = await sellerItems.findAll({
      where: {
        category: {
          [Op.notIn]: bidCategories,
        },
      },
    });

    const allItems = [...itemsInBidCategories, ...otherItems];

    res.status(200).json({
      message: "successfully fetched the item",
      data: allItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.renderSingleItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(401).json({
        message: "invalid user",
      });
    }
    const data = await sellerItems.findAll({
      where: {
        id: id,
      },
    });
    if (data.length == 0) {
      return res.status(404).json({
        message: "No Content",
      });
    }
    res.status(200).json({
      message: "successfully got single item",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};
exports.renderBiddderSinglePage = async (req, res) => {
  console.log("hjhgfjengnergntngjrtngn");
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({
        message: "no data was found",
      });
    }
    const data = await biddingItems.findOne({
      where: {
        sellerItemId: id,
        buyerAuthId: req.userId,
      },
      include: [
        {
          model: sellerItems,
          attributes: [
            "itemName",
            "description",
            "startingPrice",
            "itemImages",
          ],
        },
      ],
    });
    console.log("hello", data);
    return res.status(200).json({
      message: "successfully fetched bidder single item",
      data: data,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "something went wrong",
      error: error?.message,
    });
  }
};
exports.handleBiddingItemData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Invalid ID provided",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const data = await biddingItems.findOne({
      where: {
        sellerItemId: id,
        buyerAuthId: req.userId,
      },
    });

    if (data) {
      return res.status(200).json({
        message: "Data found",
      });
    }

    return res.status(404).json({
      message: "No data found for the provided ID",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error?.message,
    });
  }
};
exports.renderNotification = async (req, res) => {
  try {
    const { role } = req.params;
    let response;
    let notificationLength;
    if (role === "seller") {
      response = await notificationModels.findAll({
        where: {
          sellerAuthId: req.userId,
        },

        include: [
          { model: buyerAuths },
          {
            model: sellerItems,
            include: [
              {
                model: sellerAuths,
              },
            ],
          },
        ],
      });
      notificationLength = await notificationModels.findAll({
        where: {
          sellerAuthId: req.userId,
          sellerClicked: false,
        },
      });
    } else if (role === "bidder") {
      console.log("hello");
      response = await notificationModels.findAll({
        where: {
          buyerAuthId: req.userId,
        },

        include: [
          { model: buyerAuths },
          {
            model: sellerItems,
            include: [
              {
                model: sellerAuths,
              },
            ],
          },
        ],
      });
      notificationLength = await notificationModels.findAll({
        where: {
          buyerAuthId: req.userId,
          buyerClicked: false,
        },
      });
    }

    console.log("i am ", role, notificationLength.length);

    res.status(200).json({
      message: "successfully fetched the highest bid ofr an item",
      data: response.reverse(),
      length: notificationLength.length,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.handleSingleHighestBid = async (req, res) => {
  try {
    const { role, id } = req.params;

    let response;
    if (role === "seller" || role === "bidder") {
      response = await notificationModels.findOne({
        where: {
          id: id,
        },
        include: [
          { model: buyerAuths },
          { model: sellerItems, include: [{ model: sellerAuths }] },
        ],
      });
    }
    if (response) {
      return res.status(200).json({
        message: "successfully fetched single highest bid data",
        data: response,
      });
    }
    return res.status(400).json({
      message: "no data has been found for given id",
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};
exports.handleCheckout = async (req, res) => {
  try {
    const productDetails = req.body;
    console.log(productDetails);
    const { id } = req.params;

    // Ensure the stripe object is correctly initialized
    if (!stripe) {
      throw new Error("Stripe is not initialized correctly.");
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${productDetails?.name}`,
              description: productDetails.description,
              metadata: {
                sellerId: String(productDetails.sellerId),
                buyerId: String(req.userId),
                highestBidId: String(id),
              },
            },
            unit_amount: Math.min(
              Math.round(50 * (productDetails.amount / 132.27)), // Convert to smallest unit (e.g., cents)
              99999999 // Max Stripe amount
            ),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://127.0.0.1:5173/successPayment?session_id={CHECKOUT_SESSION_ID}&highestBidId=${id}`,
      cancel_url: "http://127.0.0.1:5173/bidderHome?role=bidder",
    });

    console.log(session);
    if (session) {
      res.status(200).json({
        message: "successfully checked the payment",
        data: session.url,
      });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.handlePaymenyData = async (req, res) => {
  console.log("hello i am inside data");
  const { sessionId, highestBidId } = req.params;
  const [session, lineItems] = await Promise.all([
    stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.payment_method"], // Expand payment_intent to get payment_method details
    }),
    stripe.checkout.sessions.listLineItems(sessionId),
  ]);

  // Extract payment intent status
  const paymentIntent = session.payment_intent;
  const paymentStatus = paymentIntent.status;
  if (paymentStatus === "succeeded") {
    const data = await notificationModels.findByPk(highestBidId);
    data.paymentStatus = "success";
    await data.save();
  }
};
