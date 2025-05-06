const mongoose = require('mongoose');

const forgetSchema = new mongoose.Schema({
  user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        
      },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    
  },

  // Optional fields
  resetToken: {
    type: String
  },

  resetTokenExpiry: {
    type: Date
  },
  status:{
    type: Boolean,
    default:true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ForgetPasswordHistory', forgetSchema);
