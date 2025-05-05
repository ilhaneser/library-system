const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const { uploadCover, uploadPdf } = require('../middleware/upload');

// Public routes
router.get('/', bookController.getBooks);
router.get('/search', bookController.searchBooks);
router.get('/genres', bookController.getGenres);
router.get('/:id', bookController.getBookById);
router.get('/:id/pdf', bookController.getPdf);

// Admin only routes
router.post('/', auth.isAdmin, uploadCover.single('coverImage'), bookController.addBook);
router.put('/:id', auth.isAdmin, uploadCover.single('coverImage'), bookController.updateBook);
router.delete('/:id', auth.isAdmin, bookController.deleteBook);
router.post('/:id/pdf', auth.isAdmin, uploadPdf.single('pdfFile'), bookController.uploadPdf);

module.exports = router;