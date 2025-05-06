const UserModel = require('../models/users');
const ForgetPasswordHistory = require('../models/ForgetPasswordHistory')
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const { object } = require('joi');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// const ProductModel = require('../models/ProductModel')
const middleware = require('../middlewares/authMiddleware');
const { decode } = require('punycode');
// const { merge } = require('../routes/router');
const ObjectId = mongoose.Types.ObjectId;
// const { use } = require('../routes/router');
// const {jwtdestroy} = require('jwt-destroy');

const JWT_SECRET = process.env.JWT_SECRET;


const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        console.log(user);
        if (user) {
            return res.status(409).json({ message: 'User already exist, You can login', success: false });
        }
        const userModel = UserModel({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201).json({ message: 'User signup successfully..' })
    } catch (error) {
        console.error('Error during signup ', error)
        res.status(500).json({ message: 'Internal sever error...', success: false })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errorMsg = "Auth email and password is wrong";
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(403).json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        if (jwtToken) {
            await UserModel.findByIdAndUpdate(user._id, { jwt_token: jwtToken }, { new: true });
        }

        res.status(200).json({
            message: "User login successfully..",
            success: true,
            jwtToken,
            email: user.email,
            name: user.name
        });
    } catch (error) {
        console.error('Error during login', error)
        res.status(500).json({ message: 'Internal server error..', success: false })
    }
}

const logout = async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const jwtToken = req.headers.authorization.split(' ')[1];
        var payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
        if (payload) {
            const userData = await UserModel.findOne({ _id: payload._id });
            // console.log(userData);
            if (userData.jwt_token === jwtToken) {
                await UserModel.findByIdAndUpdate(userData._id, { jwt_token: "" }, { new: true });
                return res.status(200).json({
                    message: "You Are logout!",
                    success: true
                });
            }
            return res.status(500).json({
                message: "Token Not valid",
                success: false
            });
        }
    }
    return res.status(500).json({
        message: "Token Not valid",
        success: false
    });
}

const update = async (req, res) => {
    try {
        // ✅ Extract & verify token
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decoded); // Debugging

        const userId = decoded._id; // Extract ID from token        
        var userData= await UserModel.findOne({_id:userId});
        // userName="Praveen";
        // userPhoneNumber=9557042075;
        const reqData = req.body;
        const userName= reqData.username;
        const userMobile= reqData.mobile;
        // const userEmail= reqData.email;
        const userAddress=reqData.address;
        // console.log(reqData);
        // process.exit(1)
        if(userData){
            const updateData = await UserModel.updateOne({_id:userId},{$set:{name:userName,phone_number:userMobile,address:userAddress}});
            console.log(updateData);
            if(updateData.modifiedCount){
               return res.status(200).json({message:'user profile updated successfully!',data: await UserModel.findOne({_id:userId})});
            }
            return res.status(500).json({message:'something is wrong!'});
        }        
        return res.status(500).json({ message: "user not exist!"});

    } catch (err) {
        console.error("Error:", err); // Debugging

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};
// 1. Forgot Password Controller
const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) return res.status(400).json({ message: 'Email is required' });
    try {
        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Generate reset token and expiration time (1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;
        console.log('email',resetToken,'ghdfe',resetTokenExpiry )

      // Save token and expiry to user record
      const saveResetToken = await ForgetPasswordHistory.insertOne({
        email: email,
        resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry,
      })
      console.log('saveReset Token', saveResetToken);
      
    //   user.resetToken = resetToken;
    //   user.resetTokenExpiry = resetTokenExpiry;
    //   await user.save();
  
      // Create reset password link
      const resetLink = `https://yourfrontend.com/reset-password/${resetToken}`;
  
      // Email setup
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      // Send the reset email
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h3>Password Reset</h3>
          <p>You requested a password reset.</p>
          <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
          <p>This link will expire in 1 hour.</p>
        `,
      });
  
      res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // =============== RESET/UPDATE PASSWORD ================
  
  const updatePassword = async (req, res) => {
    const { token } = req.params;
    console.log('token',token);
    
    const { newPassword, confirmPassword } = req.body;
  
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
  
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
  
    try {
      const checkPasswordToken = await ForgetPasswordHistory.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
        status:true
      });
      console.log('fghnjk',checkPasswordToken);
    //   process.exit();
  
      if (!checkPasswordToken) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      // Fetch user by ID or email stored in token history
      const user = await UserModel.findOne({email:checkPasswordToken.email}); // or use tokenEntry.email
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      // Invalidate the token so it can't be reused
      checkPasswordToken.status=false
      await checkPasswordToken.save()
    //   await ForgetPasswordHistory.updateOne({status:hashedPassword,})
  
      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  
  
  // Reset Password using user info from middleware
  
  const resetPassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user;
  
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
  
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }
  
    try {
      const user = await UserModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
  
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  };


  

module.exports = { signup, login, logout, update,forgotPassword,resetPassword,updatePassword}