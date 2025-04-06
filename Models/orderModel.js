const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    default: null,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  subtotal: {
    type: Number,
    required: true,
  },
  shippingCharge: {
    type: Number,
    required: true,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled", "returned",'confirmed'],
    default: "pending",
  },
  deliveryDate: {
    type: Date,
    default: Date.now,
  },
  cancelReason: {
    type: String,
    required: false,
  },
  returnReason: { 
    type: String, 
    default: ""
   },
   returnRequest: { 
    status: { type: String, enum: ['requested', 'approved', 'rejected'] },
    reason: { type: String } 
},

paymentMethod: {
  type: String,
  enum: ['cash on delivery', "razorpay", "wallet", "payment failed"],
  default: "cash on delivery",
  required: true,
 },
},
{ timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
