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

const stockUpdate= async(req,res)=>{
  const { stock } = req.body;
  const productId = req.params.id;

  try {
    await Product.findByIdAndUpdate(productId, { stock });
    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
}

module.exports={
  getStocks,
  stockUpdate
}