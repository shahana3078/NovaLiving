const Product = require("../../Models/productModel")
const Category = require("../../Models/categoryModel");

// PRODUCTS

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .populate({
        path: 'categoryId',
        select: 'categoryName'
      })
      .sort({ addedDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await Category.find({ isDeleted: false });

    const updatedProducts = products.map((product) => ({
      ...product.toObject(),
      categoryName: product.categoryId ? product.categoryId.categoryName : "No Category",
    }));

    res.render("Admin/pages/products", {
      categories,
      products: updatedProducts,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server error");
  }
};


const addProduct = async (req, res) => {
  try {
    const { productName, productDescription, productPrice, productStock, productCategory,productOffer } = req.body;
    console.log(req.body)
    const uploadImages = req.files.map((val) => val.filename);

    const existingProduct = await Product.findOne({ name: productName }); 
    const category=await Category.findOne({ categoryName: productCategory });
    console.log(productCategory);
    
    if (existingProduct) {
      return res.status(400).json({
        message: `Product name "${productName}" already exists. Please choose a different name.`,
        field: "productName", 
      });
    }

    const discountValue = Number(productOffer) || 0;

    const newProduct = new Product({
      name: productName,
      category: productCategory,
      categoryId: category._id,
      price: productPrice,
      stock: productStock,
      description: productDescription,
      images: uploadImages,
      offer:{
        discountPercentage: discountValue, 
          isActive: discountValue > 0 , 
      }
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


//EDIT PRODUCT
const editProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const { productName, productCategory, productPrice, productStock,productDescription, existingImages,offerDiscount } = req.body;
  console.log(productCategory)
    let images = existingImages ? JSON.parse(existingImages) : [];

  
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      images = [ ...newImages]; 
    }

    if (Number(productPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Product price should not be a negative value",
      });
    }

    if (Number(productStock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock should not be a negative value",
      });
    }

    if (Number(offerDiscount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Offer discount should not be a negative value",
      });
    }

    if (Number(offerDiscount) > 90) {
      return res.status(400).json({
        success: false,
        message: "Offer discount should not exceed 90%",
      });
    }


    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: productName,
        description: productDescription,
        price: productPrice,
        stock: productStock,
        category: productCategory,
        offer: {
          discountPercentage: Number(offerDiscount) || 0, 
          isActive: Number(offerDiscount) > 0, 
        },
        images: images, 
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Failed to update product." });
  }
};


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

const toggleOfferStatus = async (req, res) => {
  try {
      const { isActive } = req.body;
      const productId = req.params.id;

      await Product.findByIdAndUpdate(productId, { "offer.isActive": isActive });

      res.status(200).json({ success: true, message: "Offer status updated." });
  } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ success: false, message: "Server error." });
  }
};







module.exports={
  getProducts,
  addProduct,
  getProductPage,
  editProduct,
  deleteProduct,
  undoProduct, 
  toggleOfferStatus
}