const {
  handleAddItem,
  handleItemList,
  handleSingleItem,
  handleEdit,
  renderAllItem,
  renderSingleItem,
  renderBiddderSinglePage,
  handleBiddingItemData,
  handleHomePage,

  renderNotification,
  handleSingleHighestBid,
  handleCheckout,
  handlePaymenyData,
} = require("../controller/itemController");
const { handleAuthenticate } = require("../middleware/authenticateMiddleware");
const { multer, storage } = require("../middleware/multer");
const router = require("express").Router();
const upload = multer({ storage: storage });

router
  .route("/item/:role")
  .post(handleAuthenticate, upload.array("itemImages", 4), handleAddItem)
  .get(handleAuthenticate, handleItemList);
router.route("/item/:role/:id").get(handleAuthenticate, handleSingleItem);
router
  .route("/edit/:role/:id")
  .post(handleAuthenticate, upload.array("itemImages", 4), handleEdit);
router.route("/bidderItems/:role").get(handleAuthenticate, renderAllItem);
router
  .route("/bidderItems/:role/:id")
  .get(handleAuthenticate, renderSingleItem);
router
  .route("/singleBidderItem/:role/:id")
  .get(handleAuthenticate, renderBiddderSinglePage);

router
  .route("/biddingItems/:role/:id")
  .get(handleAuthenticate, handleBiddingItemData);
router.route("/home/:role").get(handleAuthenticate, handleHomePage);
router.route("/notification/:role").get(handleAuthenticate, renderNotification);
router
  .route("/singleHighestBid/:role/:id")
  .get(handleAuthenticate, handleSingleHighestBid);
router.route("/checkout/:role/:id").post(handleAuthenticate, handleCheckout);
router
  .route("/session/:role/:sessionId/:highestBidId")
  .get(handleAuthenticate, handlePaymenyData);

module.exports = router;
