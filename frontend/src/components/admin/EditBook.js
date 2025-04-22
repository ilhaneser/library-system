import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { title, author, ISBN, publisher, publicationYear, genre, description, copies } = formData;
  
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
        setFormData({
          title: data.title,
          author: data.author,
          ISBN: data.ISBN,
          publisher: data.publisher,
          publicationYear: data.publicationYear,
          genre: data.genre,
          description: data.description,
          copies: data.copies
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [id]);
  
  const onChange = e => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.name === 'publicationYear' || e.target.name === 'copies' 
        ? parseInt(e.target.value) 
        : e.target.value 
    });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update book');
      }
      
      navigate(`/books/${id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading book details...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-4">
      <h1 className="mb-4">Edit Book</h1>
      
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
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBook;