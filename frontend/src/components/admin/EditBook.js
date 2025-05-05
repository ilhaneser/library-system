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
  
  const [genres, setGenres] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [currentCover, setCurrentCover] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { title, author, ISBN, publisher, publicationYear, genre, description, copies } = formData;
  
  useEffect(() => {
    // Fetch available genres and book data
    const fetchData = async () => {
      try {
        // Fetch genres
        const genresResponse = await fetch('/api/books/genres', {
          credentials: 'include'
        });
        
        if (!genresResponse.ok) {
          throw new Error('Failed to fetch genres');
        }
        
        const genresData = await genresResponse.json();
        setGenres(genresData);
        
        // Fetch book details
        const bookResponse = await fetch(`/api/books/${id}`, {
          credentials: 'include'
        });
        
        if (!bookResponse.ok) {
          throw new Error('Failed to fetch book details');
        }
        
        const bookData = await bookResponse.json();
        setFormData({
          title: bookData.title,
          author: bookData.author,
          ISBN: bookData.ISBN,
          publisher: bookData.publisher,
          publicationYear: bookData.publicationYear,
          genre: bookData.genre,
          description: bookData.description,
          copies: bookData.copies
        });
        
        if (bookData.coverImage) {
          setCurrentCover(bookData.coverImage);
        }
        
        if (bookData.pdfFile) {
          setCurrentPdf(bookData.pdfFile);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const onChange = e => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.name === 'publicationYear' || e.target.name === 'copies' 
        ? parseInt(e.target.value) 
        : e.target.value 
    });
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
    setSaving(true);
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
      
      // Update the book
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        body: formDataWithFiles,
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update book');
      }
      
      // If a PDF file was selected, upload it separately
      if (pdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append('pdfFile', pdfFile);
        
        const pdfResponse = await fetch(`/api/books/${id}/pdf`, {
          method: 'POST',
          body: pdfFormData,
          credentials: 'include'
        });
        
        if (!pdfResponse.ok) {
          console.error('Failed to upload PDF, but book was updated');
        }
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
                  {currentCover && (
                    <div className="mb-2">
                      <img 
                        src={`/uploads/covers/${currentCover}`} 
                        alt="Current cover" 
                        style={{ height: '100px' }} 
                        className="d-block mb-2"
                      />
                      <small>Current cover</small>
                    </div>
                  )}
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
                  {currentPdf && (
                    <div className="mb-2">
                      <p className="mb-1">Current PDF: {currentPdf}</p>
                      <a 
                        href={`/api/books/${id}/pdf`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-outline-primary mb-2"
                      >
                        View current PDF
                      </a>
                    </div>
                  )}
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