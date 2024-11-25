const express = require("express");
const router = express.Router();
const multer = require("multer");
const { adminAuth, islogined, noCache } = require("../middlewares/auth.js");
const upload = require("../middlewares/multerConfig.js");
const authController=require('../controller/Admin/authController.js')
const adminController = require("../controller/Admin/adminController.js");
const categoryController=require('../controller/Admin/categoryController.js')
const productController=require('../controller/Admin/productController.js')

const path = require("path");



router.get("/", noCache, islogined, authController.getLogin);
router.post("/login", authController.postLogin);

router.post("/logout", adminController.logoutAdmin);

router.get("/dashboard", noCache, adminAuth, adminController.getDashboard);

// USER LISTING

router.get("/users/search", adminController.searchUsers);

router.get("/users", noCache, adminAuth, adminController.getUsers);

router.post("/users/block/:id", adminController.blockUser);

router.post("/users/delete/:id", adminController.deleteUser);

//CATEGORIES

router.get("/categories", noCache, adminAuth, categoryController.getCategories);

router.post("/categories/add", categoryController.addOrUpdateCategory);

router.put("/categories/delete/:id", categoryController.deleteCategory);

router.put("/categories/undo/:id", categoryController.undoDelete);

router.put("/categories/update/:id", categoryController.updateCategory);



// PRODUCTS

router.get("/products", noCache, adminAuth,productController.getProducts);
router.get("/product", noCache, adminAuth, productController.getProductPage);

router.post("/products/add",(req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);

      return res.status(400).json({
        success: false,
        message: err.message || "An unknown error occurred during upload.",
      });
    }
    next();
  });
}, productController.addProduct);

router.post("/products/edit/:id", productController.editProduct);

router.put("/products/delete/:id", productController.deleteProduct);

router.put("/products/undo/:id",productController.undoProduct);

module.exports = router;