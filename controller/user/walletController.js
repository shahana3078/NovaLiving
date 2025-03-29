
const Wallet = require('../../Models/walletModel');
const Order = require('../../Models/orderModel');
const Cart = require("../../Models/cartModel");

// const getWallet = async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     let wallet = await Wallet.findOne({ userId });


//     if (!wallet) {
//       wallet = new Wallet({ userId, balance: 0, transactions: [] });
//       await wallet.save(); 
//     }
//     const cancelledOrders = await Order.find({
//       userId,
//       orderStatus: "cancelled",
//       paymentMethod: "razorpay",
//     });

//     let amountCredited = 0;

//     for (const order of cancelledOrders) {
//       const alreadyCredited = wallet.transactions.some(
//         (t) => t.description === `Refund for cancelled order #${order._id}`
//       );

//       if (!alreadyCredited) {
//         wallet.balance += order.grandTotal;
//         amountCredited += order.grandTotal;

//         wallet.transactions.push({
//           amount: order.grandTotal,
//           type: "credit",
//           description: `Refund for cancelled order #${order._id}`,
//         });
//       }
//     }

//     if (amountCredited > 0) {
//       await wallet.save(); 
//     }

//     res.render("User/wallet", { wallet: wallet || { balance: 0, transactions: [] } });
//   } catch (error) {
//     console.error("Error fetching wallet:", error);
//     res.status(500).send("Server Error");
//   }
// };
const getWallet = async (req, res) => {
  try {
    const userId = req.session.userId;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0, transactions: [] });
      await wallet.save();
    }

    res.render("User/wallet", { wallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).send("Server Error");
  }
};




module.exports = {
  getWallet,
};

