
const ProductModel = require('../models/ProductModel')
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const UserModel = require('../models/users');
const { object } = require('joi');
const ObjectId = mongoose.Types.ObjectId;
const cart = require('../models/cart');
const Cart = require('../models/cart');


// Add to cart api

const addToCart = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const parsedQuantity = Number(quantity);
  
      if (!productId || !parsedQuantity || parsedQuantity <= 0) {
        return res.status(400).json({ message: 'Valid product ID and quantity are required' });
      }
  
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const productPrice = Number(product.price);
      const itemTotal = productPrice * parsedQuantity;
    //   console.log('price',productPrice)
  
      // ✅ Determine user or guest IP
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      let userId = req.user?._id || null;
      let cart;
  
      if (userId) {
        // ✅ Logged-in user — check for guest cart first
        const guestCart = await Cart.findOne({ guestIp: ip });
        const userCart = await Cart.findOne({ userId });
        // console.log('userCart',userCart)
  
        if (guestCart) {
          if (userCart) {
            // Merge guest cart into user cart
            guestCart.items.forEach(guestItem => {
              const existingIndex = userCart.items.findIndex(
                item => item.productId.toString() === guestItem.productId.toString()
              );
            //   console.log('fcvgbhjnmk',existingIndex)
  
              if (existingIndex > -1) {
                userCart.items[existingIndex].quantity += guestItem.quantity;
                userCart.items[existingIndex].total =
                  userCart.items[existingIndex].quantity * userCart.items[existingIndex].price;
              } else {
                userCart.items.push(guestItem);
              }
            });
  
            userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.total, 0);
            await userCart.save();
            await guestCart.deleteOne(); // Remove guest cart
            cart = userCart;
          } else {
            // No user cart exists, convert guest cart to user cart
            guestCart.userId = userId;
            guestCart.guestIp = null;
            await guestCart.save();
            cart = guestCart;
          }
        } else {
          // No guest cart, just use or create user cart
          cart = await Cart.findOne({ userId });
        }
      } else {
        // Guest
        cart = await Cart.findOne({ guestIp: ip });
      }
  
      // ✅ If no cart exists, create new
      if (!cart) {
        cart = new Cart({
          userId: userId || null,
          guestIp: userId ? null : ip,
          items: [{
            productId,
            quantity: parsedQuantity,
            price: productPrice,
            total: itemTotal
          }]
        });
      } else {
        const itemIndex = cart.items.findIndex(
          item => item.productId.toString() === productId
        );
  
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += parsedQuantity;
          cart.items[itemIndex].total = cart.items[itemIndex].quantity * productPrice;
          cart.items[itemIndex].price = productPrice;
        } else {
          cart.items.push({
            productId,
            quantity: parsedQuantity,
            price: productPrice,
            total: itemTotal
          });
        }
      }
  
      // ✅ Recalculate total
      cart.cartTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
      await cart.save();
    //   console.log(cart.cartTotal,'fgh',cart.items)
  
      return res.status(200).json({
        message: userId ? 'Item added to user cart' : 'Item added to guest cart',
        cart
      });
  
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  
  // create get cart

  const getCart = async (req, res) => {
    try {
      let userId = req.user?._id || null;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      let cart;
      let isGuest = !userId;
  
      if (userId) {
        // ✅ Logged-in user: check both guest and user carts
        const guestCart = await Cart.findOne({ guestIp: ip });
        let userCart = await Cart.findOne({ userId });
  
        if (guestCart) {
          if (userCart) {
            // ✅ Merge guest cart into user cart
            guestCart.items.forEach(guestItem => {
              const existingIndex = userCart.items.findIndex(
                item => item.productId.toString() === guestItem.productId.toString()
              );
              console.log('product',existingIndex)
  
              if (existingIndex > -1) {
                userCart.items[existingIndex].quantity += guestItem.quantity;
                userCart.items[existingIndex].total =
                  userCart.items[existingIndex].quantity * userCart.items[existingIndex].price;
              } else {
                userCart.items.push(guestItem);
              }
            });
  
            userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.total, 0);
            await userCart.save();
            await guestCart.deleteOne();
            cart = userCart;
          } else {
            // ✅ No user cart: convert guest cart
            guestCart.userId = userId;
            guestCart.guestIp = null;
            await guestCart.save();
            cart = guestCart;
          }
        } else {
          // ✅ Only user cart exists
          cart = await Cart.findOne({ userId });
        }
  
        isGuest = false;
      } else {
        // ✅ Guest only
        cart = await Cart.findOne({ guestIp: ip });
      }
  
      if (!cart || cart.items.length === 0) {
        return res.status(200).json({
          message: isGuest ? 'Guest cart is empty' : 'Cart is empty',
          cart: { items: [], cartTotal: 0 }
        });
      }
  
      await cart.populate('items.productId'); // Ensure products are populated
  
      return res.status(200).json({
        message: isGuest ? 'Guest cart fetched successfully' : 'Cart fetched successfully',
        cart
      });
  
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const increaseQuantity = async (req, res) => {
    try {
        const { productId } = req.body ;
        const userId = req.user?._id || null;
        const ip = req.guestIp || null;

        let cart;
        if (userId) {
            cart = await Cart.findOne({ userId });
        } else {
            cart = await Cart.findOne({ guestIp: ip });
        }

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(i => i.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: "Product not in cart" });

        item.quantity += 1;
        item.total = item.quantity * item.price;

        cart.cartTotal = cart.items.reduce((sum, i) => sum + i.total, 0);
        await cart.save();

        res.status(200).json({ message: "Quantity increased", cart });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const { productId, newQuantity } = req.body;
        const quantity = Number(newQuantity);

        if (quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than 0" });
        }

        const userId = req.user?._id || null;
        const ip = req.guestIp || null;
        let cart;

        if (userId) {
            cart = await Cart.findOne({ userId });
        } else {
            cart = await Cart.findOne({ guestIp: ip });
        }

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(i => i.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: "Product not in cart" });

        item.quantity = quantity;
        item.total = item.quantity * item.price;

        cart.cartTotal = cart.items.reduce((sum, i) => sum + i.total, 0);
        await cart.save();

        res.status(200).json({ message: "Quantity updated", cart });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const decreaseQuantity = async (req, res) => {
    try {
      const { productId } = req.body || req.perms;
      const userId = req.user?._id || null;
      const ip = req.guestIp || null;
  
      let cart;
      if (userId) {
        cart = await Cart.findOne({ userId });
      } else {
        cart = await Cart.findOne({ guestIp: ip });
      }
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({ message: "Product not found in cart" });
      }
  
      const item = cart.items[itemIndex];
      item.quantity -= 1;
  
      if (item.quantity <= 0) {
        cart.items.splice(itemIndex, 1); // Remove the item
      } else {
        item.total = item.quantity * item.price; // Update total if item remains
      }
  
      // Recalculate cart totals
      cart.cartTotal = cart.items.reduce((sum, i) => sum + i.total, 0);
      cart.totalPrice = cart.cartTotal; // Adjust this if you use discount/shipping
  
      if (cart.items.length === 0) {
        await Cart.deleteOne({ _id: cart._id });
        return res.status(200).json({ message: "Cart emptied and removed" });
      }
  
      await cart.save();
      return res.status(200).json({ message: "Quantity decreased", cart });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  const removeCart = async (req, res) => {
    try {
      const { productId } = req.body; // Not used in this case
      const userId = req.user?._id || null;
      const guestIp = req.guestIp || null;
  
      let cart;
  
      // Find cart based on user or guest IP
      if (userId) {
        cart = await Cart.findOne({ userId });
      } else if (guestIp) {
        cart = await Cart.findOne({ guestIp });
      }
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found!" });
      }
  
      // Delete the entire cart
      await Cart.deleteOne({ _id: cart._id });
  
      return res.status(200).json({ message: "Cart remove successfully" });
  
    } catch (error) {
      console.error("Internal server error", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }; // Adjust path as needed

const removeAllCart = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const guestIp = req.guestIp || null;

    let cart;

    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (guestIp) {
      cart = await Cart.findOne({ guestIp });
    }
    // console.log('items',userId)

    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    // Empty the cart
    // cart.items = [];
    // cart.cartTotal = 0;
    // cart.totalPrice = 0;
    // await cart.save();
    // use this line 

    const item = await Cart.deleteOne({ _id: cart._id });


    return res.status(200).json({ message: "All cart items removed", item });

  } catch (error) {
    console.error("Failed to remove all cart items:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

  

  module.exports={addToCart,getCart,increaseQuantity,updateQuantity,decreaseQuantity,removeCart,removeAllCart}