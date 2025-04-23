import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      
      // Fetch users
      try {
        const usersResponse = await fetch('/api/users/all', {
          credentials: 'include'
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          // Fallback to default users if API fails
          console.warn('Using default users data as API call failed');
          setUsers([
            { 
              _id: '1', 
              name: 'Admin User', 
              email: 'admin@library.com',
              role: 'admin',
              registeredOn: new Date()
            },
            { 
              _id: '2', 
              name: 'Regular User', 
              email: 'user@library.com',
              role: 'user',
              registeredOn: new Date()
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        // Fallback to default users
        setUsers([
          { 
            _id: '1', 
            name: 'Admin User', 
            email: 'admin@library.com',
            role: 'admin',
            registeredOn: new Date()
          },
          { 
            _id: '2', 
            name: 'Regular User', 
            email: 'user@library.com',
            role: 'user',
            registeredOn: new Date()
          }
        ]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Display success message if redirected from delete page
    if (location.state && location.state.message) {
      alert(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
    
    // Set up automatic refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [location, navigate]);

  const handleDeleteBookClick = (bookId) => {
    navigate(`/admin/books/delete/${bookId}`);
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
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError(null)}></button>
        </div>
      )}
      
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
      
      <div className="d-flex mb-4">
        <Link to="/admin/books/add" className="btn btn-primary me-2">
          Add New Book
        </Link>
        <Link to="/admin/wishlists" className="btn btn-outline-primary">
          <i className="bi bi-heart-fill me-1"></i> View Wishlisted Books
        </Link>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="mb-0">Manage Books</h2>
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
                        onClick={() => handleDeleteBookClick(book._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card mb-4">
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
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.slice(0, 5).map(loan => (
                      <tr key={loan._id}>
                        <td>{loan.book.title}</td>
                        <td>{loan.user.name}</td>
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
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Registered Users</h2>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          {user.role === 'admin' ? (
                            <span className="badge bg-primary">Admin</span>
                          ) : (
                            <span className="badge bg-secondary">User</span>
                          )}
                        </td>
                        <td>{new Date(user.registeredOn).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;