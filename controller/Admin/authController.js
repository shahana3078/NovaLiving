const User = require("../../Models/userSchema");

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

module.exports={
  getLogin,
  postLogin
}