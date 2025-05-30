
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


const deleteData = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        if (!req.body) {
            return res.status(400).json({ message: "Bad Request: No data received." });
        }

        const ProductID = req.body._id;
        console.log("Product ID:", ProductID);

        if (!ProductID) {
            return res.status(400).json({ message: "Bad Request: Product ID is required." });
        }

        const Product = await ProductModel.findById(ProductID);
        console.log("Product Found:", Product);

        if (!Product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Delete the product
        await ProductModel.findByIdAndDelete(ProductID);
        return res.status(200).json({ message: "Product deleted successfully." });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
};

const updateProduct = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Bad request. No data received." });
        }

        const productId = req.body._id;
        console.log('Product ID is:', productId);

        // Validate MongoDB ObjectId
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID.' });
        }

        // Define fields to update
        const updatedData = { name: req.body.name };

        // Find and update product
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { $set: updatedData },
            { new: true } // Return the updated document
        );

        // Check if the product was found
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        console.log('Updated Product:', updatedProduct);

        return res.status(200).json({ message: "Product updated successfully!", updatedProduct });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

const readProduct = async (req, res) => {
    try {

        const products = await ProductModel.find({ createdBy: req.user._id });
        // console.log(products);


        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        // console.log(products);

        return res.status(200).json({
            message: "Get all products successfully.",
            products  // ✅ Include the products in the response
        });

    } catch (error) {
        // console.error('Internal server error!', error);
        return res.status(500).json({ message: 'Internal Server error!' });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find()
        console.log("gbhnmk", products)

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Products not found" });
        };

        return res.status(200).json({ message: "Get All Products successfully", products })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({ message: "Internal server error!" })
    }
};


  



module.exports = { createProduct, deleteData, updateProduct, readProduct, getAllProducts }