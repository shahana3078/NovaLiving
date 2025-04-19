
const Wallet = require('../../Models/walletModel');
const Order = require('../../Models/orderModel');
const Cart = require("../../Models/cartModel");


const getWallet = async (req, res) => {
  try {
    const userId = req.session.userId;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0, transactions: [] });
      await wallet.save();
    }

    wallet.transactions.sort((a, b) => b.date - a.date);
    
    res.render("User/wallet", { wallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).send("Server Error");
  }
};




module.exports = {
  getWallet,
};

