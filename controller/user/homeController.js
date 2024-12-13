
const Product= require('../../Models/productModel')
const User = require("../../Models/userSchema");
const  Category=require('../../Models/categoryModel')

// SHOP

const getShop = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const itemsPerPage = 8; 

    const products = await Product.find({
      isDeleted: false  
    }).populate({
      path: "categoryId",
      match: { isDeleted: false }, 
      select: 'categoryName _id'
    });

    const activeProducts = products.filter(product => product.categoryId !== null);
    const categories=await Category.find({isDeleted:false})
   
    const totalProducts = activeProducts.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage); 
    const paginatedProducts = activeProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

 
    res.render('User/shop', { 
      products: paginatedProducts, 
      product: null,
      currentPage: page,
      totalPages 
    }); 
  } catch (error) {
    console.log('Error retrieving products', error);
    res.status(500).send("Error loading shop page.");
  }
};




const productDetails = async(req,res)=>{
  const {id}= req.params
  console.log(id)
  try {
    const product=await Product.findById(id)
   
    const relatedProducts = await Product.find({
      isDeleted:false,
      category: product.category, 
      _id: { $ne: id}, 
    }).limit(4)
    const breadcrumbs = [
      { name: "Home", link: "/home" },
      { name: "Shop", link: "/shop" },
      { name: product.name, link: "" }
    ];
    res.render('User/productDetail',{product,breadcrumbs,relatedProducts})
  } catch (error) {
    
  }
}



module.exports={
  getShop,
  productDetails,


}
  
