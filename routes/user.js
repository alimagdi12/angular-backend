const express = require('express');
const { check, body } = require('express-validator/check');
const userController = require('../controllers/user');
const User = require('../models/user');
const router = express.Router();



router.get('/cart',
    // isAuth,
userController.getCart
);

router.post('/cart', 
// isAuth, 
userController.postCart);


router.post('/cart-add-quantity',
// isAuth,
userController.postIncreaseCart
)


router.post('/cart-decrease-quantity',
// isAuth,
userController.postDecreaseCart
)


router.post('/cart-delete',
// isAuth,
userController.postCartDeleteProduct
)

router.post('/create-order', 
// isAuth, 
userController.postOrder);


router.get('/orders', 
// isAuth, 
userController.getOrders);



router.get('/profile',
// isAuth,
userController.getProfile);

router.put('/updateUser',
// isAuth,
userController.postUpdateUser);


router.put('/payement', 
// isAuth, 
userController.postPayement);




module.exports = router;
