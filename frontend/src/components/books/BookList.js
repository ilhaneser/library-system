import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BookList = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [genres, setGenres] = useState(['All']);
  const [wishlist, setWishlist] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch genres first
        const genresResponse = await fetch('/api/books/genres');
        
        if (genresResponse.ok) {
          const genresData = await genresResponse.json();
          setGenres(['All', ...genresData]);
        }
        
        // Fetch books
        const response = await fetch('/api/books');
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        // Ensure books is always an array, even if the API returns null
        setBooks(data || []);
        setFilteredBooks(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching books:', err);
        // Initialize empty array even on error to prevent crashes
        setBooks([]);
        setFilteredBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    
    // Fetch wishlist status for each book if user is logged in
    if (user) {
      const fetchWishlist = async () => {
        try {
          const response = await fetch('/api/users/wishlist', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            const wishlistMap = {};
            // Ensure data is an array before iterating
            if (Array.isArray(data)) {
              data.forEach(book => {
                if (book && book._id) {
                  wishlistMap[book._id] = true;
                }
              });
            }
            setWishlist(wishlistMap);
          }
        } catch (err) {
          console.error('Error fetching wishlist:', err);
          // Initialize empty object on error
          setWishlist({});
        }
      };
      
      fetchWishlist();
    }
  }, [user]);

  useEffect(() => {
    // Apply filters whenever search parameters change
    const applyFilters = () => {
      let filtered = [...books];
      
      // Apply text search
      if (searchTerm.trim() !== '') {
        const searchTermLower = searchTerm.toLowerCase();
        filtered = filtered.filter(book => 
          book.title.toLowerCase().includes(searchTermLower) ||
          book.author.toLowerCase().includes(searchTermLower)
        );
      }
      
      // Apply genre filter
      if (selectedGenre !== 'All') {
        filtered = filtered.filter(book => book.genre === selectedGenre);
      }
      
      // Apply rating filter
      if (minRating > 0) {
        filtered = filtered.filter(book => book.averageRating >= minRating);
      }
      
      // Sort by rating (highest first)
      filtered.sort((a, b) => b.averageRating - a.averageRating);
      
      setFilteredBooks(filtered);
    };
    
    applyFilters();
  }, [books, searchTerm, selectedGenre, minRating]);

  const handleWishlistToggle = async (bookId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if not logged in
      window.location.href = '/login';
      return;
    }
    
    setWishlistLoading(prev => ({ ...prev, [bookId]: true }));
    
    try {
      let response;
      
      if (wishlist[bookId]) {
        // Remove from wishlist
        response = await fetch(`/api/users/wishlist/${bookId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } else {
        // Add to wishlist
        response = await fetch('/api/users/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bookId }),
          credentials: 'include'
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }
      
      // Toggle wishlist status
      setWishlist(prev => ({
        ...prev,
        [bookId]: !prev[bookId]
      }));
    } catch (err) {
      console.error('Error updating wishlist:', err);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [bookId]: false }));
    }
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading books...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5">Error: {error}</div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Our Books</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Search & Filter</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="searchTerm" className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                id="searchTerm"
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="genre" className="form-label">Genre</label>
              <select
                className="form-select"
                id="genre"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="minRating" className="form-label">Minimum Rating</label>
              <select
                className="form-select"
                id="minRating"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value="0">Any Rating</option>
                <option value="1">★ and above</option>
                <option value="2">★★ and above</option>
                <option value="3">★★★ and above</option>
                <option value="4">★★★★ and above</option>
                <option value="5">★★★★★</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {filteredBooks.length === 0 ? (
        <div className="alert alert-info">
          <p>No books available matching your search. {books.length === 0 && 'The library catalog is currently empty.'}</p>
        </div>
      ) : (
        <div className="row">
          {filteredBooks.map(book => (
            <div key={book._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100">
                <div className="position-relative">
                  <img 
                    src={book.coverImage ? `/uploads/covers/${book.coverImage}` : '/img/default-book-cover.jpg'}
                    alt={book.title}
                    className="card-img-top"
                    style={{ height: '250px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/img/default-book-cover.jpg';
                    }}
                  />
                  {user && (
                    <button 
                      className={`btn ${wishlist[book._id] ? 'btn-danger' : 'btn-outline-danger'} position-absolute`}
                      style={{ top: '10px', right: '10px' }}
                      onClick={(e) => handleWishlistToggle(book._id, e)}
                      disabled={wishlistLoading[book._id]}
                    >
                      <i className={`bi ${wishlist[book._id] ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">
                    <strong>Author:</strong> {book.author}<br />
                    <strong>Genre:</strong> {book.genre}<br />
                    <strong>Status:</strong> {book.copiesOnLoan < book.copies ? 
                      <span className="text-success">Available</span> : 
                      <span className="text-danger">Unavailable</span>}
                  </p>
                  
                  {book.averageRating > 0 && (
                    <div className="mb-2">
                      <div className="d-flex">
                        {renderStars(book.averageRating)}
                        <span className="ms-1 text-muted">({book.reviewCount})</span>
                      </div>
                    </div>
                  )}
                  
                  <Link 
                    to={`/books/${book._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;