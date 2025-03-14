
const mongoose=require('mongoose')


const cartSchema=new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
items: [
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        image: {
            type: String
        },
        deliveryDate: {
            type: Date,
            default: Date.now 
        }
    }
],
totalPrice: {
    type: Number,
    default: 0
}
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports=Cart