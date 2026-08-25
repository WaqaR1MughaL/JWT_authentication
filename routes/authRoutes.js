const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// These endpoints change server state and must be called with POST.
router.get(['/register', '/login', '/refresh', '/logout'], (req, res) => {
  res.set('Allow', 'POST');
  res.status(405).json({
    message: 'Use POST with a JSON request body for this endpoint',
  });
});

// Protected route — any logged-in user
router.get('/me', authMiddleware, authController.getMe);

// Protected + role-restricted route — admins only
router.get('/admin-only', authMiddleware, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});

module.exports = router;
