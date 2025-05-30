const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  subcategory_name: {
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Subcategory', subCategorySchema);
