import React, { useState, useEffect } from 'react';
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
  
  const [genres, setGenres] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const navigate = useNavigate();
  
  const { title, author, ISBN, publisher, publicationYear, genre, description, copies } = formData;
  
  useEffect(() => {
    // Fetch available genres
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/books/genres', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }
        
        const data = await response.json();
        setGenres(data);
        
        // Set the first genre as default if none is selected
        if (data.length > 0 && !formData.genre) {
          setFormData(prev => ({ ...prev, genre: data[0] }));
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
      } finally {
        setLoadingGenres(false);
      }
    };
    
    fetchGenres();
  }, []);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'coverImage') {
      setCoverImage(files[0]);
    } else if (name === 'pdfFile') {
      setPdfFile(files[0]);
    }
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create FormData object for file uploads
      const formDataWithFiles = new FormData();
      
      // Add book data to FormData
      Object.keys(formData).forEach(key => {
        formDataWithFiles.append(key, formData[key]);
      });
      
      // Add cover image if selected
      if (coverImage) {
        formDataWithFiles.append('coverImage', coverImage);
      }
      
      // Submit the book data first
      const response = await fetch('/api/books', {
        method: 'POST',
        body: formDataWithFiles,
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add book');
      }
      
      // If a PDF file was selected, upload it separately
      if (pdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append('pdfFile', pdfFile);
        
        const pdfResponse = await fetch(`/api/books/${data._id}/pdf`, {
          method: 'POST',
          body: pdfFormData,
          credentials: 'include'
        });
        
        if (!pdfResponse.ok) {
          console.error('Failed to upload PDF, but book was created');
        }
      }
      
      navigate(`/books/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingGenres) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading genres...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-4">
      <h1 className="mb-4">Add New Book</h1>
      
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit} encType="multipart/form-data">
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
                  <select
                    className="form-select"
                    id="genre"
                    name="genre"
                    value={genre}
                    onChange={onChange}
                    required
                  >
                    <option value="" disabled>Select a genre</option>
                    {genres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
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
            
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="coverImage" className="form-label">Cover Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="coverImage"
                    name="coverImage"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">Optional. Max size: 5MB</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="pdfFile" className="form-label">PDF File</label>
                  <input
                    type="file"
                    className="form-control"
                    id="pdfFile"
                    name="pdfFile"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">Optional. Max size: 20MB</small>
                </div>
              </div>
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