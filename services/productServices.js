
const Product = require('../Models/productModel.js')
const productFunction=async ()=>{
try{
  const products = await Product.find({isDeleted:false}).lean();
  return products;
}catch(error){
  console.log('error qyuerying the products',error);
  throw error
  
}

}

module.exports={
  productFunction
}