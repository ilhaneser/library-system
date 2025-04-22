import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

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
      
      {books.length === 0 ? (
        <p>No books available.</p>
      ) : (
        <div className="row">
          {books.map(book => (
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