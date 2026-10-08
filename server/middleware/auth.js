const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'thermotwin_jwt_secure_secret_2026_key_deepmind';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    // Attach decoded user info
    req.user = decoded;

    // Optionally check if user exists in DB if DB is connected
    try {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user.toSafeObject();
      }
    } catch (e) {
      // If DB lookup fails or is disconnected, retain decoded token payload
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

module.exports = authMiddleware;
