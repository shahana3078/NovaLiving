
const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true
    },
   
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [{ 
        type: String 
    }] ,

    addedDate: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
         type: Boolean, 
         default: false
         } 
         

});

productSchema.index({ name: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
