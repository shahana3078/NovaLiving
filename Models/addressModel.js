const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,   
    },
    mobile: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },  
    address: {
       type: String,
        required: true 
      },
    landmark: { 
      type: String
     },
    city: {
       type: String, 
       required: true
       },
    state: {
       type: String,
       required: true 
      },
      defaultAddress: {
        type: Boolean,
        default: false,
      }
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
