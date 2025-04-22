import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <div className="bg-light p-5 rounded-lg mb-4">
        <h1>Welcome to the Library Management System</h1>
        <div className="mt-4">
        </div>
      </div>
      
      <div className="mb-4">
        <h2>Features</h2>
        <div className="row mt-4">
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title">Browse Books</h3>
                <p className="card-text">Explore our collection of books.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title">Borrow Books</h3>
                <p className="card-text">Borrow books with a simple click.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title">Track Loans</h3>
                <p className="card-text">Keep track of your borrowed books.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;