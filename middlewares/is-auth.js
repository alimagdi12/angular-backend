const jwt = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed' });
        next()
    }


};

