import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    ISBN: '',
    publisher: '',
    publicationYear: '',
    genre: '',
    description: '',
    copies: 1
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { title, author, ISBN, publisher, publicationYear, genre, description, copies } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add book');
      }
      
      navigate(`/books/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="my-4">
      <h1 className="mb-4">Add New Book</h1>
      
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="author" className="form-label">Author</label>
                  <input
                    type="text"
                    className="form-control"
                    id="author"
                    name="author"
                    value={author}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="ISBN" className="form-label">ISBN</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ISBN"
                    name="ISBN"
                    value={ISBN}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="publisher" className="form-label">Publisher</label>
                  <input
                    type="text"
                    className="form-control"
                    id="publisher"
                    name="publisher"
                    value={publisher}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="publicationYear" className="form-label">Publication Year</label>
                  <input
                    type="number"
                    className="form-control"
                    id="publicationYear"
                    name="publicationYear"
                    value={publicationYear}
                    onChange={onChange}
                    required
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="genre" className="form-label">Genre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="genre"
                    name="genre"
                    value={genre}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="copies" className="form-label">Number of Copies</label>
                  <input
                    type="number"
                    className="form-control"
                    id="copies"
                    name="copies"
                    value={copies}
                    onChange={onChange}
                    required
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                rows="5"
                required
              ></textarea>
            </div>
            
            <div className="d-flex justify-content-between">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Adding Book...' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBook;