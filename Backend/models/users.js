

const { json } = require('express');
const { types, required, object } = require('joi');
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true,    // Email must be unique
        lowercase: true  // Convert email to lowercase
    },
    password:{
        type:String,
        required:true
    },
    jwt_token:{
        type:String,
        required:false
    },
    age:{
        type:Number,
        required:false
    },
    mobile:{
        type:Number,
        required:false,
    },
    address:{
        type: Object,
        required:false
    }
});

const UserModel = mongoose.model('user',UserSchema)
module.exports = UserModel