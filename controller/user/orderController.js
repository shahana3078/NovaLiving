const Order = require("../../Models/orderModel");
const Wallet = require("../../Models/walletModel");

const getOrder = async (req, res) => {
  try {
    const userId = req.session.userId;

    const orders = await Order.find({ userId })
      .populate({
        path: "addressId",
        select: "fullName mobile address city state pincode",
      })
      .populate("items.productId")
      .sort({ orderDate: -1 })

      .lean();

    orders.forEach((order) => {
      let subtotal = 0;

      order.items.forEach((item) => {
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

        item.originalPrice = originalPrice;
        item.offerPrice = offerPrice;
        item.discountPercentage = discountPercentage;

        subtotal += offerPrice * item.quantity;
      });

      const shippingCharge = 50;
      order.grandTotal = subtotal + shippingCharge;
    });

    res.render("User/order", { orders });
  } catch (error) {
    console.log("Error while fetching order details:", error);
    res.status(500).send("Internal Server Error");
  }
};

const orderDetails = async (req, res) => {

  try {
    const { orderId } = req.query;
    const userId = req.session.userId;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate("items.productId")
      .populate({
        path: "addressId",
        select: "fullName mobile address city state pincode",
      })
      .lean();

    if (!order) {
      return res.redirect("/404");
    }

    let subtotal = 0;
    order.items.forEach((item) => {
      let originalPrice = item.productId.price;
      let discountPercentage = 0;
      let offerPrice = originalPrice;

      if (
        item.productId.offer?.isActive &&
        item.productId.offer.discountPercentage > 0
      ) {
        discountPercentage = item.productId.offer.discountPercentage;
        offerPrice = originalPrice - (originalPrice * discountPercentage) / 100;
      }

      item.originalPrice = originalPrice;
      item.offerPrice = offerPrice;
      item.discountPercentage = discountPercentage;

      subtotal += offerPrice * item.quantity;
    });

    const shippingCharge = order.shippingCharge || 50;
    const grandTotal = subtotal + shippingCharge;

    order.subtotal = subtotal;
    order.shippingCharge = shippingCharge;
    order.grandTotal = grandTotal;

    const returnRequestStatus = order.returnRequest?.status || "none";

    res.render("User/orderDetails", { order, returnRequestStatus });
  } catch (error) {
    console.log("Error while fetching order details:", error);
    res.status(500).send("Internal Server Error");
  }
};

// cancel order


const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;

    console.log("req.body", req.body);

    const order = await Order.findByIdAndUpdate(orderId, {
      orderStatus: "cancelled",
      cancelReason: cancelReason || "No reason provided",
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.orderStatus = "cancelled";
    order.cancelReason = cancelReason || "No reason provided";
    await order.save();

    if (order.paymentMethod === "razorpay") {
      let wallet = await Wallet.findOne({ userId: order.userId });

      if (!wallet) {
        wallet = new Wallet({
          userId: order.userId,
          balance: 0,
          transactions: [],
        });
      }

      const alreadyCredited = wallet.transactions.some(
        (t) => t.description === `Refund for cancelled order #${order._id}`
      );

      if (!alreadyCredited) {
        wallet.balance += order.grandTotal;

        wallet.transactions.push({
          amount: order.grandTotal,
          type: "credit",
          description: `Refund for cancelled order #${order._id}`,
        });

        await wallet.save();
      }
    }

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//return order

const returnOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { returnReason } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, {
      orderStatus: "returned",
      returnReason: returnReason || "No reason provided",
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.orderStatus = "returned";
    order.returnReason = returnReason || "No reason provided";
    await order.save();

    if (order.paymentMethod === "razorpay") {
      let wallet = await Wallet.findOne({ userId: order.userId });

      if (!wallet) {
        wallet = new Wallet({
          userId: order.userId,
          balance: 0,
          transactions: [],
        });
      }

      const alreadyCredited = wallet.transactions.some(
        (t) => t.description === `Refund for returned order #${order._id}`
      );

      if (!alreadyCredited) {
        wallet.balance += order.grandTotal;

        wallet.transactions.push({
          amount: order.grandTotal,
          type: "credit",
          description: `Refund for returned order #${order._id}`,
        });

        await wallet.save();
      }
    }

    res.json({ success: true, message: "Order returned successfully" });
  } catch (error) {
    console.error("Error returning order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const requestReturn = async (req, res) => {
  const { orderId, returnReason } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.returnRequest = {
      status: "requested",
      reason: returnReason,
      date: new Date(),
    };

    await order.save();

    res.json({
      success: true,
      message: "Return request submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting return request:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit return request." });
  }
};

module.exports = {
  getOrder,
  orderDetails,
  cancelOrder,
  returnOrder,
  requestReturn,
};

