const express = require ('express');
const router = express();
const {userMiddleware} = require ('../middlewares/userMiddleware');
const {authMiddleware} = require ('../middlewares/authMiddleware');
const {Middleware} = require ('../middlewares/Middleware');
const {getAllProducts} = require ('../controllers/productController');
const { userAddress,updateAddress,getAddress,deleteAddress} = require ('../controllers/addressController');
const {checkout} = require('../controllers/checkout');
const {addToCart,getCart,increaseQuantity,updateQuantity,decreaseQuantity,removeCart,removeAllCart} = require ('../controllers/CartControllers');
const {postReviews,getReviews,updateReviews,deleteReviews} = require('../controllers/reviews');


router.get('/allProducts',userMiddleware,getAllProducts);
router.post('/aadToCart',userMiddleware,addToCart);
router.get('/cart',userMiddleware,getCart);
router.post('/increase/cart/quantity',userMiddleware,increaseQuantity);
router.post('/decrease/cart/quantity',userMiddleware,decreaseQuantity);
router.delete('/remove/cart',userMiddleware,removeCart);
router.delete('/remove/allCart',userMiddleware,removeAllCart);
router.post('/update-quantity',userMiddleware,updateQuantity)
router.post('/userAddress',Middleware,userAddress);
router.put('/updateAddress/:id',Middleware,updateAddress);
router.get('/get/address',Middleware,getAddress)
router.delete('/delete/address/:id',Middleware,deleteAddress);
router.post('/checkout',Middleware, checkout);
router.post('/reviews/:productId',userMiddleware,postReviews);
router.get('/reviews/:productId',userMiddleware, getReviews);
router.put('/update/reviews/:productId',userMiddleware,updateReviews);
router.delete('/delete/reviews/:productId',userMiddleware,deleteReviews)



module.exports = router