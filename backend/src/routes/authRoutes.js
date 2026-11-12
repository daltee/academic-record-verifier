/**
 * authRoutes.js
 * Simple staff login for obtaining a JWT
 * Owner: Asaph Graham (Auth)
 */

const express = require('express');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Demo staff login – returns a JWT
 *
 * Demo credentials (for the Etivity):
 *   email:    registrar@must.ac.ug
 *   password: staff123
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  // Simple hardcoded staff account for the prototype
  // In a real system this would check a User collection with hashed passwords
  if (email === 'registrar@must.ac.ug' && password === 'staff123') {
    const token = generateToken({
      id: 'staff-001',
      name: 'Academic Registrar',
      role: 'staff',
      email: 'registrar@must.ac.ug'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        name: 'Academic Registrar',
        role: 'staff',
        email: 'registrar@must.ac.ug'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid email or password'
  });
});

module.exports = router;
