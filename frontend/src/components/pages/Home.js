import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
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
    
    return (
      <div className="d-flex">
        {stars}
        {book.reviewCount > 0 && (
          <span className="ms-1 text-muted">({book.reviewCount})</span>
        )}
      </div>
    );
  };
  
  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        <img 
          src={book.coverImage ? `/uploads/covers/${book.coverImage}` : '/img/default-book-cover.jpg'}
          alt={book.title}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = '/img/default-book-cover.jpg';
          }}
        />
        <div className="card-body">
          <h5 className="card-title">{book.title}</h5>
          <p className="card-text text-muted mb-0">{book.author}</p>
          <div className="mt-2 mb-3">
            {book.averageRating > 0 ? renderStars(book.averageRating) : <span className="text-muted">No ratings yet</span>}
          </div>
          <Link to={`/books/${book._id}`} className="btn btn-outline-primary btn-sm">View Details</Link>
        </div>
      </div>
    </div>
  );
};

const BookSection = ({ title, books, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger">{error}</div>
    );
  }
  
  if (!books || books.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-5">
      <h2 className="mb-4">{title}</h2>
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-6 g-4">
        {books.map(book => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </div>
  );
};

const Home = ({ user }) => {
  const [popularBooks, setPopularBooks] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const [loading, setLoading] = useState({
    popular: true,
    topRated: true
  });
  const [error, setError] = useState({
    popular: null,
    topRated: null
  });
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Fetch popular books
      try {
        const popularResponse = await fetch('/api/recommendations/popular', {
          credentials: 'include'
        });
        
        if (!popularResponse.ok) {
          throw new Error('Failed to fetch popular books');
        }
        
        const popularData = await popularResponse.json();
        setPopularBooks(popularData);
      } catch (err) {
        console.error('Error fetching popular books:', err);
        setError(prev => ({ ...prev, popular: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, popular: false }));
      }
      
      // Fetch top-rated books
      try {
        const topRatedResponse = await fetch('/api/recommendations/top-rated');
        
        if (!topRatedResponse.ok) {
          throw new Error('Failed to fetch top-rated books');
        }
        
        const topRatedData = await topRatedResponse.json();
        setTopRatedBooks(topRatedData);
      } catch (err) {
        console.error('Error fetching top-rated books:', err);
        setError(prev => ({ ...prev, topRated: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, topRated: false }));
      }
    };
    
    fetchRecommendations();
  }, [user]); // Re-fetch when user changes (login/logout)
  
  return (
    <div className="home">
      <div className="bg-light p-5 rounded-lg mb-5">
        <div className="container">
          <h1 className="display-4">Welcome to the Library Management System</h1>
          <p className="lead">Discover, borrow, and read your favorite books all in one place.</p>
          <hr className="my-4" />
          <p>Start exploring our collection today or sign up to access exclusive features.</p>
          <Link to="/books" className="btn btn-primary btn-lg">Browse Books</Link>
          {!user && (
            <Link to="/register" className="btn btn-outline-secondary btn-lg ms-2">Sign Up</Link>
          )}
        </div>
      </div>
      
      <div className="container">
        <BookSection 
          title={user ? "Recommended for You" : "Popular Books"} 
          books={popularBooks} 
          loading={loading.popular} 
          error={error.popular} 
        />
        
        <BookSection 
          title="Highly Rated Books" 
          books={topRatedBooks} 
          loading={loading.topRated} 
          error={error.topRated} 
        />
        
        <div className="row mb-5">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-search display-4 text-primary mb-3"></i>
                <h3 className="card-title">Browse Books</h3>
                <p className="card-text">Explore our extensive collection of books across various genres.</p>
                <Link to="/books" className="btn btn-outline-primary">View All Books</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-book display-4 text-primary mb-3"></i>
                <h3 className="card-title">Borrow Books</h3>
                <p className="card-text">Borrow books with ease and manage your loans in one place.</p>
                {user ? (
                  <Link to="/myloans" className="btn btn-outline-primary">My Loans</Link>
                ) : (
                  <Link to="/login" className="btn btn-outline-primary">Login to Borrow</Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-heart display-4 text-primary mb-3"></i>
                <h3 className="card-title">Save Favorites</h3>
                <p className="card-text">Save your favorite books to your wishlist for later.</p>
                {user ? (
                  <Link to="/wishlist" className="btn btn-outline-primary">My Wishlist</Link>
                ) : (
                  <Link to="/login" className="btn btn-outline-primary">Login to Save</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;