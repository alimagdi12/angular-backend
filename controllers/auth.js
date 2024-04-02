const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const Cookies = require('js-cookie'); // Require js-cookie using CommonJS syntax
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth:{
    user:"alimagdi12367@gmail.com",
    pass:"aimorddjdtspxute"
}
})


exports.getLogin = (req, res, next) => {
  res.render('login', {
    path: '/login',
    pageTitle: 'Login',
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  res.render('signup', {
    path: '/signup',
    pageTitle: 'Signup',
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};



exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ msg: "please insert data" });
  }

  await User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).json({ msg: "Invalid email or password." });
      }

      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            const token = jwt.sign(
              {
                email: user.email,
                userId: user._id.toString()
              },
              'your_secret_key',
              { expiresIn: '1h' }
            );
            console.log('Token:', token);
            res.header({ jwt: token});
            res.status(200).json({ token: token });
          } else {
            res.status(422).json({ message: 'Invalid email or password.' });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ message: err });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    });
};



exports.postSignup = async (req, res, next) => {
  const userName = req.body.userName;
  const fName = req.body.fName;
  const lName = req.body.lName;
  const birthday = req.body.birthday;
  const gender = req.body.gender;
  const email = req.body.email;
  const mobile = req.body.mobile;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).json({msg:'please enter data'})
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new  User({
        userName,
        firstName:fName,
        lastName:lName,
        birthDay:birthday,
        gender,
        email,
        phoneNumber:mobile,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      return transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Signup succeeded!',
        html: '<h1>You successfully signed up!</h1>'
      });
    })
    .catch(err => {
      console.log(err);
    });
};




exports.postLogout = (req, res, next) => {
  // Remove the token cookie
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};




exports.getReset = (req, res, next) => {
  res.render('reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
  });
};

exports.postReset = (req, res, next) => {
  let foundUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with that email found.');
        return res.redirect('/reset');
      }

      foundUser = user;

      // Generate a JWT token with the user's email as payload
      const token = jwt.sign(
        {
          email: user.email
        },
        'your_secret_key',
        { expiresIn: '1h' }
      );

      // Save the token and its expiration date to the user document
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour

      return user.save();
    })
    .then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'shop@node-complete.com',
        subject: 'Password reset',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:5000/reset/${foundUser.resetToken}">link</a> to set a new password.</p>
        `
      });
    })
    .catch(err => {
      console.log(err);
    });
};


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  // Verify the JWT token
  jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
    if (err) {
      console.log(err);
      return res.redirect('/login');
    }
    const userId = decodedToken.userId;
    User.findById(userId)
      .then(user => {
        
        res.render('new-password', {
          path: '/new-password',
          pageTitle: 'New Password',
          userId: userId,
          passwordToken: token
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const passwordToken = req.params.token;
  let resetUser;

  // Verify the JWT token
  jwt.verify(passwordToken, 'your_secret_key', (err, decodedToken) => {
    if (err) {
      console.log(err);
      return res.redirect('/login');
    }
    const userId = decodedToken.userId;
    User.findById(userId)
      .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
      })
      .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
      })
      .then(result => {
        res.redirect('/login');
      })
      .catch(err => {
        console.log(err);
      });
  });
};
