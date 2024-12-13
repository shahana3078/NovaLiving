const Address=require("../../Models/addressModel")


const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find();
    
    res.render('User/address', { addresses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while fetching addresses.');
  }
};


//ADD ADDRESS

const addAddress = async (req, res) => {
  try {
    const { fullName, mobile, pincode, address, landmark, city, state, defaultAddress } = req.body;

      console.log(req.body)

    if (!fullName || !mobile || !pincode || !address || !city || !state) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const newAddress = new Address({
      fullName,
      mobile,
      pincode,
      address,
      landmark,
      city,
      state,
      defaultAddress: defaultAddress || false,
    });

    await newAddress.save();

    res.status(201).json({ message: "Address added successfully!", address: newAddress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding address." });
  }
};

//REMOVE ADDRESS
const removeAddress=async(req,res)=>{
try{
  const{id}=req.params;

  await Address.findByIdAndDelete(id)
  res.redirect('/address')
}catch(err){
  console.error(err)
  res.status(500).send('server error')
}
}

//EDIT ADDRESS

// const editAddress = async (req, res) => {
//   const { id } = req.params;  
//   console.log( id);

//   if (req.method === 'GET' && !req.body) {
   
//     try {
//       const addressDetails = await Address.findById(id);
//       console.log('address details:',addressDetails)
//       if (!addressDetails) {
//         return res.status(404).send('Address not found');
//       }
//       return res.json(addressDetails);
//     } catch (error) {
//       return res.status(500).send('Error fetching address');
//     }
//   }

  
//   const { fullName, mobile, pincode, address, landmark, city, state, isDefault } = req.body;
// console.log(req.body)
//   // Update the address if data is provided (POST request)
//   try {
//     const updatedAddressData = { fullName, mobile, pincode, address, landmark, city, state, isDefault };
//     const updatedAddress = await Address.findByIdAndUpdate(id, updatedAddressData, { new: true });

//     if (!updatedAddress) {
//       return res.status(404).send('Address not found');
//     }

//     return res.status(200).send('Address updated successfully');
//   } catch (error) {
//     return res.status(500).send('Error updating address');
//   }
// };


const getEditAddress = async (req, res) => {
  const { id } = req.params; 

  try {
    const addressDetails = await Address.findById(id);  
    if (!addressDetails) {
      return res.status(404).send('Address not found');
    }
    return res.json(addressDetails); 
  } catch (error) {
    return res.status(500).send('Error fetching address');
  }
};

// const updateAddress = async (req, res) => {
//   const { id } = req.params;  
//   const { fullName, mobile, pincode, address, landmark, city, state, isDefault } = req.body;

//   try {
//     const updatedAddressData = { fullName, mobile, pincode, address, landmark, city, state, isDefault };
//     const updatedAddress = await Address.findByIdAndUpdate(id, updatedAddressData, { new: true });

//     if (!updatedAddress) {
//       return res.status(404).send('Address not found');
//     }

//     return res.status(200).send('Address updated successfully');
//   } catch (error) {
//     return res.status(500).send('Error updating address');
//   }
// };
const updateAddress = async (req, res) => {
  const { id } = req.params;  // Get address ID from the URL
  const { fullName, mobile, pincode, address, landmark, city, state, isDefault } = req.body;

  try {
    const updatedAddressData = { fullName, mobile, pincode, address, landmark, city, state, isDefault };
    const updatedAddress = await Address.findByIdAndUpdate(id, updatedAddressData, { new: true });

    if (!updatedAddress) {
      return res.status(404).send('Address not found');
    }

    return res.status(200).send('Address updated successfully');
  } catch (error) {
    return res.status(500).send('Error updating address');
  }
};


module.exports={
  getAddresses,
  addAddress,
  removeAddress,
  getEditAddress,
  updateAddress

}