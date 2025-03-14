const mongoose=require('mongoose')

const wishlistSchema= new mongoose.Schema({
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
          addedDate: {
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
  
const Wishlist=mongoose.model('Wishlist',wishlistSchema)
module.exports=Wishlist