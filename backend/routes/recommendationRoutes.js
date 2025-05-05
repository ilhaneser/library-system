const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Get popular books (personalized if user is logged in)
router.get('/popular', recommendationController.getPopularBooks);

// Get trending books (most borrowed in last 30 days)
router.get('/trending', recommendationController.getTrendingBooks);

// Get highly rated books
router.get('/top-rated', recommendationController.getHighlyRatedBooks);

module.exports = router;