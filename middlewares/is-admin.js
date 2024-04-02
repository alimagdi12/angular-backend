const jwt = require('jsonwebtoken');

module.exports= (req, res, next) => {
  const token = req.headers['jwt'] ;

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const email = decodedToken.email;
    if(email==='alimagdi12367@gmail.com'){
        return next()
    }else{
      return res.status(500).json({ message: 'Internal server error' });
      next()
    }
  });
};

