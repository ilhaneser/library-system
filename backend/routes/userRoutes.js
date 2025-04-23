const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);

// Protected routes
router.get('/profile', auth.isLoggedIn, userController.getUserProfile);
router.get('/wishlist', auth.isLoggedIn, userController.getWishlist);

// Admin routes
router.get('/all', auth.isAdmin, userController.getAllUsers);

module.exports = router;