
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
const UserAddress = require ('../models/UserAddress')

const checkout = async (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized. Please login to proceed to checkout.' });
      }
  
      const userId = req.user._id;
  
      //  Fetch user's cart
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty' });
      }
  
      
      // Placeholder response
      return res.status(200).json({ message: 'Checkout successful', cart });
  
    } catch (error) {
      console.error('Checkout error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    };
  };
  
  const userAddress = async (req,res) =>{
    try {
      console.log('Logged-in user:', req.user); // ✅ Debug line
  
      const { fullName, phone, address, city, state, postalCode, country } = req.body;
      const userId = req.user.id;
  
      if (!userId || !fullName || !phone || !address || !city || !postalCode || !country) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const newAddress = new UserAddress({
        userId,
        fullName,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
      });
  
      await newAddress.save();
  
      res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  //update user address

  const updateAddress = async (req, res) => {
    try {
      const userId = req.user.id; // from JWT
      const addressId = req.params.id; // from URL
  
      const {
        fullName,
        phone,
        address,
        city,
        state,
        postalCode,
        country
      } = req.body;
  
      // Log IDs for debug
      console.log('Updating address:', addressId, 'for user:', userId);
  
      // Make sure address exists and belongs to the logged-in user
      const addressToUpdate = await UserAddress.findOne({
        _id: addressId,
        userId: userId,
      });
  
      if (!addressToUpdate) {
        return res.status(404).json({ message: 'Address not found or unauthorized' });
      }
  
      // Update only if new values are provided
      addressToUpdate.fullName = fullName ?? addressToUpdate.fullName;
      addressToUpdate.phone = phone ?? addressToUpdate.phone;
      addressToUpdate.address = address ?? addressToUpdate.address;
      addressToUpdate.city = city ?? addressToUpdate.city;
      addressToUpdate.state = state ?? addressToUpdate.state;
      addressToUpdate.postalCode = postalCode ?? addressToUpdate.postalCode;
      addressToUpdate.country = country ?? addressToUpdate.country;
  
      const updated = await addressToUpdate.save();
  
      res.status(200).json({
        message: 'Address updated successfully',
        address: updated
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  


module.exports = {checkout,userAddress,updateAddress}