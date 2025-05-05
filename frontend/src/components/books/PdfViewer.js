import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load the PDF. Please try again later.');
    setLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(newPageNumber, numPages));
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls d-flex justify-content-between align-items-center mb-3">
        <div>
          <button 
            className="btn btn-sm btn-outline-primary me-2" 
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <i className="bi bi-chevron-left"></i> Previous
          </button>
          <span className="mx-2">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button 
            className="btn btn-sm btn-outline-primary ms-2" 
            onClick={nextPage}
            disabled={pageNumber >= numPages}
          >
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>
        <div>
          <button 
            className="btn btn-sm btn-outline-secondary me-2" 
            onClick={zoomOut}
          >
            <i className="bi bi-zoom-out"></i>
          </button>
          <button 
            className="btn btn-sm btn-outline-secondary me-2" 
            onClick={resetZoom}
          >
            {Math.round(scale * 100)}%
          </button>
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={zoomIn}
          >
            <i className="bi bi-zoom-in"></i>
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading PDF...</span>
          </div>
          <p className="mt-2">Loading PDF...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="pdf-container border rounded p-3 bg-light text-center">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;