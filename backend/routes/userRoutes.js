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

// Wishlist routes - order matters for route matching!
router.get('/wishlist/check/:bookId', auth.isLoggedIn, userController.checkWishlist);
router.get('/wishlist', auth.isLoggedIn, userController.getWishlist);
router.post('/wishlist', auth.isLoggedIn, userController.addToWishlist);
router.delete('/wishlist/:bookId', auth.isLoggedIn, userController.removeFromWishlist);

// Admin routes
router.get('/all', auth.isAdmin, userController.getAllUsers);

module.exports = router;