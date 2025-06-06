
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
        min: [0, 'Stock cannot be negative']
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
         } ,
    offer: {
            discountPercentage: { type: Number, default: 0 }, 
            isActive: { type: Boolean, default: true} 
        }
         

});

productSchema.index({ name: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
