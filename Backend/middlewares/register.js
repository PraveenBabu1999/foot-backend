 const Joi = require ('joi');
const { schema } = require('../models/users');
 

 const signupvalidation = (req, res, next)=>{
    const signupValidation = Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "Name is required",
        }),
        email: Joi.string().email().required().messages({
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
        }),
        password: Joi.string().min(6).required().messages({
            "string.min": "Password must be at least 6 characters long",
            "string.empty": "Password is required",
        }),
    });
    const {error} = signupValidation.validate(req.body);
    console.log(error);
    if (error) 
        return res.status(400).json({message:'Bad request',error: error.dedails[0].message})
    
    next();
 }

 const loginvalidation = (req, res, next)=>{
    const loginValidation = Joi.object({
        email: Joi.string().email().required().messages({
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
        }),
        password: Joi.string().min(6).required().messages({
            "string.min": "Password must be at least 6 characters long",
            "string.empty": "Password is required",
        }),
    });
    const {error} = loginValidation.validate(req.body);
      if(error)
        return res.status(400).json({message: 'Bed request',error: error.details[0].message})
    next();
 }
 

 module.exports ={signupvalidation,loginvalidation}