
const mongoose=require('mongoose')

 const mongodb=function (){
  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log('Connected to MongoDB');
  })
  .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
  });
}

module.exports=mongodb