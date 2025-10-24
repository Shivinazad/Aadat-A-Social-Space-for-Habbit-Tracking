// Load environment variables for the secret key
require('dotenv').config(); 

const jwt = require('jsonwebtoken');

// Use the same secret key defined in index.js and .env
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_12345';

/**
 * Middleware function to verify the JSON Web Token (JWT) provided in the request header.
 * If valid, it attaches the user's ID to req.user and calls next().
 * If invalid or missing, it returns a 401 Unauthorized error.
 */
module.exports = (req, res, next) => {
    // 1. Check for the Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied.' });
    }

    // Expected format: "Bearer TOKEN_STRING"
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'Invalid token format, authorization denied.' });
    }

    try {
        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Attach the decoded user payload (id, email) to the request object
        // This makes the user's ID available in all protected route handlers (req.user.id)
        req.user = decoded; 

        // Move to the next middleware or route handler
        next(); 

    } catch (e) {
        // Token is not valid (expired, corrupted, wrong secret)
        res.status(401).json({ msg: 'Token is not valid.' });
    }
};
