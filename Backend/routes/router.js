const express = require ('express');
const router = express();
const {signupvalidation,loginvalidation} = require ('../middlewares/register');
const {authMiddleware} = require ("../middlewares/authMiddleware")
const { signup,login,logout,update } = require('../controllers/authController');
const {createProduct,deleteData,updateProduct,readProduct} = require ('../controllers/productController')


router.post('/signup',signupvalidation,signup);

router.post ('/login',loginvalidation,login);
router.get ('/logout',logout);
router.put ('/update',update);
router.post('/upload',createProduct);
router.delete('/delete',authMiddleware,deleteData);
router.put('/updateProduct',authMiddleware,updateProduct);
router.get('/readProducts',authMiddleware,readProduct);

module.exports = router
