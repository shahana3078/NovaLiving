
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
  
  },
  categoryName: {
    type: String,
    required: true,
    unique: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

isDeleted: { 
  type: Boolean, default: false 
},
offer: {
  discountPercentage: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
},

});

module.exports = mongoose.model('Category', categorySchema);
