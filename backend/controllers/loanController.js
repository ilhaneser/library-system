const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');

// Create a loan (borrow a book)
exports.createLoan = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { bookId } = req.body;
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if book is available
    if (book.copiesOnLoan >= book.copies) {
      return res.status(400).json({ message: 'Book is not available' });
    }
    
    // Check if user already has this book on loan
    const existingLoan = await Loan.findOne({
      user: req.session.user.id,
      book: bookId,
      status: 'active'
    });
    
    if (existingLoan) {
      return res.status(400).json({ message: 'You already have this book on loan' });
    }
    
    // Set due date (2 weeks from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    
    // Create new loan
    const loan = new Loan({
      user: req.session.user.id,
      book: bookId,
      dueDate
    });
    
    // Update book copies on loan
    book.copiesOnLoan += 1;
    
    // Save both documents
    await Promise.all([loan.save(), book.save()]);
    
    res.status(201).json(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user loans
exports.getUserLoans = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const loans = await Loan.find({ 
      user: req.session.user.id 
    }).populate('book');
    
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Check if user owns this loan or is admin
    if (loan.user.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if loan is already returned
    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }
    
    // Update loan
    loan.returnDate = Date.now();
    loan.status = 'returned';
    
    // Update book copies on loan
    const book = await Book.findById(loan.book);
    book.copiesOnLoan -= 1;
    
    // Save both documents
    await Promise.all([loan.save(), book.save()]);
    
    res.json(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all loans (admin only)
exports.getAllLoans = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const loans = await Loan.find()
      .populate('book')
      .populate('user', 'name email');
    
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};