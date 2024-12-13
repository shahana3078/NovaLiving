const Cart=require('../../Models/cartModel')
const Product= require('../../Models/productModel')



const getCart = async (req, res) => {
    try {
        const userId = req.session.userId; 
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.render('User/cart', { items: [], totalPrice: 0 });
        }

        res.render('User/cart', {
            items: cart.items.map(item => ({
                name: item.name,
                productId: item.productId._id,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
                image: item.image,
                
            })),
            totalPrice: cart.totalPrice
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('An error occurred while loading the cart.');
    }
};



const addCart = async (req, res) => {
  const { productId } = req.body;  
  const userId = req.session.userId;  

  try {
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      let cart = await Cart.findOne({ userId });
      if (!cart) {
          cart = new Cart({ userId, items: [] });
      }

      const existingItem = cart.items.find(item => item.productId.toString() === productId);

      if (existingItem) {
          existingItem.quantity += 1;
      } else {
          cart.items.push({
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.images[0]
              
          });
      }

      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

      await cart.save();

      res.json({ message: 'Product added to cart', cart });
  } catch (error) {
      console.error('Error adding product to cart:', error);
      res.status(500).json({ message: 'An error occurred while adding the product to the cart.' });
  }
};

const removeProductFromCart = async (req, res) => {
    
    const { productId } = req.body;
   
    const userId = req.session.userId; 
    
    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        await cart.save();
        res.status(200).json({ message: 'Product removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred', error: err.message });
    }
};













module.exports={
  getCart,
  addCart,
   removeProductFromCart
  
 
}