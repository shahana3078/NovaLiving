const Product = require("../../Models/productModel");
const User = require("../../Models/userSchema");
const Category = require("../../Models/categoryModel");

// SHOP

const getShop = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 8;
    const categoryFilter = req.query.category || null;
    const sortBy = req.query.sortBy || "featured";
    const searchQuery = req.query.query ? req.query.query.trim() : null;
    let filterQuery = {
      isDeleted: false,
    };

    if (categoryFilter) {
      filterQuery.categoryId = categoryFilter;
    }

    if (searchQuery) {
      filterQuery.name = { $regex: searchQuery, $options: "i" }; // Case-insensitive search
    }
    let sortProduct = {};
    if (sortBy === "priceLowHigh") {
      sortProduct.price = 1;
    } else if (sortBy === "priceHighLow") {
      sortProduct.price = -1;
    } else if (sortBy === "nameAsc") {
      sortProduct.name = 1;
    } else if (sortBy === "nameDesc") {
      sortProduct.name = -1;
    }

    

    const products = await Product.find(filterQuery)
      .populate({
        path: "categoryId",
        match: { isDeleted: false },
        select: "categoryName _id",
      })
      .sort(sortProduct);

    const categories = await Category.find({ isDeleted: false });
 
    products.forEach((product) => {
      let productDiscount = 0;
      let categoryDiscount = 0;
    
      if (product.offer?.isActive && product.offer.discountPercentage > 0) {
        productDiscount = product.offer.discountPercentage;
      }
    
      if (product.categoryId?.offer?.isActive && product.categoryId.offer.discountPercentage > 0) {
        categoryDiscount = product.categoryId.offer.discountPercentage;
      }
    
      const finalDiscount = Math.max(productDiscount, categoryDiscount);
    
      if (finalDiscount > 0) {
        const discountAmount = (product.price * finalDiscount) / 100;
        product.discountedPrice = Math.round(product.price - discountAmount);
        product.appliedDiscount = finalDiscount;
      } else {
        product.discountedPrice = Math.round(product.price);
      }
      
    });
    

    
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const paginatedProducts = products.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );


    res.render("User/shop", {
      products: paginatedProducts,
      categories,
      sortBy,
      categoryFilter,
      currentPage: page,
      totalPages,
      searchQuery,
      noResults: totalProducts === 0, 
    });
  } catch (error) {
    console.log("Error retrieving products", error);
    res.status(500).send("Error loading shop page.");
  }
};




//PRODUCT DETAILS

const productDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate('categoryId');

    if (!product) {
      return res.status(404).send("Product not found");
    }

    let discountedPrice = product.price;
    if (product.offer?.isActive && product.offer.discountPercentage > 0) {
      discountedPrice = product.price - (product.price * product.offer.discountPercentage) / 100;
    }

    const relatedProducts = await Product.find({
      isDeleted: false,
      categoryId: product.categoryId,
      _id: { $ne: id },
    }).limit(4);


    relatedProducts.forEach((relProduct) => {
      if (relProduct.offer?.isActive && relProduct.offer.discountPercentage > 0) {
        relProduct.discountedPrice =
          relProduct.price - (relProduct.price * relProduct.offer.discountPercentage) / 100;
      } else {
        relProduct.discountedPrice = relProduct.price;
      }
    });

    const breadcrumbs = [
      { name: "Home", link: "/home" },
      { name: "Shop", link: "/shop" },
      { name: product.name, link: "" },
    ];

    res.render("User/productDetail", {
      product,
      discountedPrice,
      breadcrumbs,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Error loading product details");
  }
};

module.exports = {
  getShop,
  productDetails,

};
