const express = require ('express');
const router = express();
const {userMiddleware} = require ('../middlewares/userMiddleware');
const {authMiddleware} = require ('../middlewares/authMiddleware');
const {Middleware} = require ('../middlewares/Middleware');
const {getAllProducts} = require ('../controllers/productController');
const { userAddress,updateAddress} = require ('../controllers/userController');
const {checkout} = require('../controllers/checkout');
const {addToCart,getCart,} = require ('../controllers/CartControllers');


router.get('/allProducts',userMiddleware,getAllProducts);
router.post('/aadToCart',userMiddleware,addToCart);
router.get('/cart',userMiddleware,getCart);
router.post('/userAddress',Middleware,userAddress);
router.post('/updateAddress',Middleware,updateAddress);
router.post('/checkout',Middleware, checkout);



module.exports = router