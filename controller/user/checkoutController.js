const Razorpay = require("razorpay");
const Cart = require("../../Models/cartModel");
const Product = require("../../Models/productModel");
const Address = require("../../Models/addressModel");
const Order = require("../../Models/orderModel");
const Wallet = require("../../Models/walletModel");
const crypto = require("crypto");
const Coupon = require("../../Models/couponModel");

const getCheckout = async (req, res) => {
  try {
    const userId = req.session.userId;

    const addresses = await Address.find();

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const wallet = await Wallet.findOne({ userId });
    const coupons = await Coupon.find({
      isDeleted: false,
      expirationDate: { $gte: new Date() },
    });

    let totalPrice = 0;
    let cartItems = [];

    if (cart) {
      cartItems = cart.items.map((item) => {
        let originalPrice = item.productId.price;
        let discountPercentage = 0;
        let offerPrice = originalPrice;

        if (
          item.productId.offer?.isActive &&
          item.productId.offer.discountPercentage > 0
        ) {
          discountPercentage = item.productId.offer.discountPercentage;
          offerPrice =
            originalPrice - (originalPrice * discountPercentage) / 100;
        }
        totalPrice += item.quantity * offerPrice;

        const date = item.date ? new Date(item.date) : new Date();

        date.setDate(date.getDate() + 7);

        const deliveryDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return {
          name: item.productId.name,
          originalPrice: originalPrice,
          offerPrice: offerPrice,
          quantity: item.quantity,
          image: item.image,
          description: item.productId.description,
          discountPercentage: discountPercentage,
          deliveryDate: deliveryDate,
        };
      });
      totalPrice = Math.round(totalPrice);
    }

    res.render("User/checkOut", {
      addresses,
      cartItems,
      totalPrice,
      wallet,
      coupons,
    });
  } catch (err) {
    console.error("Error loading checkout page:", err);
    res.status(500).send("Server error while loading the checkout page.");
  }
};

const updatePaymentMethod = async (req, res) => {
  const { paymentMethod } = req.body;
  const userId = req.session.userId;

  if (!paymentMethod) {
    return res
      .status(400)
      .json({ success: false, message: "Payment method is required." });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    cart.paymentMethod = paymentMethod;
    await cart.save();

    res.json({
      success: true,
      message: "Payment method updated successfully.",
    });
  } catch (err) {
    console.error("Error updating payment method:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isDeleted: false,
      expirationDate: { $gte: new Date() },
    });
    res.render("User/checkOut", { coupons });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching coupons", error });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode, totalPrice } = req.body;

    if (!couponCode) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ couponCode, isDeleted: false });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired coupon" });
    }

    if (new Date(coupon.expirationDate) < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired" });
    }

    if (totalPrice < coupon.minimumPrice) {
      return res.status(400).json({
        success: false,
        message: `This coupon is only applicable for orders of ₹${coupon.minimumPrice} or more.`,
      });
    }

    const discountedPrice = Math.max(totalPrice - coupon.discountPrice, 0);

    res.json({
      success: true,
      discountPrice: coupon.discountPrice,
      newTotalPrice: discountedPrice,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const razorPayCreateOrder = async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const userId = req.session.userId;
  const { couponCode } = req.body;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", message: "Cart is empty or not found." });
    }

    let subtotal = 0;
    cart.items.forEach((item) => {
      let price = item.productId.price;

      if (
        item.productId.offer?.isActive &&
        item.productId.offer.discountPercentage > 0
      ) {
        price -= (price * item.productId.offer.discountPercentage) / 100;
      }

      subtotal += item.quantity * price;
    });

    const shipping = 50;
    let totalPrice = Math.floor(subtotal + shipping);

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode, isDeleted: false });
      if (coupon) {
        discountAmount = coupon.discountPrice;
        if (discountAmount > totalPrice) {
          discountAmount = totalPrice;
        }
        totalPrice -= discountAmount;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired coupon code." });
      }
    }


    const options = {
      amount: Math.floor(totalPrice * 100), 
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    order.key_id = process.env.RAZORPAY_KEY_ID;

    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
};

const confirmPaymentRazorPay = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.redirect(
      `/confirm-razorpay-payment?orderId=${req.body.orderId}`
    );
  }

  res
    .status(400)
    .json({ success: false, message: "Payment verification failed." });
};

const placeOrder = async (req, res) => {
  try {
    const {
      addressId,
      paymentMethod,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      couponCode,
    } = req.body;

    const userId = req.session.userId;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      let price = item.productId.price;

      if (
        item.productId.offer?.isActive &&
        item.productId.offer.discountPercentage > 0
      ) {
        price -= (price * item.productId.offer.discountPercentage) / 100;
      }

      subtotal += item.quantity * price;

      return {
        productId: item.productId._id,
        name: item.productId.name,
        price: price,
        quantity: item.quantity,
      };
    });

    const shippingCharge = 50;
    let grandTotal = subtotal + shippingCharge;


    let couponUsed = false;
    let discountAmount = 0;

    
    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode, isDeleted: false });
    
      if (coupon) {
        couponUsed = true;
        discountAmount = coupon.discountPrice;
    
        if (discountAmount > grandTotal) {
          discountAmount = grandTotal;
        }
    
        grandTotal -= discountAmount;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired coupon code." });
      }
    }
    

    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ userId });

      if (!wallet || wallet.balance < grandTotal) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient wallet balance." });
      }

      wallet.balance -= grandTotal;
      wallet.transactions.push({
        amount: grandTotal,
        type: "debit",
        description: "Order Payment",
      });

      await wallet.save();
    }

    if (paymentMethod === "razorpay") {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res
          .status(400)
          .json({ success: false, message: "Payment verification failed." });
      }
    }

    const order = new Order({
      userId,
      addressId,
      items: orderItems,
      subtotal,
      shippingCharge,
      discountAmount,
      grandTotal,
      couponCode,
      couponUsed,             // <-- NEW
    couponDiscount: discountAmount,
      paymentMethod,
      orderDate: Date.now(),
      status: "Pending",
    });

    await order.save();
    await Cart.updateOne({ userId }, { $set: { items: [] } });

    res.json({
      success: true,
      message: "Order placed successfully",
      newTotal: grandTotal,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const orderConfirmed = (req, res) => {
  res.render("User/orderConfirmation", {
    message: "Your order has been confirmed!",
  });
};

module.exports = {
  getCheckout,
  placeOrder,
  orderConfirmed,
  updatePaymentMethod,
  razorPayCreateOrder,
  confirmPaymentRazorPay,
  getCoupon,
  applyCoupon,
};
