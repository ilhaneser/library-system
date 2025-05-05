const Book = require('../models/Book');
const Loan = require('../models/Loan');
const fs = require('fs');
const path = require('path');

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new book
exports.addBook = async (req, res) => {
  try {
    const bookData = { ...req.body };
    
    // Handle file uploads if any
    if (req.file) {
      if (req.file.fieldname === 'coverImage') {
        bookData.coverImage = req.file.filename;
      } else if (req.file.fieldname === 'pdfFile') {
        bookData.pdfFile = req.file.filename;
      }
    }
    
    const book = new Book(bookData);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const bookData = { ...req.body };
    
    // Handle file uploads if any
    if (req.file) {
      if (req.file.fieldname === 'coverImage') {
        bookData.coverImage = req.file.filename;
      } else if (req.file.fieldname === 'pdfFile') {
        bookData.pdfFile = req.file.filename;
      }
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      bookData,
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    // Check if book is on loan
    const activeLoans = await Loan.find({
      book: req.params.id,
      status: 'active'
    });
    
    if (activeLoans.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete book with active loans'
      });
    }
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Delete associated files if they exist
    if (book.coverImage && book.coverImage !== 'default-book-cover.jpg') {
      const coverPath = path.join(__dirname, '../uploads/covers', book.coverImage);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    if (book.pdfFile) {
      const pdfPath = path.join(__dirname, '../uploads/pdfs', book.pdfFile);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }
    
    await Book.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const { query, genre, minRating } = req.query;
    
    // Build search criteria
    const searchCriteria = {};
    
    // Text search
    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Genre filter
    if (genre && genre !== 'All') {
      searchCriteria.genre = genre;
    }
    
    // Rating filter
    if (minRating) {
      searchCriteria.averageRating = { $gte: Number(minRating) };
    }
    
    // Execute search
    const books = await Book.find(searchCriteria).sort({ averageRating: -1 });
    
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get book genres
exports.getGenres = async (req, res) => {
  try {
    const genres = Book.schema.path('genre').enumValues;
    res.json(genres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Upload PDF for a book
exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Delete previous PDF if it exists
    if (book.pdfFile) {
      const previousPdfPath = path.join(__dirname, '../uploads/pdfs', book.pdfFile);
      if (fs.existsSync(previousPdfPath)) {
        fs.unlinkSync(previousPdfPath);
      }
    }
    
    // Update book with new PDF filename
    book.pdfFile = req.file.filename;
    await book.save();
    
    res.json({ 
      message: 'PDF uploaded successfully',
      pdfFile: book.pdfFile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Stream PDF file
exports.getPdf = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (!book.pdfFile) {
      return res.status(404).json({ message: 'No PDF available for this book' });
    }
    
    const pdfPath = path.join(__dirname, '../uploads/pdfs', book.pdfFile);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }
    
    // Stream the PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.pdfFile}"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};