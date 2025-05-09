import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BookReviews from '../reviews/BookReviews';

const BookDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
    
    // Check if book is in wishlist
    if (user) {
      const checkWishlist = async () => {
        try {
          const response = await fetch(`/api/users/wishlist/check/${id}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setInWishlist(data.isInWishlist);
          }
        } catch (err) {
          console.error('Error checking wishlist status:', err);
        }
      };
      
      checkWishlist();
    }
  }, [id, user]);

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBorrowing(true);
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookId: id }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to borrow book');
      }
      
      // Update book availability locally
      setBook({
        ...book,
        copiesOnLoan: book.copiesOnLoan + 1
      });
      
      alert('Book borrowed successfully! Check "My Loans" to view your loans.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBorrowing(false);
    }
  };
  
  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setWishlistLoading(true);
    try {
      let response;
      
      if (inWishlist) {
        // Remove from wishlist
        response = await fetch(`/api/users/wishlist/${id}`, {
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
          body: JSON.stringify({ bookId: id }),
          credentials: 'include'
        });
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update wishlist');
      }
      
      // Toggle wishlist status
      setInWishlist(!inWishlist);
    } catch (err) {
      setError(err.message);
    } finally {
      setWishlistLoading(false);
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
          <span className="visually-hidden">Loading book details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5">Error: {error}</div>
    );
  }

  if (!book) {
    return (
      <div className="alert alert-warning mt-5">Book not found</div>
    );
  }

  const isAvailable = book.copiesOnLoan < book.copies;

  return (
    <div className="my-4">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary mb-4"
      >
        Back
      </button>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          <img
            src={book.coverImage ? `/uploads/covers/${book.coverImage}` : '/img/default-book-cover.jpg'}
            alt={book.title}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '500px' }}
            onError={(e) => {
              e.target.src = '/img/default-book-cover.jpg';
            }}
          />
          
          {book.averageRating > 0 && (
            <div className="mt-3 text-center">
              <div className="d-flex justify-content-center">
                {renderStars(book.averageRating)}
              </div>
              <p className="text-muted mt-1">
                {book.averageRating.toFixed(1)} ({book.reviewCount} {book.reviewCount === 1 ? 'review' : 'reviews'})
              </p>
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h1>{book.title}</h1>
            {user && (
              <button 
                className={`btn ${inWishlist ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <i className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                {wishlistLoading ? ' ...' : inWishlist ? ' Remove from Wishlist' : ' Add to Wishlist'}
              </button>
            )}
          </div>
          <hr />
          
          <div className="row mb-4">
            <div className="col-sm-6">
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>ISBN:</strong> {book.ISBN}</p>
              <p><strong>Publisher:</strong> {book.publisher}</p>
            </div>
            <div className="col-sm-6">
              <p><strong>Year:</strong> {book.publicationYear}</p>
              <p><strong>Genre:</strong> {book.genre}</p>
              <p>
                <strong>Availability:</strong> {isAvailable ? 
                  <span className="text-success">Available</span> : 
                  <span className="text-danger">Not Available</span>}
              </p>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Description</h5>
            </div>
            <div className="card-body">
              <p className="card-text">{book.description}</p>
            </div>
          </div>
          
          <div className="d-flex flex-wrap gap-2 mb-4">
            {user ? (
              <button
                className="btn btn-primary"
                onClick={handleBorrow}
                disabled={!isAvailable || borrowing}
              >
                {borrowing ? 'Processing...' : 'Borrow Book'}
              </button>
            ) : (
              <div className="alert alert-info w-100">
                Please <a href="/login">login</a> to borrow this book.
              </div>
            )}
            
            {book.pdfFile && user && (
              <Link 
                to={`/books/${id}/read`} 
                className="btn btn-outline-primary"
              >
                <i className="bi bi-file-earmark-pdf"></i> Read PDF
              </Link>
            )}
          </div>
          
          {/* Book Reviews Section */}
          <div className="mt-5">
            <BookReviews bookId={id} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;