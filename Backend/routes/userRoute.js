const express = require ('express');
const router = express();
const {userMiddleware} = require ('../middlewares/userMiddleware');
const {getAllProducts,addToCart,getCart} = require ('../controllers/productController')

router.get('/allProducts',userMiddleware,getAllProducts);
router.post('/aadToCart',userMiddleware,addToCart);
router.get('/cart',userMiddleware,getCart);




module.exports = router