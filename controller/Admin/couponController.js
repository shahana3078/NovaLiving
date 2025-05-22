const Coupon = require("../../Models/couponModel");

const getCoupon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const [coupons, totalCoupons] = await Promise.all([
      Coupon.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments({ isDeleted: false }),
    ]);

    const totalPages = Math.ceil(totalCoupons / limit);

    res.render("Admin/pages/coupon", {
      coupons,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).send("Internal Server Error");
  }
};

const addCoupon = async (req, res) => {
  try {
    const { couponCode, discountPrice, minimumPrice, expirationDate } =
      req.body;

    const isValidCouponCode = /^[A-Za-z0-9]+$/.test(couponCode);
    if (!isValidCouponCode) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code should contain only letters and numbers (no special characters)",
      });
    }

    if (!expirationDate || isNaN(new Date(expirationDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Expiration date is invalid",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    if (expDate < today) {
      return res.status(400).json({
        success: false,
        message: "Expiration date cannot be a past date",
      });
    }

    if (Number(discountPrice) >= Number(minimumPrice)) {
      return res.status(400).json({
        success: false,
        message: "Minimum price should be greater than the discount amount",
      });
    }

    if(Number(minimumPrice)<0){
      return res.status(400).json({
        success:false,
        message:'minimum price should not be a negative value'
      })
    }

    if(Number(discountPrice)<0){
      return res.status(400).json({
        success:false,
        message:'discount price should not be a negative value'
      })
    }

    const existingCoupon = await Coupon.findOne({
      couponCode: { $regex: `^${couponCode}$`, $options: "i" },
    });

    if (existingCoupon) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = new Coupon({
      couponCode,
      discountPrice,
      minimumPrice,
      expirationDate,
    });
    await coupon.save();

    res
      .status(201)
      .json({ success: true, message: "Coupon added successfully" });
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

module.exports = {
  getCoupon,
  addCoupon,
  deleteCoupon,
};
