const Cart = require("../../Models/cartModel");
const Product = require("../../Models/productModel");
const Address = require("../../Models/addressModel");
const Order = require("../../Models/orderModel");
const Razorpay=require('Razorpay')


const getCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const cart = await Cart.findOne({
      userId,
    }).populate("items.productId");

    if (!cart) {
      return res.render("User/cart", { items: [], totalPrice: 0 });
    }

    res.render("User/cart", {
      items: cart.items.map((item) => ({
        name: item.name,
        productId: item.productId._id,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        image: item.image,
      })),
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send("An error occurred while loading the cart.");
  }
};

//ADD TO CART

const addCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock === 0) {
      return res.status(400).json({ message: "The product is out of stock" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity >= 5) {
        return res.status(400).json({
          message: "You can only add a maximum of 5 of this product.",
        });
      }
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      message: "An error occurred while adding the product to the cart.",
    });
  }
};

//REMOVE

const removeProductFromCart = async (req, res) => {
  const { productId } = req.body;

  const userId = req.session.userId;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({ message: "Product removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
};

//UPDATE QUANTITY

const updateQuantity = async (req, res) => {
  const { productId, action } = req.body;
  const userId = req.session.userId;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }
    const cartItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "product not found" });
    }
    if (action === "increment") {
      if (cartItem.quantity >= 5) {
        return res
          .status(400)
          .json({ message: "Maximum quantity of 5 reached" });
      }
      cartItem.quantity += 1;
    } else if (action === "decrement") {
      cartItem.quantity -= 1;

      if (cartItem.quantity <= 0) {
        return res
          .status(400)
          .json({ message: "negative value is not possible" });
      }
    } else {
      return res.status(400).res.json({ message: "invalid action" });
    }
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Cart updated successfully",
      updatedTotalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error("error updating cart quantity", error);
    res.status(500).json({
      message: "An error occures while updating the cart",
    });
  }
};



module.exports = {
  getCart,
  addCart,
  removeProductFromCart,
  updateQuantity,
 
};
