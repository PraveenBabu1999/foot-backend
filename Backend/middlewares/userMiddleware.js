const jwt = require('jsonwebtoken');

const userMiddleware = async (req, res, next) => {
    try {
        // Get user's IP address
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log('User IP:', ip);

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded; // Set user info if valid token
            } catch (tokenErr) {
                console.warn('Invalid token. Proceeding as guest.');
                req.user = null;
            }
        } else {
            req.user = null; // No token, user not logged in
        }

        next(); // Always proceed
    } catch (error) {
        console.error("Middleware error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { userMiddleware };
