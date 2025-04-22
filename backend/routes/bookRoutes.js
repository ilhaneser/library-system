const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', bookController.getBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Admin only routes
router.post('/', auth.isAdmin, bookController.addBook);
router.put('/:id', auth.isAdmin, bookController.updateBook);
router.delete('/:id', auth.isAdmin, bookController.deleteBook);

module.exports = router;