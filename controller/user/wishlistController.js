const Wishlist=require('../../Models/wishlistModel')
const Product=require('../../Models/productModel')

const getWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const wishlist = await Wishlist.findOne({ userId }).populate("items.productId");

    if (!wishlist) {
      return res.render("User/wishlist", { items: [] });
    }

    res.render("User/wishlist", {
      items: wishlist.items.map((item) => ({
        name: item.name,
        productId: item.productId._id,
        price: item.price,
        total: item.price,
        image: item.image,
        addedDate:item.addedDate
      })),
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).send("An error occurred while loading the wishlist.");
  }
};


const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const existingItem = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ message: "Product is already in your wishlist." });
    }

    wishlist.items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });

    await wishlist.save();

    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(500).json({
      message: "An error occurred while adding the product to the wishlist.",
    });
  }
};

const removeProduct = async (req, res) => {
  const { productId } = req.body;

  const userId = req.session.userId;

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: " product not found" });
    }

   wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();
    res.status(200).json({ message: "Product removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
};




module.exports={
  getWishlist,
  addToWishlist,
  removeProduct

}