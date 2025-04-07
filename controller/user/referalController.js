const User = require('../../Models/userSchema');

const getReferal = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login'); 
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const referralLink = `${req.protocol}://${req.get("host")}/signup?ref=${user._id}`; 
    console.log(referralLink); 

    res.render('User/referal', { referralLink });
  } catch (error) {
    console.error("Error loading referral page:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = { getReferal };
