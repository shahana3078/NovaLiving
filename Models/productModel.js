
const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true
    },
    category: {
        type: String,
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

    dateAdded: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
         type: Boolean, default: false
         } 

});

productSchema.index({ name: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
