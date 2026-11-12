/**
 * auth.js
 * Owner: Asaph Graham
 * Protects routes that require staff authentication using JWT
 */

const jwt = require('jsonwebtoken');

/**
 * Protect middleware
 * Checks for a valid JWT in the Authorization header
 * Header format: Authorization: Bearer <token>
 */
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login as staff.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, role, email }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Generate a JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

module.exports = {
  protect,
  generateToken
};
