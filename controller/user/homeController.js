const Product = require("../../Models/productModel");
const User = require("../../Models/userSchema");
const Category = require("../../Models/categoryModel");

// SHOP

const getShop = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 8;
    const categoryFilter = req.query.category || null;
    const maxPrice = parseInt(req.query.price) || 70000;
    const sortBy = req.query.sortBy || "featured";
    let filterQuery = {
      isDeleted: false,
      price: { $lte: maxPrice },
    };

    if (categoryFilter) {
      filterQuery.categoryId = categoryFilter;
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
    
    //offer logic

    // products.forEach((product) => {
    //   if (product.offer?.isActive && product.offer.discountPercentage > 0) {
    //     product.discountedPrice =
    //       product.price -
    //       (product.price * product.offer.discountPercentage) / 100;
    //   } else {
    //     product.discountedPrice = product.price;
    //   }
    // });

    // Offer logic for category and product
    products.forEach((product) => {
      let productDiscount = 0;
      let categoryDiscount = 0;
    
      // Check if product has an active offer
      if (product.offer?.isActive && product.offer.discountPercentage > 0) {
        productDiscount = product.offer.discountPercentage;
      }
    
      // Check if category has an active offer
      if (product.categoryId?.offer?.isActive && product.categoryId.offer.discountPercentage > 0) {
        categoryDiscount = product.categoryId.offer.discountPercentage;
      }
    
      // Apply the highest discount between product and category
      const finalDiscount = Math.max(productDiscount, categoryDiscount);
    
      if (finalDiscount > 0) {
        product.discountedPrice = product.price - (product.price * finalDiscount) / 100;
        product.appliedDiscount = finalDiscount; // Store applied discount for UI
      } else {
        product.discountedPrice = product.price;
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
      maxPrice,
      currentPage: page,
      totalPages,
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
