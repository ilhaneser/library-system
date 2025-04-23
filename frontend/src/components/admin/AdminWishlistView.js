import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminWishlistView = () => {
  const [wishlistedBooks, setWishlistedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlistedBooks = async () => {
      try {
        const response = await fetch('/api/users/wishlist/all', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch wishlisted books');
        }
        
        const data = await response.json();
        setWishlistedBooks(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching wishlisted books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistedBooks();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading wishlisted books...</span>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Wishlisted Books</h1>
        <Link to="/admin" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
      
      {wishlistedBooks.length === 0 ? (
        <div className="alert alert-info">
          No books have been wishlisted by users yet.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Number of Wishlisters</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlistedBooks.map(item => (
                <tr key={item.book._id}>
                  <td>{item.book.title}</td>
                  <td>{item.book.author}</td>
                  <td>{item.book.genre}</td>
                  <td>
                    <span className="badge bg-primary">
                      {item.users.length} user{item.users.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <Link 
                      to={`/books/${item.book._id}`} 
                      className="btn btn-outline-primary btn-sm"
                    >
                      View Book
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminWishlistView;