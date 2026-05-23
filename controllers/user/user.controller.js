import User from "../../models/user.model.js";

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.cart = cart;
    await user.save();
    
    res.status(200).json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ wishlist: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const { wishlist } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.wishlist = wishlist;
    await user.save();
    res.status(200).json({ message: "Wishlist updated successfully", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error updating wishlist", error: error.message });
  }
};

export { getCart, updateCart, getWishlist, updateWishlist };
