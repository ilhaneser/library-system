import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returning, setReturning] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch('/api/loans/myloans', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch loans');
        }
        
        const data = await response.json();
        setLoans(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching loans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const handleReturnBook = async (loanId) => {
    setReturning(loanId);
    try {
      const response = await fetch(`/api/loans/${loanId}/return`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to return book');
      }
      
      // Update loans state to reflect the returned book
      setLoans(loans.map(loan => 
        loan._id === loanId ? { ...loan, status: 'returned', returnDate: new Date() } : loan
      ));
      
      alert('Book returned successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setReturning(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading your loans...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5">Error: {error}</div>
    );
  }

  // Separate active and returned loans
  const activeLoans = loans.filter(loan => loan.status === 'active');
  const returnedLoans = loans.filter(loan => loan.status === 'returned');

  return (
    <div className="my-4">
      <h1 className="mb-4">My Borrowed Books</h1>
      
      <h2 className="my-3">Active Loans</h2>
      {activeLoans.length === 0 ? (
        <div className="alert alert-info">You don't have any active loans.</div>
      ) : (
        <div className="row">
          {activeLoans.map(loan => (
            <div key={loan._id} className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{loan.book.title}</h5>
                  <p className="card-text">
                    <strong>Author:</strong> {loan.book.author}<br />
                    <strong>Borrowed:</strong> {new Date(loan.issueDate).toLocaleDateString()}<br />
                    <strong>Due Date:</strong> {new Date(loan.dueDate).toLocaleDateString()}<br />
                    {new Date(loan.dueDate) < new Date() && (
                      <span className="badge bg-danger mt-2">Overdue</span>
                    )}
                  </p>
                  <div className="d-flex gap-2">
                    <Link 
                      to={`/books/${loan.book._id}`} 
                      className="btn btn-outline-secondary"
                    >
                      View Book
                    </Link>
                    <button
                      onClick={() => handleReturnBook(loan._id)}
                      className="btn btn-primary"
                      disabled={returning === loan._id}
                    >
                      {returning === loan._id ? 'Returning...' : 'Return Book'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <h2 className="my-3">Return History</h2>
      {returnedLoans.length === 0 ? (
        <div className="alert alert-info">You haven't returned any books yet.</div>
      ) : (
        <div className="row">
          {returnedLoans.map(loan => (
            <div key={loan._id} className="col-lg-6 mb-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title">{loan.book.title}</h5>
                  <p className="card-text">
                    <strong>Author:</strong> {loan.book.author}<br />
                    <strong>Borrowed:</strong> {new Date(loan.issueDate).toLocaleDateString()}<br />
                    <strong>Returned:</strong> {new Date(loan.returnDate).toLocaleDateString()}<br />
                    <span className="badge bg-success mt-2">Returned</span>
                  </p>
                  <Link 
                    to={`/books/${loan.book._id}`} 
                    className="btn btn-outline-secondary"
                  >
                    View Book
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

export default MyLoans;