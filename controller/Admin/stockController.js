const Product = require("../../Models/productModel")
const Category = require("../../Models/categoryModel");

const getStocks = async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId')
    
    const categories = await Category.find({ isDeleted: false });

    res.render("Admin/pages/stocks", { categories, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server error");
  }
};

const stockUpdate = async (req, res) => {
  const { stock } = req.body;
  const productId = req.params.id;

  console.log("Received Stock Update Request:", { productId, stock });

  if (!productId || stock === undefined) {
    return res.status(400).json({ success: false, message: "Invalid request data" });
  }

  try {
    const product = await Product.findByIdAndUpdate(productId, { stock }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Stock updated successfully", product });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, message: "Failed to update stock" });
  }
};


module.exports={
  getStocks,
  stockUpdate
}