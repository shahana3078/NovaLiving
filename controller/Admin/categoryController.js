const Category = require("../../Models/categoryModel");
const Product = require("../../Models/productModel");

// CATEGORY MANAGEMENT

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("admin/pages/categoryManagement", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Server Error");
  }
};

//EDIT

const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const updatedData = req.body;

  try {
    const existingCategory = await Category.findOne({
      categoryName: updatedData.categoryName,
      _id: { $ne: categoryId }, 
    });

    if (existingCategory) {
      return res.status(400).json({ message: `Category name "${updatedData.categoryName}" already exists.` });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          categoryName: updatedData.categoryName,
          description: updatedData.description,
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
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ categoryName: name });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: `Category name "${name}" already exists.` });
    }

    const newCategory = new Category({
      categoryName: name,
      description: description,
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


module.exports = {
  getCategories,
  addOrUpdateCategory,
  deleteCategory,
  undoDelete,
  updateCategory,

};
