const router = require("express").Router();
const {
  handleRegister,
  handleSendOtp,
  handleLogin,
  handleProfilePicture,
  handleSingleProfile,
} = require("../controller/authController");
const { handleAuthenticate } = require("../middleware/authenticateMiddleware");
const { multer, storage } = require("../middleware/multer");
const upload = multer({ storage: storage });
router.route("/register/:role").post(upload.array("images", 2), handleRegister);
router.route("/sendotp/:email/:role").post(handleSendOtp);
router.route("/login/:role").post(handleLogin);
router
  .route("/profilePicture/:role")
  .post(
    handleAuthenticate,
    upload.single("profilePicture"),
    handleProfilePicture
  );
router
  .route("/singleProfile/:role")
  .get(handleAuthenticate, handleSingleProfile);
module.exports = router;
