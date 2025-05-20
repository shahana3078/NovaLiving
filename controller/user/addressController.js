const Address=require("../../Models/addressModel")


const getAddresses = async (req, res) => {
  try {
    const userId =req.session.userId;
  
    const addresses = await Address.find({userId:userId});
    
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
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    if (!fullName || !mobile || !pincode || !address || !city || !state) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const trimmedLandmark=landmark.trim()
    const trimmedName = fullName.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
 
    if (trimmedName === '' || !/[A-Za-z0-9]/.test(trimmedName)) {
      return res.status(400).json({ message: "Full name must contain letters or numbers and not only special characters." });
    }

    if (trimmedCity === '' || !/[A-Za-z0-9]/.test(trimmedCity)) {
      return res.status(400).json({ message: "City name must contain letters or numbers and not only special characters." });
    }

    if(trimmedLandmark === '' ||!/[A-Za-z0-9]/.test(trimmedLandmark) ){
      return res.status(400).json({message:'Landmark must contain letters or numbers and not only special characters'})
    }

    if (trimmedState === '' || !/[A-Za-z0-9]/.test(trimmedState)) {
      return res.status(400).json({ message: "State name must contain letters or numbers and not only special characters." });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Mobile number must be exactly 10 digits." });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Pincode must be exactly 6 digits." });
    }

    if (defaultAddress) {
      await Address.updateMany(
        { userId, defaultAddress: true },
        { $set: { defaultAddress: false } }
      );
    }

    const newAddress = new Address({
      userId,
      fullName: trimmedName,
      mobile,
      pincode,
      address,
      landmark,
      city: trimmedCity,
      state: trimmedState,
      defaultAddress: defaultAddress || false,
    });

    await newAddress.save();

    res.status(201).json({ message: "Address added successfully!", address: newAddress });
  } catch (err) {
    console.error("Error while adding address:", err);
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



const updateAddress = async (req, res) => {
  const { id } = req.params;
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