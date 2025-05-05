const jwt = require('jsonwebtoken');

const Middleware = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization headers missing.' });
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized, token not provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Save both userId and addressId from token
        req.user = {
            id: decoded._id || decoded,
            addressId: decoded.addressId // 👈 added addressId to req.user
        };

        // console.log('Decoded User:', req.user);
        next();

    } catch (error) {
        console.error('Middleware Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { Middleware };
