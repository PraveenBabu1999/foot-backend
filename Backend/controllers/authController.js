const UserModel = require('../models/users');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const { object } = require('joi');
const jwt = require('jsonwebtoken');
const ProductModel = require('../models/ProductModel')
// const { merge } = require('../routes/router');
const ObjectId = mongoose.Types.ObjectId;
// const { use } = require('../routes/router');
// const {jwtdestroy} = require('jwt-destroy');


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

const createProduct = async (req, res) => {
    try {
        console.log("Incoming request for product creation...");

        // Validate token
        if (!req.headers.authorization) {
            console.error("Authorization header missing");
            return res.status(401).json({ message: "Authorization header missing." });
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            console.error("Token does not exist");
            return res.status(401).json({ message: "Token does not exist." });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error("JWT Verification failed:", jwtError);
            return res.status(403).json({ message: "Invalid or expired token." });
        }

        const user_id = decoded._id;
        console.log("User ID from token:", user_id);

        // Fetch user data
        const userData = await UserModel.findById(user_id);
        if (!userData) {
            console.error("User not found for ID:", user_id);
            return res.status(404).json({ message: "User not found." });
        }

        console.log("User data fetched successfully:", userData);

        // Extract product details
        const { 
            product_name, product_image, product_slug, product_brand, 
            product_price, product_category, product_subcategory, 
            product_variant, product_description, product_review 
        } = req.body;

        // Ensure required fields exist
        if (!product_name || !product_price || !product_category) {
            console.error("Missing required fields:", { product_name, product_price, product_category });
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Create product
        const newProduct = new ProductModel({
            name: product_name,
            image: product_image || null, // Handle optional fields
            slug: product_slug || null,
            brand: product_brand || null,
            price: product_price,
            category: product_category,
            subCategory: product_subcategory || null,
            variant: product_variant || null,
            description: product_description || null,
            review: product_review || [],
            createdBy: user_id
        });

        // Save product to database
        const saveData = await newProduct.save();
        console.log("Product saved successfully:", saveData);

        return res.status(201).json({ message: "Product created successfully!", product: saveData });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = { signup, login, logout, update,createProduct }