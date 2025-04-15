const express = require ('express');
const router = express();
const {userMiddleware} = require ('../middlewares/userMiddleware');
const {authMiddleware} = require ('../middlewares/authMiddleware')
const {getAllProducts,addToCart,getCart,} = require ('../controllers/productController')
const {checkout} = require ('../controllers/userController')


router.get('/allProducts',userMiddleware,getAllProducts);
router.post('/aadToCart',userMiddleware,addToCart);
router.get('/cart',userMiddleware,getCart);
router.get('/checkout',authMiddleware, checkout)



module.exports = router