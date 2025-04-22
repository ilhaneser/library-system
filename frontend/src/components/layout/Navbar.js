import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link to="/" className="navbar-brand">Library System</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/books" className="nav-link">Books</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link to="/myloans" className="nav-link">My Loans</Link>
              </li>
            )}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link">Admin</Link>
              </li>
            )}
          </ul>
          <div className="navbar-nav">
            {user ? (
              <>
                <span className="nav-item nav-link me-3">
                  Hello, {user.name}
                </span>
                <button onClick={logout} className="btn btn-outline-light">
                  Logout
                </button>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Register</Link>
                </li>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;