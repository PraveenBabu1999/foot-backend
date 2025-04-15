
const ProductModel = require('../models/ProductModel');
const mongoose = require('mongoose');
const readProduct = async (req, res) =>{
    try {
        const allProduct = await ProductModel.find();
        console.log(allProduct);
        return res.status(200).json({message:'Show all Product successfully'})
    } catch (error) {
        return res.status(500).json({message:'Internal server error!'})
    }
}

module.exports = {readProduct};