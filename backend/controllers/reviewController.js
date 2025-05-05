const Review = require('../models/Review');
const Book = require('../models/Book');
const Loan = require('../models/Loan');

// Create a review
exports.createReview = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { bookId, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if the user has borrowed this book
    const hasBorrowed = await Loan.findOne({
      user: req.session.user.id,
      book: bookId
    });
    
    if (!hasBorrowed) {
      return res.status(403).json({ message: 'You can only review books you have borrowed' });
    }
    
    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      user: req.session.user.id,
      book: bookId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    
    // Create the review
    const review = new Review({
      user: req.session.user.id,
      book: bookId,
      rating,
      comment: comment || ''
    });
    
    await review.save();
    
    // Update book average rating
    const allReviews = await Review.find({ book: bookId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    book.averageRating = averageRating;
    book.reviewCount = allReviews.length;
    await book.save();
    
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user
    if (review.user.toString() !== req.session.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update the review
    review.rating = rating;
    review.comment = comment || review.comment;
    
    await review.save();
    
    // Update book average rating
    const bookId = review.book;
    const allReviews = await Review.find({ book: bookId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    const book = await Book.findById(bookId);
    book.averageRating = averageRating;
    await book.save();
    
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user or if the user is an admin
    if (review.user.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const bookId = review.book;
    
    // Delete the review
    await Review.findByIdAndDelete(req.params.id);
    
    // Update book average rating
    const allReviews = await Review.find({ book: bookId });
    
    const book = await Book.findById(bookId);
    
    if (allReviews.length === 0) {
      book.averageRating = 0;
      book.reviewCount = 0;
    } else {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      book.averageRating = averageRating;
      book.reviewCount = allReviews.length;
    }
    
    await book.save();
    
    res.json({ message: 'Review removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get reviews for a book
exports.getBookReviews = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const reviews = await Review.find({ book: bookId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a user's review for a book
exports.getUserBookReview = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const bookId = req.params.bookId;
    
    const review = await Review.findOne({
      user: req.session.user.id,
      book: bookId
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Check if user can review a book
exports.canReviewBook = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const bookId = req.params.bookId;
    
    // Check if user has borrowed the book
    const hasBorrowed = await Loan.findOne({
      user: req.session.user.id,
      book: bookId
    });
    
    // Check if user has already reviewed the book
    const hasReviewed = await Review.findOne({
      user: req.session.user.id,
      book: bookId
    });
    
    res.json({
      canReview: hasBorrowed !== null && hasReviewed === null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};