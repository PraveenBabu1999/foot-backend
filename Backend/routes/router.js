const express = require ('express');
const router = express();
const {signupvalidation,loginvalidation} = require ('../middlewares/register');
const { signup,login,logout,update,createProduct } = require('../controllers/authController');


router.post('/signup',signupvalidation,signup);

router.post ('/login',loginvalidation,login);
router.get ('/logout',logout);
router.put ('/update',update);
router.post('/upload',createProduct)

module.exports = router
