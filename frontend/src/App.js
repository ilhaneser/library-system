import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import BookList from './components/books/BookList';
import BookDetails from './components/books/BookDetails';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MyLoans from './components/loans/MyLoans';
import Wishlist from './components/wishlist/Wishlist';
import AdminDashboard from './components/pages/AdminDashboard';
import AddBook from './components/admin/AddBook';
import EditBook from './components/admin/EditBook';
import DeleteBook from './components/admin/DeleteBook';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar user={user} logout={logout} />
        <main className="container py-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<BookList user={user} />} />
            <Route path="/books/:id" element={<BookDetails user={user} />} />
            <Route path="/login" element={<Login login={login} />} />
            <Route path="/register" element={<Register login={login} />} />
            <Route 
              path="/myloans" 
              element={
                <PrivateRoute user={user} loading={loading}>
                  <MyLoans />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/wishlist" 
              element={
                <PrivateRoute user={user} loading={loading}>
                  <Wishlist />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute user={user} loading={loading}>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/books/add" 
              element={
                <AdminRoute user={user} loading={loading}>
                  <AddBook />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/books/edit/:id" 
              element={
                <AdminRoute user={user} loading={loading}>
                  <EditBook />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/books/delete/:id" 
              element={
                <AdminRoute user={user} loading={loading}>
                  <DeleteBook />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
        <footer className="bg-dark text-white text-center py-3 mt-auto">
          <div className="container">
            <p className="mb-0">&copy; {new Date().getFullYear()} Library Management System</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;