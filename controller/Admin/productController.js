const Product = require("../../Models/productModel")
const Category = require("../../Models/categoryModel");

// PRODUCTS

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await Category.find({ isDeleted: false });

    res.render("Admin/pages/products", { categories, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server error");
  }
};

const addProduct = async (req, res) => {
  try {
    const { productName, productDescription, productPrice, productStock, productCategory } = req.body;
    const uploadImages = req.files.map((val) => val.filename);

    const existingProduct = await Product.findOne({ name: productName });

    if (existingProduct) {
      return res.status(400).json({
        message: `Product name "${productName}" already exists. Please choose a different name.`,
        field: "productName", 
      });
    }

    const newProduct = new Product({
      name: productName,
      category: productCategory,
      price: productPrice,
      stock: productStock,
      description: productDescription,
      images: uploadImages,
    });

    await newProduct.save();

    return res.status(201).json({
      message: "Product added successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      message: "Failed to add product.",
      error: error.message,
    });
  }
};

const getProductPage = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("Admin/pages/product", { categories });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).send("Error retrieving categories");
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Destructure data from req.body
    const { productName, productCategory, productPrice, productStock, productDescription } = req.body;

    // Handle file uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      // Assuming images are stored in req.files as an array
      images = req.files.map(file => file.filename);  // Assuming you're storing file names (can also use file.path if needed)
    }

    images.pop()
    console.log(images);
    
    // Update product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      {
        name: productName,
        description: productDescription,
        price: productPrice,
        stock: productStock,
        category: productCategory,
        images: images  // Save new image filenames to the database
      },
      { new: true }
    );

    // Check if product was updated
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send success response
    res.json({
      success:true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Failed to update product." });
  }
};

//UNLIST PRODUCT




const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product unlisted successfully!" });
  } catch (error) {
    console.error("Error unlisting product:", error);
    res.status(500).json({ message: "Failed to unlist product." });
  }
};


//LIST PRODUCT
const undoProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product listed successfully!" });
  } catch (error) {
    console.error("Error listing product:", error);
    res.status(500).json({ message: "Failed to list product." });
  }
};





module.exports={
  getProducts,
  addProduct,
  getProductPage,
  editProduct,
  deleteProduct,
  undoProduct,
}