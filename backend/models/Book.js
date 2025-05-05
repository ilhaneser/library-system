const mongoose = require('mongoose');

// Predefined list of genres
const genres = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Biography'
];

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  ISBN: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  publicationYear: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    required: true,
    enum: genres
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: 'default-book-cover.jpg'
  },
  pdfFile: {
    type: String,
    default: null
  },
  // Max copies that can be borrowed simultaneously
  copies: {
    type: Number,
    default: 1,
    min: 1
  },
  // Current copies on loan
  copiesOnLoan: {
    type: Number,
    default: 0,
    min: 0
  },
  // Review statistics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  addedOn: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking availability
BookSchema.virtual('available').get(function() {
  return this.copiesOnLoan < this.copies;
});

// Export the genres list to make it available throughout the application
BookSchema.statics.genres = genres;

module.exports = mongoose.model('Book', BookSchema);