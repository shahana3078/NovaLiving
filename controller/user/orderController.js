const Order = require("../../Models/orderModel");

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
        subtotal += item.productId.price * item.quantity;
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

// const orderDetails = async (req, res) => {
//   try {
//     const { orderId } = req.query;
//     const userId = req.session.userId;

//     const order = await Order.findOne({ _id: orderId, userId })
//       .populate("items.productId")
//       .populate({
//         path: "addressId",
//         select: "fullName mobile address city state pincode",
//       })
//       .lean();

//     if (!order) {
//       return res.redirect("/404");
//     }

//     let subtotal = 0;
//     order.items.forEach((item) => {
//       subtotal += item.productId.price * item.quantity;
//     });

//     const shippingCharge = order.shippingCharge || 50;
//     const grandTotal = subtotal + shippingCharge;

//     order.subtotal = subtotal;
//     order.shippingCharge = shippingCharge;
//     order.grandTotal = grandTotal;

//     res.render("User/orderDetails", { order });
//   } catch (error) {
//     console.log("Error while fetching order details:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };
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
      subtotal += item.productId.price * item.quantity;
    });

    const shippingCharge = order.shippingCharge || 50;
    const grandTotal = subtotal + shippingCharge;

    order.subtotal = subtotal;
    order.shippingCharge = shippingCharge;
    order.grandTotal = grandTotal;

    // ✅ Include returnRequest status
    const returnRequestStatus = order.returnRequest?.status || 'none';

    res.render("User/orderDetails", { order, returnRequestStatus });
  } catch (error) {
    console.log("Error while fetching order details:", error);
    res.status(500).send("Internal Server Error");
  }
};

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

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.returnRequest = {
      status: 'requested', 
      reason: returnReason,
      date: new Date()
    };

    await order.save();
    console.log('Updated Order:', order);

    res.json({ success: true, message: 'Return request submitted successfully' });
  } catch (error) {
    console.error('Error submitting return request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit return request.' });
  }
};




module.exports = {
  getOrder,
  orderDetails,
  cancelOrder,
  returnOrder,
  requestReturn
};
