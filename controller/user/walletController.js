
const Wallet=require('../../Models/walletModel')

const getWallet = async (req, res) => {
  try {
      const wallet = await Wallet.findOne({ userId: req.session.userId });

      if (!wallet) {
          return res.render('User/wallet', { wallet: { balance: 0, transactions: [] } });
      }
      res.render('User/wallet', { wallet });
  } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).send('Server Error');
  }
};

module.exports={
  getWallet,

}