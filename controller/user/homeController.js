
const Product= require('../../Models/productModel')
const User = require("../../Models/userSchema");
const  Category=require('../../Models/categoryModel')

// SHOP

// const getShop = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const itemsPerPage = 8;
//     const categoryFilter = req.query.category || null;
//     const maxPrice = parseInt(req.query.price) || 70000;
//     const sortBy = req.query.sortBy || 'featured';

//     let filterQuery = {
//       isDeleted: false,
//       price: { $lte: maxPrice },
//     };

//     if (categoryFilter) {
//       filterQuery.categoryId = categoryFilter;
//     }

//     // Determine the sorting criteria
//     let sortProduct = {};
//     if (sortBy === 'priceLowHigh') {
//       sortProduct.price = 1; // Ascending order
//     } else if (sortBy === 'priceHighLow') {
//       sortProduct.price = -1; // Descending order
//     } else if (sortBy === 'nameAsc') {
//       sortProduct.name = 1; // Ascending order
//     } else if (sortBy === 'nameDesc') {
//       sortProduct.name = -1; // Descending order
//     }

//     const products = await Product.find(filterQuery)
//       .populate({
//         path: 'categoryId',
//         match: { isDeleted: false },
//         select: 'categoryName _id',
//       })
//       .sort(sortProduct); // Apply sorting

//     const categories = await Category.find({ isDeleted: false });
//     const totalProducts = products.length;
//     const totalPages = Math.ceil(totalProducts / itemsPerPage);
//     const paginatedProducts = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

//     res.render('User/shop', {
//       products: paginatedProducts,
//       categories,
//       product: null,
//       currentPage: page,
//       totalPages,
//     });
//   } catch (error) {
//     console.log('Error retrieving products', error);
//     res.status(500).send('Error loading shop page.');
//   }
// };
// const getShop = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const itemsPerPage = 8;
//     const categoryFilter = req.query.category || null;
//     const maxPrice = parseInt(req.query.price) || 70000;
//     const sortBy = req.query.sortBy || 'featured';  // Default sorting is 'featured'

//     let filterQuery = {
//       isDeleted: false,
//       price: { $lte: maxPrice },
//     };

//     if (categoryFilter) {
//       filterQuery.categoryId = categoryFilter;
//     }

//     // Determine the sorting criteria
//     let sortProduct = {};
//     if (sortBy === 'priceLowHigh') {
//       sortProduct.price = 1; // Ascending order
//     } else if (sortBy === 'priceHighLow') {
//       sortProduct.price = -1; // Descending order
//     } else if (sortBy === 'nameAsc') {
//       sortProduct.name = 1; // Ascending order
//     } else if (sortBy === 'nameDesc') {
//       sortProduct.name = -1; // Descending order
//     } else {
//       // Default sorting (Featured) - adjust as necessary
//       sortProduct = { createdAt: -1 };  // Sort by the most recent products, adjust as per your preference
//     }

//     const products = await Product.find(filterQuery)
//       .populate({
//         path: 'categoryId',
//         match: { isDeleted: false },
//         select: 'categoryName _id',
//       })
//       .sort(sortProduct); // Apply sorting

//     const categories = await Category.find({ isDeleted: false });
//     const totalProducts = products.length;
//     const totalPages = Math.ceil(totalProducts / itemsPerPage);
//     const paginatedProducts = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

//     res.render('User/shop', {
//       products: paginatedProducts,
//       categories,
//       product: null,
//       currentPage: page,
//       totalPages,
//     });
//   } catch (error) {
//     console.log('Error retrieving products', error);
//     res.status(500).send('Error loading shop page.');
//   }
// };

const getShop = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 8;
    const categoryFilter = req.query.category || null;
    const maxPrice = parseInt(req.query.price) || 70000;
    const sortBy = req.query.sortBy || 'featured';

    let filterQuery = {
      isDeleted: false,
      price: { $lte: maxPrice },
    };

    if (categoryFilter) {
      filterQuery.categoryId = categoryFilter;
    }

    // Determine the sorting criteria
    let sortProduct = {};
    if (sortBy === 'priceLowHigh') {
      sortProduct.price = 1; // Ascending order
    } else if (sortBy === 'priceHighLow') {
      sortProduct.price = -1; // Descending order
    } else if (sortBy === 'nameAsc') {
      sortProduct.name = 1; // Ascending order
    } else if (sortBy === 'nameDesc') {
      sortProduct.name = -1; // Descending order
    }

    const products = await Product.find(filterQuery)
      .populate({
        path: 'categoryId',
        match: { isDeleted: false },
        select: 'categoryName _id',
      })
      .sort(sortProduct); // Apply sorting

    const categories = await Category.find({ isDeleted: false });
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const paginatedProducts = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    res.render('User/shop', {
      products: paginatedProducts,
      categories,
      sortBy,
      categoryFilter,
      maxPrice,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log('Error retrieving products', error);
    res.status(500).send('Error loading shop page.');
  }
};




//PRODUCT DETAILS


const productDetails = async (req, res) => {
  const { id } = req.params; 
  try {
    
    const product = await Product.findById(id).populate({
      path: 'categoryId',
      select: 'categoryName',
    });

    if (!product) {
      return res.status(404).send("Product not found");
    }

  
    const relatedProducts = await Product.find({
      isDeleted: false,
      categoryId: product.categoryId, 
      _id: { $ne: id },
    }).limit(4);


    const breadcrumbs = [
      { name: "Home", link: "/home" },
      { name: "Shop", link: "/shop" },
      { name: product.name, link: "" },
    ];

    
    res.render('User/productDetail', {
      product,
      breadcrumbs,
      relatedProducts,
      
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send("Error loading product details");
  }
};




module.exports={
  getShop,
  productDetails,


}
  
