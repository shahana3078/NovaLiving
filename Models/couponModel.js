const mongoose=require('mongoose')

const CouponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  minimumPrice: {
    type: Number,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
    default: 1,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
});

const Coupon = mongoose.model("Coupon", CouponSchema);
module.exports=Coupon