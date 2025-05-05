import React, { useState, useEffect } from 'react';

const StarRating = ({ rating, setRating, editable = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="star-rating">
      {[...Array(5)].map((star, i) => {
        const ratingValue = i + 1;
        return (
          <span
            key={i}
            className={`star ${ratingValue <= (hover || rating) ? 'filled' : 'empty'}`}
            onClick={() => editable && setRating(ratingValue)}
            onMouseEnter={() => editable && setHover(ratingValue)}
            onMouseLeave={() => editable && setHover(0)}
            style={{ 
              cursor: editable ? 'pointer' : 'default',
              color: ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9',
              fontSize: '1.5rem'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const ReviewForm = ({ bookId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId,
          rating,
          comment
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit review');
      }
      
      const data = await response.json();
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      if (onReviewAdded) {
        onReviewAdded(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="review-form mb-4">
      <h4>Add Your Review</h4>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Your Rating</label>
          <div>
            <StarRating rating={rating} setRating={setRating} editable={true} />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="comment" className="form-label">Your Review (Optional)</label>
          <textarea
            className="form-control"
            id="comment"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

const ReviewList = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/book/${bookId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [bookId]);
  
  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews]);
  };
  
  if (loading) {
    return (
      <div className="text-center my-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading reviews...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="review-section">
      <h3 className="mb-4">Reviews</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="reviews">
        {reviews.length === 0 ? (
          <div className="text-muted">No reviews yet.</div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">{review.user.name}</h5>
                  <StarRating rating={review.rating} />
                </div>
                
                {review.comment && (
                  <p className="card-text">{review.comment}</p>
                )}
                
                <small className="text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const BookReviews = ({ bookId, user }) => {
  const [canReview, setCanReview] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  useEffect(() => {
    // Check if user can review this book
    const checkReviewStatus = async () => {
      if (!user) {
        setCanReview(false);
        setCheckingStatus(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/reviews/can-review/${bookId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCanReview(data.canReview);
        }
      } catch (err) {
        console.error('Error checking review status:', err);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    checkReviewStatus();
  }, [bookId, user]);
  
  const handleReviewAdded = (newReview) => {
    // After adding a review, user can no longer review
    setCanReview(false);
  };
  
  if (checkingStatus) {
    return (
      <div className="text-center my-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="book-reviews mt-4">
      {canReview && (
        <ReviewForm bookId={bookId} onReviewAdded={handleReviewAdded} />
      )}
      
      {!canReview && user && (
        <div className="alert alert-info mb-4">
          <p className="mb-0">
            {!checkingStatus ? 
              "You can only review books that you've borrowed and haven't reviewed yet." : 
              "Checking if you can review this book..."}
          </p>
        </div>
      )}
      
      <ReviewList bookId={bookId} />
    </div>
  );
};

export default BookReviews;