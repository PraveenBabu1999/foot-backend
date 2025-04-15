const express = require ('express');
const router = express();
const {signupvalidation,loginvalidation} = require ('../middlewares/register');
const {authMiddleware} = require ("../middlewares/authMiddleware");
const {userMiddleware} = require ("../middlewares/userMiddleware");
const { signup,login,logout,update } = require('../controllers/authController');
const {createProduct,deleteData,updateProduct,readProduct,getAllProducts,addToCart, getCart} = require ('../controllers/productController');


router.post('/signup',signupvalidation,signup);
router.post ('/login',loginvalidation,login);
router.get ('/logout',logout);
router.put ('/update',update);
router.post('/upload',createProduct);
router.delete('/delete',authMiddleware,deleteData);
router.put('/updateProduct',authMiddleware,updateProduct);
router.get('/readProducts',authMiddleware,readProduct);
router.get('/allProducts',userMiddleware,getAllProducts);
router.post('/aadToCart',userMiddleware,addToCart);
router.get('/cart',userMiddleware,getCart);

module.exports = router
