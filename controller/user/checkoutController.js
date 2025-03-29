const Razorpay=require('Razorpay')
const Cart = require("../../Models/cartModel");
const Product = require("../../Models/productModel");
const Address = require("../../Models/addressModel");
const Order = require("../../Models/orderModel");
const Wallet=require('../../Models/walletModel')
const crypto = require("crypto");
const Coupon=require('../../Models/couponModel')


const getCheckout = async (req, res) => {
  try {
    const userId = req.session.userId;

    const addresses = await Address.find();

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const wallet=await Wallet.findOne({userId})
 
    let totalPrice = 0;
    let cartItems = [];

    if (cart) {
      cartItems = cart.items.map((item) => {

        let originalPrice=item.productId.price;
        let discountPercentage=0
        let offerPrice=originalPrice;
        

        if (item.productId.offer?.isActive && item.productId.offer.discountPercentage > 0) {
          discountPercentage = item.productId.offer.discountPercentage;
          offerPrice = originalPrice - (originalPrice * discountPercentage) / 100;
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
          originalPrice:originalPrice,
          offerPrice:offerPrice,
          quantity: item.quantity,
          image: item.image,
          description: item.productId.description,
          discountPercentage: discountPercentage,
          deliveryDate: deliveryDate,
         
          
        };
      });
    }

    res.render("User/checkOut", {
      addresses,
      cartItems,
      totalPrice,
      wallet,
    
    
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
      return res.status(400).json({ success: false, message: "Payment method is required." });
  }

  try {
      const cart = await Cart.findOne({ userId });

      if (!cart) {
          return res.status(404).json({ success: false, message: "Cart not found." });
      }

      cart.paymentMethod = paymentMethod; 
      await cart.save(); 

      res.json({ success: true, message: "Payment method updated successfully." });
  } catch (err) {
      console.error("Error updating payment method:", err);
      res.status(500).json({ success: false, message: "Server error." });
  }
};


const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.session.userId;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let subtotal = cart.items.reduce((sum, item) => {
      let price = item.productId.price;
      if (item.productId.offer?.isActive) {
        price -= (price * item.productId.offer.discountPercentage) / 100;
      }
      return sum + item.quantity * price;
    }, 0);

    let grandTotal = subtotal + 50;
    let discountAmount = 0;

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid or expired coupon code." });
    }

    discountAmount = coupon.discountValue; 

    if (discountAmount > grandTotal) {
      discountAmount = grandTotal; 
    }

    grandTotal -= discountAmount;

    res.json({
      success: true,
      message: "Coupon applied successfully.",
      discountAmount,
      newTotal: grandTotal,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const razorPayCreateOrder = async (req, res) => {
  const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const userId = req.session.userId;

  try {
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
          return res.status(404).json({ status: "failed", message: "Cart is empty or not found." });
      }

      let totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.productId.price, 0);
      const shipping = 50;


      totalPrice = Math.floor(totalPrice + shipping);

      const options = {
          amount: totalPrice * 100,
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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

  if (expectedSignature === razorpay_signature) {
      return res.redirect(`/confirm-razorpay-payment?orderId=${req.body.orderId}`);
  }

  res.status(400).json({ success: false, message: "Payment verification failed." });
};




const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, razorpay_payment_id, razorpay_order_id, razorpay_signature, couponCode } = req.body;
    const userId = req.session.userId;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      let price = item.productId.price;

      if (item.productId.offer?.isActive && item.productId.offer.discountPercentage > 0) {
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
    let discountAmount = 0;

    // **Apply Coupon Discount (Fixed Amount)**
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

      if (coupon) {
        discountAmount = coupon.discountValue; // Fixed amount discount

        if (discountAmount > grandTotal) {
          discountAmount = grandTotal; // Ensure discount doesn't exceed total amount
        }

        grandTotal -= discountAmount;
      } else {
        return res.status(400).json({ success: false, message: "Invalid or expired coupon code." });
      }
    }

    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ userId });

      if (!wallet || wallet.balance < grandTotal) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance." });
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
        return res.status(400).json({ success: false, message: "Payment verification failed." });
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

module.exports={
    getCheckout,
    placeOrder,
    orderConfirmed,
    updatePaymentMethod,
    razorPayCreateOrder,
    confirmPaymentRazorPay,
    applyCoupon
}

