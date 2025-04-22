import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books
        const booksResponse = await fetch('/api/books', {
          credentials: 'include'
        });
        
        if (!booksResponse.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const booksData = await booksResponse.json();
        setBooks(booksData);
        
        // Fetch loans
        const loansResponse = await fetch('/api/loans', {
          credentials: 'include'
        });
        
        if (!loansResponse.ok) {
          throw new Error('Failed to fetch loans');
        }
        
        const loansData = await loansResponse.json();
        setLoans(loansData);
        
        // In a real application, you would also fetch users here
        // But we're simplifying for this student project
        setUsers([{ _id: '1', name: 'Test User', email: 'test@example.com' }]);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }
    
    setDeleting(bookId);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete book');
      }
      
      // Remove book from state
      setBooks(books.filter(book => book._id !== bookId));
      alert('Book deleted successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5">Error: {error}</div>
    );
  }

  // Count active loans
  const activeLoans = loans.filter(loan => loan.status === 'active');
  // Count overdue loans
  const overdueLoans = loans.filter(loan => 
    loan.status === 'active' && new Date(loan.dueDate) < new Date()
  );

  return (
    <div className="my-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Total Books</h5>
              <h3 className="text-primary">{books.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Active Loans</h5>
              <h3 className="text-primary">{activeLoans.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Overdue Books</h5>
              <h3 className="text-danger">{overdueLoans.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <h3 className="text-primary">{users.length}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Manage Books</h2>
          <Link to="/admin/books/add" className="btn btn-primary">Add New Book</Link>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Copies</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.ISBN}</td>
                    <td>{book.copies - book.copiesOnLoan} / {book.copies}</td>
                    <td>
                      <Link 
                        to={`/books/${book._id}`} 
                        className="btn btn-outline-secondary btn-sm me-1"
                      >
                        View
                      </Link>
                      <Link
                        to={`/admin/books/edit/${book._id}`}
                        className="btn btn-outline-primary btn-sm me-1"
                      >
                        Edit
                      </Link>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteBook(book._id)}
                        disabled={deleting === book._id}
                      >
                        {deleting === book._id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Recent Loans</h2>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>User</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.slice(0, 5).map(loan => (
                  <tr key={loan._id}>
                    <td>{loan.book.title}</td>
                    <td>{loan.user.name}</td>
                    <td>{new Date(loan.issueDate).toLocaleDateString()}</td>
                    <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td>
                      {loan.status === 'active' ? (
                        new Date(loan.dueDate) < new Date() ? (
                          <span className="badge bg-danger">Overdue</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )
                      ) : (
                        <span className="badge bg-secondary">Returned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;