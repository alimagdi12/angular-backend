const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order')
const Stripe = require("stripe");
const jwt = require('jsonwebtoken');
const stripe = Stripe('sk_test_51OmeLSKnxvTYYIlSbsJaeNY5XyiliPJfGg6vA9JQev5T442TXqnEBg2OdZcFZx4Gs5EKVbA7lQ0GO4RyAiM0qbvj005mnOklV9');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth:{
    user:"alimagdi12367@gmail.com",
    pass:"aimorddjdtspxute"
}
});


exports.postContact=(req,res,next)=> {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    transporter.sendMail({
    to: req.user.email,
    from: 'alimagdi12367@gmail.com',
    subject: 'Order details',
    html: `
        <p>Contact Details:</p>
        <ul>
        <li>${name}</li>
        <li>${email}</li>
        <li>${message}</li>

        </ul>
    `
    });
};



exports.getCart = (req, res, next) => {
    const token = req.header('jwt');

    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const id = decodedToken.userId;
        User.findById(id)
            .populate('cart.items.productId')
            .exec()
            .then(user => {
                console.log(user);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                const products = user.cart.items;
                const totalPrice = products.reduce((total, p) => {
                    const price = p.productId && p.productId.price ? p.productId.price : 0;
                    return total + (price * p.quantity);
                }, 0); // Calculate total price
                console.log(totalPrice);
                console.log('this is cart', products);
                res.status(200).json({ products, totalPrice });

            })
            .catch(err => console.error(err));

    });

}



exports.postCart = (req, res, next) => {
    const token = req.header('jwt');
    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
        const userId = decodedToken.userId;
        console.log(`userId = ${userId}`);
        const prodId = req.body.productId;
        Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            User.findById(userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return user.addToCart(product);
            })
            .then(result => {
                console.log(result);
                res.status(201).json({msg:"product added to cart",result})
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ message: 'Error adding product to cart' });
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({ message: 'Error finding product' });
        });
    })
};


exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    let token= req.header('jwt')
    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
        User.findById(decodedToken.userId)
        .then(user=>{
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            return user.removeFromCart(prodId);
        })
        .catch(err=>{
            console.log(err);
            res.status(400).json({msg:err})
        })
    })
    
};


exports.postIncreaseCart = async (req, res, next) => {
    const productId = req.body.productId; 
    let token= req.header('jwt')
    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
        const user =  User.findById(decodedToken.userId)
        .then(data=>{
            return data.increaseQuantityInCart(productId) , res.status(200).json({ message: 'Quantity increased successfully' });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({ msg:'Server error to upload quantity' })
        })
        
    })
};

exports.postDecreaseCart = async (req, res, next) => {
  const productId = req.body.productId; 
    let token= req.header('jwt')
    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
        const user =  User.findById(decodedToken.userId)
        .then(data=>{
            return data.decreaseQuantityInCart(productId) , res.status(200).json({ message: 'Quantity decreased successfully' });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({ msg:'Server error to upload quantity' })
        })
        
    })
};   


exports.postOrder = (req, res, next) => {
    const token = req.header('jwt');

    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const id = decodedToken.userId;


        User.findById(id)
            .populate('cart.items.productId')
            .exec()
            .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const totalPrice = products.reduce((acc, product) => {
              return acc + (product.quantity * product.product.price);
            }, 0);
            
            const order = new Order({
                user: {
                email: decodedToken.email,
                userId: decodedToken.userId
                },
                products: products,
                totalPrice: totalPrice // Add total price to the order
            });

            return order.save()
                .then(() => {
                return user.clearCart();
                });
            })
            .then(() => {
                res.status(201).json({msg:"data added to order"});
            })
            .catch(err => console.log(err));
    })


};


exports.getOrders = (req, res, next) => {


    const token = req.cookies.token;

    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const id = decodedToken.userId;
        Order.find({ 'user.userId': id })
            .then(orders => {
            const ordersWithTotalPrice = orders.map(order => {
                const total = order.products.reduce((acc, product) => {
                return acc + (product.quantity * product.product.price);
                }, 0);
                return { ...order.toObject(), totalPrice: total };
            });
            res.status(201).json({ msg: "this is prders",orders });
        })
        .catch(err => console.log(err));
    })
};


exports.postPayement = async (req, res) => {
    const token = req.header('jwt');
    const totalPrice = req.body.totalPrice;

    jwt.verify(token, 'your_secret_key', async (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const id = decodedToken.userId;

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Your Product Name',
                            },
                            unit_amount: totalPrice * 100, // Stripe expects amount in cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${req.protocol}://${req.get('host')}/checkout-success?success=true`,
                cancel_url: `${req.protocol}://${req.get('host')}/cart?canceled=true`,
            });

            res.json({ url: session.url });
            User.findById(decodedToken.userId)
            .then(user=>{
                if (!user) {
                    return res.status(404).json({message: 'User not found'});
                }
                return user.clearCart();
            })
            .catch(err=>{
                console.log(err);
                res.status(400).json({msg:err})
            })
            
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error processing payment' });
            }
    });
};




exports.getProfile = (req, res, next) => {

    const token = req.header('jwt');

    jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const id = decodedToken.userId;
        User.findById(id)
            .then(user => {
            res.status(201).json({ msg: "this is user",user });
        })
        .catch(err => console.log(err));
    })
    
};



exports.postUpdateUser = async (req, res) => {
    let token= req.header('jwt')
    await jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
        if (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
        const { userId ,updatedUserName, updatedFirstName, updatedLastName, updatedBirthDay, updatedGender, updatedEmail, updatedPhoneNumber } = req.body;
        console.log(userId);
        const updatedUser = User.findById(userId)
        .then(user=>{
            console.log(user , req.body);
            user.userName = updatedUserName;
            user.firstName = updatedFirstName;
            user.lastName = updatedLastName;
            user.email = updatedEmail;
            user.phoneNumber = updatedPhoneNumber;
            user.birthDay = updatedBirthDay;
            user.gender = updatedGender;
            return user.save().then(result=>{
                console.log('user updated successfully');
                res.status(201).json({msg:"updated successfully",user})
            })
          })
            .catch((error)=>{
               console.log("Error in updating the user");
               console.log(error);
            });
    })

}

