const mongoose = require('mongoose');

const childCategorySchema = new mongoose.Schema({
  childcategory_name: {
    type: String,
    required: false,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Childcategory', childCategorySchema);
