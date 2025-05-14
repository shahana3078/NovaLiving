const User = require("../../Models/userSchema");

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



//edit
// const updateProfile = async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).json({ success: false, message: 'User not authenticated' });
//   }

//   const { fullName} = req.body;

//   if (!fullName  ) {
//     return res.status(400).json({ success: false, message: 'All fields are required' });
//   }

//   try {
//     const user = await User.findById(req.session.userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     user.full_name = fullName;
    
    

//     await user.save();

//     res.json({ success: true, message: 'Profile updated successfully' });
//   } catch (error) {
//     console.error('Error updating profile:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


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
  updateProfile
}