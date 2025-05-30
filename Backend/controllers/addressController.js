
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
      const addressId = req.params.id;
      const userId = req.user.id; // Set by auth middleware
  
      const {
        fullName,
        phone,
        address,
        city,
        state,
        postalCode,
        country
      } = req.body;
  
      // Find address by ID and user
      const addressToUpdate = await UserAddress.findOne({ _id: addressId, userId });
  
      if (!addressToUpdate) {
        return res.status(404).json({ message: 'Address not found or unauthorized' });
      }
  
      // Conditionally update fields if new values provided
      addressToUpdate.fullName = fullName ?? addressToUpdate.fullName;
      addressToUpdate.phone = phone ?? addressToUpdate.phone;
      addressToUpdate.address = address ?? addressToUpdate.address;
      addressToUpdate.city = city ?? addressToUpdate.city;
      addressToUpdate.state = state ?? addressToUpdate.state;
      addressToUpdate.postalCode = postalCode ?? addressToUpdate.postalCode;
      addressToUpdate.country = country ?? addressToUpdate.country;
  
      // Save updated address
      const updated = await addressToUpdate.save();
  
      // Regenerate JWT including new address ID
      const token = jwt.sign(
        {
          _id: userId,
          addressId: updated._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.status(200).json({
        message: 'Address updated successfully',
        address: updated,
        token,
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const getAddress = async (req, res) => {
    try {
      const userId = req.user?.id; // safely access `id`
  
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized, user not found' });
      }
  
      const addresses = await UserAddress.find({ userId });
  
      res.status(200).json({
        message: "Addresses fetched successfully",
        addresses,
      });
    } catch (error) {
      // console.error('Internal server error!', error);
      return res.status(500).json({
        message: "Internal server error",
        error,
      });
    }
  };
  
  const deleteAddress = async (req, res) => {
    try {
      const userId = req.user?.id; // Extract user ID safely
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized, user not found" });
      }
  
      const addressId = req.params.id;
  
      const address = await UserAddress.findOneAndDelete({ _id: addressId, userId });
  
      if (!address) {
        return res.status(404).json({ message: 'Address not found or unauthorized' });
      }
  
      // console.log('Deleted address:', address);
  
      res.status(200).json({
        message: "Address deleted successfully",
        address,
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
  


module.exports = {userAddress,updateAddress,getAddress,deleteAddress}