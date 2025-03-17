const UserModel = require ('../models/users')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');

const authMiddleware = async (req, res,next) =>{
    try {
        if (!req.headers.authorization) {
            console.error('Authorization headers missing.');
            return res.status(401).json({message:"Authorization headers missing."})
        }
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({message:'unauthorized, Token no provided'});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded
        // console.log(user_id);
        next();
    } catch (error) {
        console.error("Internal server error!",error);
        return res.status(500).json({message:'Internal server error!'})
    }
};

module.exports={authMiddleware}