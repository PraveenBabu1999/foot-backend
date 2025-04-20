const jwt = require('jsonwebtoken');

const userMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            // console.log('Token:', token);

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;

                // ✅ Get user ID from token
                const userId = decoded || decoded._id;
                console.log('Authenticated user ID:', userId);

            } catch (tokenErr) {
                console.warn('Invalid token. Proceeding as guest.');
                req.user = null;
            }
        } else {
            // ✅ No token: user is guest — get IP address
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            console.log('Guest User IP:', ip);

            req.user = null;
        }

        next();
    } catch (error) {
        console.error("Middleware error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { userMiddleware };
