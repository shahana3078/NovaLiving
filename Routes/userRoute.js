const express = require("express");
const passport=require('passport')
const router = express.Router();


const authController = require("../controller/user/authController.js");
const homeController = require("../controller/user/homeController.js");

const { requireLogin, userLogined } = require("../middlewares/auth.js");
router
  .route("/signup")
  .get(authController.getSignup)
  .post(authController.postSignup);

router.route("/otp/resend").post(authController.postResendOtp);

router
  .route("/")
  .get(userLogined, authController.getLogin)

  router.post('/login',authController.postLogin);

router
  .route("/verify-otp")
  .get(authController.getVerifyOtp)
  .post(authController.postVerifyOtp);

router
  .route("/home")

  .get(requireLogin, authController.getHome);

router
  .route("/forgot-password")
  .get(authController.getForgotPassword)
  .post(authController.postForgotPassword);

router
  .route("/forgot-password/:token")
  .get(authController.getForgotPassword)
  .post(authController.postForgotPassword);

router
  .route("/reset-password")
  .get(authController.getResetPassword)
  .post(authController.postResetPassword);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",authController.googleLogin);

router.get("/profile", (req, res) => {
  res.render("userDropdown.ejs");
});
 
router.get("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/");
});

router.route("/shop").get(requireLogin, homeController.getShop);

router.get("/product/details/:id", requireLogin,homeController.productDetails);

module.exports = router;
