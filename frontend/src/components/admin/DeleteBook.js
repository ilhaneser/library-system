import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DeleteBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [id]);

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (confirmTitle !== book.title) {
      setError('Book title does not match. Please enter the exact title.');
      return;
    }
    
    setDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete book');
      }
      
      navigate('/admin', { state: { message: 'Book deleted successfully!' } });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!book) {
    return <div className="alert alert-danger">Book not found.</div>;
  }

  return (
    <div className="container py-4">
      <h2>Delete Book: {book.title}</h2>
      
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      
      <div className="card mt-3">
        <div className="card-body">
          <p>To confirm deletion, please enter the book title:</p>
          
          <form onSubmit={handleDelete}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                value={confirmTitle}
                onChange={(e) => setConfirmTitle(e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>
            
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteBook;

