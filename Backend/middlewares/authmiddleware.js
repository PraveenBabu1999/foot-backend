const UserModel = require ('../models/users')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');

const middleware = async (req, res) =>{
    const token = req.headers.authorization.spilt(' ')[1]
    if (!token) {
        return res.status(401).json({message:'unauthorized, Token no provided'});
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const user_id = decoded._id
    console.log(user_id);
    
};

module.exports={middleware}