const User=require('../Models/userSchema')


async function requireLogin(req, res, next) {

  if (!req.session.userId) {
    return res.redirect("/");
  }

  const isBlocked = await User.findOne(
    { _id: req.session.userId }, 
    { isBlocked: 1 }
  ).lean();

  if (isBlocked?.isBlocked) {
   req.session.userId=null
    return res.redirect('/logout');
  }

  next(); 
}


const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache'); 
  res.set('Expires', '0'); 
  next();
};

const userLogined = async (req, res, next) => {
  if (req.session.userId) {
   return res.redirect("/home");
  }
  next();
};


const preventBackToOrder = (req, res, next) => {
  console.log("Checking order completion status: ", req.session.orderCompleted);

  if (req.session.orderCompleted) {

    return res.redirect('/order-success');  
  }
  next();
};



const islogined = async (req, res, next) => {
  if (req.session.adminId) {
   return res.redirect("/admin/dashboard");
  }
  next();
};

const adminAuth = async (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect("/admin");
  }
  next();
};









module.exports = { requireLogin, adminAuth, islogined, noCache, userLogined,preventBackToOrder};
