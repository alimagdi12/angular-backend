const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const port = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const cookieParser = require('cookie-parser'); 


const app = express();

// setting the option of the cors
const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true // enable credentials
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', 'views');



// app.use((req, res, next) => {
//   const token = req.cookies.token;
//   if (token) {
//     req.headers['Authorization'] = `Bearer ${token}`;
//   }
//   next();
// });

app.get('/', (req, res) => {
  res.send(req.cookies.token);
});
app.use(authRoutes)
app.use(adminRoutes)
app.use(userRoutes)

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(port);
  })
  .catch(err => {
    console.log(err);
  });


