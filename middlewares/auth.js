function requireLogin(req, res, next) {
  console.log("Checking");
  if (!req.session.userId) {
    return res.redirect("/");
  }

  next();
}

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

const noCache = async (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};

const userLogined = async (req, res, next) => {
  if (req.session.userId) {
   return res.redirect("/home");
  }
  next();
};

module.exports = { requireLogin, adminAuth, islogined, noCache, userLogined };
