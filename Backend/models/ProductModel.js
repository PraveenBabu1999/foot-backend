const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null }, // Image URL
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, default: null },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    subCategory: { type: String, default: null },
    variant: { 
        type: Array, // Array of variants (e.g., colors, sizes)
        default: [] 
    },
    description: { type: String, default: null },
    review: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
