const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName:{
    type:String,
    required:false
  },
  firstName:{
    type:String,
    required:false
  },
  lastName:{
    type:String,
    required:false
  },
  birthDay:{
    type:String,
    required:false
  },
  gender:{
    type:String,
    required:true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber:{
    type:String,
    required:false
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.increaseQuantityInCart = function(productId) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === productId.toString();
  });
  if (cartProductIndex >= 0) {
    this.cart.items[cartProductIndex].quantity++;
    return this.save();
  }
};


userSchema.methods.decreaseQuantityInCart = function(productId) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === productId.toString();
  });
  if (cartProductIndex >= 0) {
    const currentQuantity = this.cart.items[cartProductIndex].quantity;
    if (currentQuantity > 1) {
      this.cart.items[cartProductIndex].quantity--;
    } else {
      // If quantity is already 1, remove the item from the cart
      this.cart.items.splice(cartProductIndex, 1);
    }
    return this.save();
  }
};



userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
