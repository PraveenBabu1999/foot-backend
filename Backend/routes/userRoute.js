const express = require ('express');
const router = express();
const {userMiddleware} = require ('../middlewares/userMiddleware');
const {authMiddleware} = require ('../middlewares/authMiddleware');
const {Middleware} = require ('../middlewares/Middleware');
const {getAllProducts,addToCart,getCart,} = require ('../controllers/productController')
const {checkout, userAddress,updateAddress} = require ('../controllers/userController')


router.get('/allProducts',userMiddleware,getAllProducts);
router.post('/aadToCart',userMiddleware,addToCart);
router.get('/cart',userMiddleware,getCart);
router.get('/checkout',authMiddleware, checkout);
router.post('/userAddress',Middleware,userAddress);
router.post('/updateAddress',Middleware,updateAddress)



module.exports = router