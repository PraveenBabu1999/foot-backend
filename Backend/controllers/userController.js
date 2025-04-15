
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

const checkout = async (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized. Please login to proceed to checkout.' });
      }
  
      const userId = req.user._id;
  
      // ✅ Fetch user's cart
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty' });
      }
  
      // ✅ You can now handle order creation logic here
      // Example:
      // - Calculate total
      // - Create order document
      // - Empty the cart
      // - Send confirmation
  
      // Placeholder response
      return res.status(200).json({ message: 'Checkout successful', cart });
  
    } catch (error) {
      console.error('Checkout error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  


module.exports = {checkout}