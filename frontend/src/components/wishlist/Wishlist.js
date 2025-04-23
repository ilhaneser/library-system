import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('/api/users/wishlist', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }
        
        const data = await response.json();
        setWishlist(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (bookId) => {
    try {
      const response = await fetch(`/api/users/wishlist/${bookId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove book from wishlist');
      }
      
      // Update local state
      setWishlist(wishlist.filter(book => book._id !== bookId));
    } catch (err) {
      setError(err.message);
      console.error('Error removing from wishlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading wishlist...</span>
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
    <div className="my-4">
      <h1 className="mb-4">My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="alert alert-info">
          <p>Your wishlist is empty. <Link to="/books">Browse books</Link> to add some to your wishlist!</p>
        </div>
      ) : (
        <div className="row">
          {wishlist.map(book => (
            <div key={book._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100">
                <img 
                  src={book.coverImage ? `/uploads/${book.coverImage}` : '/img/default-book-cover.jpg'}
                  alt={book.title}
                  className="card-img-top"
                  style={{ height: '250px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/img/default-book-cover.jpg';
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">
                    <strong>Author:</strong> {book.author}<br />
                    <strong>Genre:</strong> {book.genre}<br />
                    <strong>Status:</strong> {book.copiesOnLoan < book.copies ? 
                      <span className="text-success">Available</span> : 
                      <span className="text-danger">Unavailable</span>}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Link 
                      to={`/books/${book._id}`}
                      className="btn btn-primary"
                    >
                      View Details
                    </Link>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleRemoveFromWishlist(book._id)}
                    >
                      <i className="bi bi-heart-fill"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;