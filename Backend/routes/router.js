const express = require ('express');
const router = express();
const {signupvalidation,loginvalidation} = require ('../middlewares/register');
const {authMiddleware} = require ("../middlewares/authMiddleware");
const {userMiddleware} = require ("../middlewares/userMiddleware");
const verifyResetToken = require("../middlewares/verifyResetToken");
const { signup,login,logout,update,forgotPassword,resetPassword,updatePassword } = require('../controllers/authController');
const {createProduct,deleteData,updateProduct,readProduct,} = require ('../controllers/productController');


router.post('/signup',signupvalidation,signup);
router.post ('/login',loginvalidation,login);
router.post('/forgot-password', forgotPassword);
router.post('/update/password/:token',updatePassword);
router.post('/reset-password',verifyResetToken,resetPassword);
router.get ('/logout',logout);
router.put ('/update',update);
router.post('/upload',createProduct);
router.delete('/delete',authMiddleware,deleteData);
router.put('/updateProduct',authMiddleware,updateProduct);
router.get('/readProducts',authMiddleware,readProduct);

module.exports = router
