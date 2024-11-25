const  { productFunction } = require('../../services/productServices');

const Product= require('../../Models/productModel')

// SHOP

const getShop = async(req, res) => {

try{
  const products=await productFunction()

  res.render('User/shop',{products,product: null }); 
}catch(error){
  console.log('error retrieving products',error);
  
}
};

const productDetails = async(req,res)=>{
  const {id}= req.params
  console.log(id)
  try {
    const product=await Product.findById(id)
 
    const breadcrumbs = [
      { name: "Home", link: "/home" },
      { name: "Shop", link: "/shop" },
      { name: product.name, link: "" }
    ];
    res.render('User/productDetail',{product,breadcrumbs})
  } catch (error) {
    
  }
}

module.exports={
  getShop,
  productDetails
}
  
