const path = require('path');
const { body } = require('express-validator/check');
const express = require('express');
const isAdmin = require('../middlewares/is-admin');
const router = express.Router();
const adminController = require('../controllers/admin')


router.get('/products',
// isAdmin,
adminController.getProducts
);


router.get('/product/:id',
adminController.getProduct
)



router.post(
  '/add-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAdmin,
  adminController.postAddProduct
);


router.post('/upload',
  adminController.uploadImage
)


router.put(
  "/edit-product/:productId",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAdmin,
  adminController.postEditProduct
);



router.delete(
  "/delete-product/:productId",
  isAdmin,
  adminController.postDeleteProduct
);





module.exports = router;


