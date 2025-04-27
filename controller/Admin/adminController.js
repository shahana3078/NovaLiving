const User = require("../../Models/userSchema");

const Product = require("../../Models/productModel");

//ADMIN-LOGIN

const getLogin = (req, res) => {
  res.render("Admin/pages/adminLogin", { error: null });
};

const postLogin = (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.adminId = { username, password };
    console.log(req.session.adminId);
    return res.redirect("/admin/dashboard");
  } else {
    res.render("Admin/pages/adminLogin", {
      error: "Incorrect username or password",
    });
  }
};



//USER LIST

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render("Admin/pages/userList", { users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching users");
  }
};

//SEARCH USERS
const searchUsers = async (req, res) => {
  const query = req.query.query || "";
  try {
    const users = await User.find({
      $or: [{ email: { $regex: query, $options: "i" } }],
    }).limit(10);
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send("Error searching users");
  }
};

//DELETE USER

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
};

//BLOCK-USER

const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (user) {
      user.isBlocked = !user.isBlocked;
      await user.save();
    }
    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error blocking/unblocking user");
  }
};



const logoutAdmin = async (req, res) => {
  req.session.adminId = null;
  res.redirect("/admin");
};

module.exports = {
  getLogin,
  postLogin,
  getUsers,
  searchUsers,
  deleteUser,
  blockUser,
  logoutAdmin,
};
