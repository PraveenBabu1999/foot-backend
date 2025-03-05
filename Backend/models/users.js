

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
});

const UserModel = mongoose.model('user',UserSchema)
module.exports = UserModel