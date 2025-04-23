import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BookList = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlist, setWishlist] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        // Ensure books is always an array, even if the API returns null
        setBooks(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching books:', err);
        // Initialize empty array even on error to prevent crashes
        setBooks([]);
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Make sure books is always an array before filtering
  const booksArray = Array.isArray(books) ? books : [];
  const filteredBooks = booksArray.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search books by title, author, or genre..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="bi bi-search"></i>
            </button>
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
                    src={book.coverImage ? `/uploads/${book.coverImage}` : '/img/default-book-cover.jpg'}
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