const express = require("express");
const passport=require('passport')
const router = express.Router();


const authController = require("../controller/user/authController.js");
const homeController = require("../controller/user/homeController.js");
const addressController=require("../controller/user/addressController.js")
const cartController=require('../controller/user/cartController.js')
const profileController=require('../controller/user/profileController.js')
const orderController=require('../controller/user/orderController.js')

const { requireLogin, userLogined,preventBackToOrder,noCache } = require("../middlewares/auth.js");
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

router.get("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/");
});

router.route("/shop").get(requireLogin, homeController.getShop);

router.get("/product/details/:id", requireLogin,homeController.productDetails);


router.get('/address',addressController.getAddresses)
router.post('/address',addressController.addAddress)

router.post('/remove-address/:id',addressController.removeAddress)
router.get('/edit-address/:id',addressController.getEditAddress)
router.put('/edit-address/:id',addressController.updateAddress)

router.get('/cart',cartController.getCart)
router.post('/cart/add',cartController.addCart)
router.post('/cart/remove', cartController.removeProductFromCart)
router.post('/cart/update-quantity',cartController.updateQuantity)

router.get('/profile',profileController.getUserProfile)
router.get('/my-profile',profileController.getMyProfile)
router.post('/update-profile',profileController.updateProfile)

router.get('/checkout', cartController.getCheckout)
router.post('/place-order',cartController.placeOrder)
router.get('/order-confirmed',cartController.orderConfirmed)

router.get('/orders',orderController.getOrder )
router.get('/order/details',orderController.orderDetails)
router.post('/cancel-order/:orderId',orderController.cancelOrder)




module.exports = router;
