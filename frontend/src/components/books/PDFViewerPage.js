import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PdfViewer from '../books/PdfViewer';

const PDFViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        
        const data = await response.json();
        setBook(data);
        
        if (!data.pdfFile) {
          throw new Error('This book does not have a PDF available');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading PDF...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-primary"
        >
          Back to Book Details
        </button>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Reading: {book.title}</h1>
        <button 
          onClick={() => navigate(`/books/${id}`)} 
          className="btn btn-secondary"
        >
          Back to Book Details
        </button>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <span className="text-muted">Author:</span> {book.author}
          </h5>
        </div>
        <div className="card-body">
          <PdfViewer pdfUrl={`/api/books/${id}/pdf`} />
        </div>
      </div>
    </div>
  );
};

export default PDFViewerPage;