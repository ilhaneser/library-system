const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Get reviews for a book
router.get('/book/:bookId', reviewController.getBookReviews);

// Check if user can review a book
router.get('/can-review/:bookId', auth.isLoggedIn, reviewController.canReviewBook);

// Get user's review for a book
router.get('/user-review/:bookId', auth.isLoggedIn, reviewController.getUserBookReview);

// Create a review
router.post('/', auth.isLoggedIn, reviewController.createReview);

// Update a review
router.put('/:id', auth.isLoggedIn, reviewController.updateReview);

// Delete a review
router.delete('/:id', auth.isLoggedIn, reviewController.deleteReview);

module.exports = router;