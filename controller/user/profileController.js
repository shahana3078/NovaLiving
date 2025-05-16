const User = require("../../Models/userSchema");
const bcrypt = require('bcrypt');

const getUserProfile=async(req,res)=>{
  res.render('User/Profile')
}

const getMyProfile = async (req, res) => {
 
  if (!req.session.userId) {
    return res.redirect("/login"); 
  }

  try {

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("User/myProfile", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};



const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.session.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//edit

const updateProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  const { fullName } = req.body;

  if (!fullName) {
    return res.status(400).json({ success: false, message: 'Full name is required' });
  }

  const trimmedName = fullName.trim();

  if (trimmedName === '') {
    return res.status(400).json({ success: false, message: 'Full name cannot be only spaces' });
  }

  if (/^\d+$/.test(trimmedName)) {
    return res.status(400).json({ success: false, message: 'Full name cannot be only numbers' });
  }

  if (/^_+$/.test(trimmedName)) {
    return res.status(400).json({ success: false, message: 'Full name cannot be only underscores' });
  }

  if (!/[A-Za-z0-9]/.test(trimmedName)) {
    return res.status(400).json({ success: false, message: 'Full name cannot be only special characters' });
  }
  

  if (/^[A-Za-z]+$/.test(trimmedName)) {
    return res.status(400).json({ success: false, message: 'Full name must include more than just letters (e.g. include space or other characters)' });
  }
 
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.full_name = trimmedName;

    await user.save();

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




module.exports={
  getUserProfile,
  getMyProfile,
  updateProfile,
  changePassword
}