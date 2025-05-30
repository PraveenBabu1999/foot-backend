const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  jwt_token: {
    type: String
  },
  age: {
    type: Number
  },
  mobile: {
    type: Number
  },
  address: {
    type: Object
  },
  resetToken: {
    type: String
  },
  resetTokenExpire: {
    type: Date
  }
}, { timestamps: true });

const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;
