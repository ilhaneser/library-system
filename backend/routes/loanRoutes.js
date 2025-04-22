const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');

// User routes
router.get('/myloans', auth.isLoggedIn, loanController.getUserLoans);
router.post('/', auth.isLoggedIn, loanController.createLoan);
router.put('/:id/return', auth.isLoggedIn, loanController.returnBook);

// Admin routes
router.get('/', auth.isAdmin, loanController.getAllLoans);

module.exports = router;