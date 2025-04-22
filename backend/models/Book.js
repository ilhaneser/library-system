const mongoose = require('mongoose');

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
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: 'default-book-cover.jpg'
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
  addedOn: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking availability
BookSchema.virtual('available').get(function() {
  return this.copiesOnLoan < this.copies;
});

module.exports = mongoose.model('Book', BookSchema);