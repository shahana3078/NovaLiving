const User = require('../../Models/userSchema'); // Ensure the correct user model is imported

const getReferal = async (req, res) => {
  try {
    const userId = req.session.userId; // Get logged-in user ID

    if (!userId) {
      return res.redirect('/login'); // Redirect if not logged in
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const referralLink = `${req.protocol}://${req.get("host")}/signup?ref=${user._id}`; // Unique signup link
    console.log("Generated Referral Link:", referralLink); // Debugging

    res.render('User/referal', { referralLink }); // Pass the link to the referral page
  } catch (error) {
    console.error("Error loading referral page:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = { getReferal };
