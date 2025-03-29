const Coupon=require('../../Models/couponModel')

const getCoupon = async (req, res) => {
  try {
 
    const coupons = await Coupon.find({ isDeleted: false }).sort({ createdAt: -1 });

    res.render("Admin/pages/coupon", { coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).send("Internal Server Error");
  }
};


const addCoupon = async (req, res) => {
  try {
      const { couponCode, discountPrice, minimumPrice, expirationDate } = req.body;

      const existingCoupon = await Coupon.findOne({ couponCode });
      if (existingCoupon) {
          return res.status(400).json({ success: false, message: "Coupon code already exists" });
      }

      const coupon = new Coupon({ couponCode, discountPrice, minimumPrice, expirationDate });
      await coupon.save();

      res.status(201).json({ success: true, message: "Coupon added successfully" });
  } catch (error) {
      console.error("Error adding coupon:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};


const deleteCoupon = async (req, res) => {
  try {
      const { id } = req.params;
      await Coupon.findByIdAndUpdate(id, { isDeleted: true });
      res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports={
  getCoupon,
  addCoupon,
  deleteCoupon
}

