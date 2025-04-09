const PDFDocument = require("pdfkit");

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

        item.originalPrice = Math.round(originalPrice);
        item.offerPrice =Math.round(offerPrice);
        item.discountPercentage = discountPercentage;

        subtotal += offerPrice * item.quantity;
      });

      const shippingCharge = 50;
      order.grandTotal = Math.round(subtotal + shippingCharge);
    });

    res.render("User/order", { orders });
  } catch (error) {
    console.log("Error while fetching order details:", error);
    res.status(500).send("Internal Server Error");
  }
};


//dowload invoice

const generateInvoicePDF = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.session.userId;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate("items.productId")
      .populate("addressId")
      .lean();

    if (!order) return res.status(404).send("Order not found");

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id}.pdf`);
    doc.pipe(res);

    const primaryColor = "#02360e";
    const bgColor = "#f0f5f0";
    const lightGray = "#e0e0e0";
    const textGray = "#333";

    doc.rect(0, 0, doc.page.width, 40).fill(primaryColor);
    doc.fillColor("white").fontSize(20).text("Novaliving", 50, 10);
    doc.fillColor("white").fontSize(16).text("INVOICE", { align: "right" });
    doc.moveDown(1);

    const addr = order.addressId;

    doc.fillColor(primaryColor).fontSize(13).text("Sold By:", 50, doc.y);
    doc.fontSize(11).fillColor(textGray)
      .text("NOVALIVING RETAIL PRIVATE LIMITED", 50)
      .text("BROADVIEW CONSTRUCTIONS AND HOLDINGS PVT LTD.", 50)
      .text("Survey No. 153/1 153/2226/2,229/2,230/2", 50)
      .text("Chettipalayam, Oratakuppai Village, Palladam Main Road", 50)
      .text("COIMBATORE, TAMIL NADU, 641201", 50);

    doc.fillColor(primaryColor).fontSize(13).text("Billing Address:", 400, 90);
    doc.fontSize(11).fillColor(textGray)
      .text(`${addr.fullName}`, 400)
      .text(`${addr.address}, ${addr.city}`, 400)
      .text(`${addr.state} - ${addr.pincode}`, 400)
      .text(`Mobile: ${addr.mobile}`, 400);

    doc.moveDown(2);

    doc.fillColor(primaryColor).fontSize(13).text("Order Details:", { underline: true });
    doc.fontSize(11).fillColor(textGray)
      .text(`Order ID: ${order._id}`)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`)
      .text(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString("en-IN")}`)
      .text(`Payment Method: ${order.paymentMethod}`);

    doc.moveDown();

    const tableTop = doc.y;
    const headers = [
      { label: "No", x: 50, width: 30 },
      { label: "Description", x: 90, width: 150 },
      { label: "Price", x: 250, width: 60 },
      { label: "Qty", x: 310, width: 40 },
      { label: "Discount", x: 360, width: 60 },
      { label: "Net", x: 430, width: 50 },
      { label: "Total", x: 500, width: 90 },
    ];

    doc.fillColor(lightGray).rect(45, tableTop, 545, 25).fill();
    doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor);

    headers.forEach(h =>
      doc.text(h.label, h.x, tableTop + 7, { width: h.width, align: "left" })
    );

    let y = tableTop + 30;
    let subtotal = 0;

    order.items.forEach((item, i) => {
      const product = item.productId;
      const qty = item.quantity;
      const originalPrice = product.price;
      let offerPrice = originalPrice;
      let discount = 0;

      if (product.offer?.isActive && product.offer.discountPercentage > 0) {
        discount = product.offer.discountPercentage;
        offerPrice = originalPrice - (originalPrice * discount) / 100;
      }

      const net = Math.round(offerPrice);
      const total = net * qty;
      subtotal += total;

      if (i % 2 === 0) {
        doc.fillColor("#f9f9f9").rect(45, y - 2, 545, 20).fill();
      }

      doc.font("Helvetica").fontSize(10).fillColor(textGray);
      doc.text(`${i + 1}`, headers[0].x, y, { width: headers[0].width });
      doc.text(product.name, headers[1].x, y, { width: headers[1].width });
      doc.text(`${originalPrice.toFixed(2)}`, headers[2].x, y, { width: headers[2].width });
      doc.text(`${qty}`, headers[3].x, y, { width: headers[3].width });
      doc.text(`${discount}%`, headers[4].x, y, { width: headers[4].width });
      doc.text(`${net.toFixed(2)}`, headers[5].x, y, { width: headers[5].width });
      doc.text(`${total.toFixed(2)}`, headers[6].x, y, { width: headers[6].width });

      y += 22;
      doc.moveTo(45, y - 2).lineTo(590, y - 2).strokeColor("#dddddd").stroke();
    });

    const shipping = order.shippingCharge || 50;
    const grandTotal = subtotal + shipping;

    y += 10;

    doc.moveTo(400, y).lineTo(570, y).strokeColor("#cccccc").stroke();
    y += 10;

    doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor);
    doc.text("Subtotal:", 400, y, { width: 100, align: "right" });
    doc.text(`${subtotal.toFixed(2)}`, 510, y, { align: "right" });

    y += 20;
    doc.text("Shipping:", 400, y, { width: 100, align: "right" });
    doc.text(`${shipping.toFixed(2)}`, 510, y, { align: "right" });

    y += 20;
    doc.fillColor("#000000").fontSize(12);
    doc.text("Grand Total:", 400, y, { width: 100, align: "right" });
    doc.text(`${grandTotal.toFixed(2)}`, 510, y, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).send("Failed to generate invoice.");
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

  item.originalPrice = Math.round(originalPrice);
  item.offerPrice =Math.round( offerPrice);
  item.discountPercentage = discountPercentage;

  subtotal += offerPrice * item.quantity;
});


    const shippingCharge = order.shippingCharge || 50;
    const grandTotal = Math.round(subtotal + shippingCharge);



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
  generateInvoicePDF
};

