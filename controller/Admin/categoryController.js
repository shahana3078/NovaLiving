const Category = require("../../Models/categoryModel");
const Product = require("../../Models/productModel");

// CATEGORY MANAGEMENT

const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = 5; // 5 categories per page
    const skip = (page - 1) * limit;

    const categories = await Category.find()
      .skip(skip)
      .limit(limit);

    const totalCategories = await Category.countDocuments(); // count total
    const totalPages = Math.ceil(totalCategories / limit);

    res.render("Admin/pages/categoryManagement", { 
      categories, 
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Server Error");
  }
};

//EDIT

const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const updatedData = req.body;
  console.log('req.body',req.body)

  try {
    const existingCategory = await Category.findOne({
      categoryName: updatedData.categoryName,
      _id: { $ne: categoryId }, 
    });

    if (existingCategory) {
      return res.status(400).json({ message: `Category name "${updatedData.categoryName}" already exists.` });
    }

    const highestOfferProduct = await Product.findOne({ categoryId })
    .sort({ "offer.discountPercentage": -1 })
    .select("offer")
    .lean(); 

    let categoryOffer = updatedData.offer
    ? {
        discountPercentage: Math.max(0, Math.min(100, updatedData.offer.discountPercentage || 0)), 
        isActive: updatedData.offer.discountPercentage > 0
      }
    : highestOfferProduct?.offer || { discountPercentage: 0, isActive: false };
  

  if (categoryOffer.discountPercentage < 0 || categoryOffer.discountPercentage > 100) {
    categoryOffer = { discountPercentage: 0, isActive: false };
  }
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          categoryName: updatedData.categoryName,
          offer: {
            discountPercentage: categoryOffer.discountPercentage, 
            isActive: categoryOffer.isActive, 
          },
        },
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).send({ message: "Category not found" });
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).send({ message: "Internal server error", error: error.message });
  }
};

// ADD CATEGORY
const addOrUpdateCategory = async (req, res) => {
  console.log(req.body);

  try {
    const { name, description,offer } = req.body;

    const existingCategory = await Category.findOne({ categoryName: name });

   



    if (existingCategory) {
      return res
        .status(400)
        .json({ message: `Category name "${name}" already exists.` });
    }

    const newCategory = new Category({
      categoryName: name,
      description: description,
      offer: {
        discountPercentage: offer.discountPercentage || 0,
        isActive: offer.isActive || false,
      },
      
    });

    await newCategory.save();

    return res
      .status(201)
      .json({ message: "Category added successfully!", category: newCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: `Category name "${name}" already exists.` });
    }

    console.error("Error adding category:", error);
    return res
      .status(500)
      .json({ message: "Failed to add category.", error: error.message });
  }
};

//DELETE AND UNDO


const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    category.isDeleted = true;
    
    await category.save();
    
    console.log(category);
    
      const dat = await Product.updateMany({ category: category.categoryName }, { isDeleted: true });

    res.status(200).json({ message: "Category deleted and products unlisted." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting category", error });
  }
};


const undoDelete = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    category.isDeleted = false;
    await category.save();

    await Product.updateMany({ categoryId: id }, { isDeleted: false });
    
    res.status(200).json({ message: "Category restored successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error restoring category", error });
  }
};


const toggleCategoryOffer = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { isActive } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.offer.isActive = isActive;
    await category.save();

    await Product.updateMany(
      { categoryId: categoryId }, 
      { $set: { "offer.isActive": isActive, "offer.discountPercentage": category.offer.discountPercentage } }
    );
    res.json({ success: true, message: "Category offer updated successfully" });
  } catch (error) {
    console.error("Error updating category offer:", error);
    res.status(500).json({ success: false, message: "Error updating category offer" });
  }
};


module.exports = {
  getCategories,
  addOrUpdateCategory,
  deleteCategory,
  undoDelete,
  updateCategory,
  toggleCategoryOffer

};
