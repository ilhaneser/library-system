const Book = require('../models/Book');
const Loan = require('../models/Loan');
const User = require('../models/User');
const Review = require('../models/Review');

// Get popular books based on user preferences or overall popularity
exports.getPopularBooks = async (req, res) => {
  try {
    // Check if user is logged in
    const userId = req.session.user ? req.session.user.id : null;
    
    // If user is logged in, get their genre preferences
    let userGenrePreferences = null;
    let recommendedBooks = [];
    
    if (userId) {
      // Get user's borrowing history
      const userLoans = await Loan.find({ user: userId })
        .populate('book')
        .sort({ issueDate: -1 });
      
      if (userLoans.length > 0) {
        // Count genre frequencies
        const genreCounts = {};
        
        userLoans.forEach(loan => {
          if (loan.book && loan.book.genre) {
            const genre = loan.book.genre;
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          }
        });
        
        // Convert to array and sort by frequency
        userGenrePreferences = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0]);
      }
    }
    
    // If user has genre preferences, get personalized recommendations
    if (userGenrePreferences && userGenrePreferences.length > 0) {
      // Get books from preferred genres, sorted by rating and loan count
      const preferredGenreBooks = await Book.aggregate([
        {
          $match: {
            genre: { $in: userGenrePreferences }
          }
        },
        {
          $addFields: {
            score: {
              $add: [
                { $ifNull: ["$averageRating", 0] },
                { $multiply: [{ $divide: ["$copiesOnLoan", { $max: ["$copies", 1] }] }, 2] }
              ]
            },
            // Add field to check if it's the user's preferred genre
            genrePreferenceIndex: {
              $indexOfArray: [userGenrePreferences, "$genre"]
            }
          }
        },
        {
          $sort: {
            genrePreferenceIndex: 1,  // Sort by genre preference (most preferred first)
            score: -1,                // Then by score
            reviewCount: -1           // Then by review count
          }
        },
        {
          $limit: 6
        }
      ]);
      
      recommendedBooks = preferredGenreBooks;
    }
    
    // If not enough personalized recommendations, add generally popular books
    if (recommendedBooks.length < 6) {
      const remainingCount = 6 - recommendedBooks.length;
      
      // Get excluded book IDs from already recommended books
      const excludedIds = recommendedBooks.map(book => book._id);
      
      // Get generally popular books
      const popularBooks = await Book.aggregate([
        {
          $match: {
            _id: { $nin: excludedIds }
          }
        },
        {
          $addFields: {
            // Create a popularity score based on ratings and loan ratio
            score: {
              $add: [
                { $ifNull: ["$averageRating", 0] },
                { $multiply: [{ $divide: ["$copiesOnLoan", { $max: ["$copies", 1] }] }, 2] }
              ]
            }
          }
        },
        {
          $sort: {
            score: -1,
            reviewCount: -1
          }
        },
        {
          $limit: remainingCount
        }
      ]);
      
      recommendedBooks = recommendedBooks.concat(popularBooks);
    }
    
    res.json(recommendedBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get trending books (most borrowed in the last 30 days)
exports.getTrendingBooks = async (req, res) => {
  try {
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Count loans for each book in the last 30 days
    const recentLoans = await Loan.aggregate([
      {
        $match: {
          issueDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$book",
          loanCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          loanCount: -1
        }
      },
      {
        $limit: 6
      }
    ]);
    
    // Get the book details
    const bookIds = recentLoans.map(item => item._id);
    const books = await Book.find({ _id: { $in: bookIds } });
    
    // Combine loan count with book details
    const trendingBooks = recentLoans.map(loanItem => {
      const book = books.find(b => b._id.toString() === loanItem._id.toString());
      return {
        ...book.toObject(),
        recentLoanCount: loanItem.loanCount
      };
    });
    
    res.json(trendingBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get highly rated books
exports.getHighlyRatedBooks = async (req, res) => {
  try {
    const highlyRatedBooks = await Book.find({
      averageRating: { $gte: 4 },
      reviewCount: { $gte: 2 }
    })
    .sort({ averageRating: -1, reviewCount: -1 })
    .limit(6);
    
    res.json(highlyRatedBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};