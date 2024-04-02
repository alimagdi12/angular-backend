const Product = require('../models/product');
const jwt = require('jsonwebtoken');




exports.getProducts = async (req,res,next)=>{
    await Product.find()
    .then(data=>{
        res.status(200).json({data})
    })
    .catch(err=>{
        console.log(err);
    })
}


exports.getProduct = async (req,res,next)=>{
    await  Product.findById(req.params.id)
    .then((data)=>{
        if(!data){
            return res.status(404).json({message:"No product found"});
        }
        res.status(200).json(data)
    }).catch(err=>{
        console.log(err);
        next(err)
    });
}

exports.postAddProduct = async (req, res, next) => {
    let token= req.header('jwt')
    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
        const category = req.body.category;
        const title = req.body.title;
        const imageUrl = req.body.imageUrl;
        const price = req.body.price;
        const description = req.body.description;
        const details = req.body.details;
        const product = new Product({
            category,
            title,
            price,
            description,
            details,
            imageUrl,
            userId: decodedToken.userId
        });
        product
        .save()
        .then(result => {
            console.log('Created Product');
            res.status(201).json({products:result})
        })
        .catch(err => {
            console.log(err);
        });

    })
};




exports.postEditProduct = async (req, res, next) => {
    const prodId = req.params.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const updatedDetails = req.body.details;
    const updatedCategory = req.body.category;

    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        product.category = updatedCategory;
        product.details = updatedDetails;

        const result = await product.save();
        console.log('UPDATED PRODUCT!');
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.deleteOne({ _id: prodId})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({message: "The product has been deleted."});
    })
    .catch(err => console.log(err));
};

