import { useEffect, useState } from 'react';
import { fetchReviews, deleteReview } from '../../../../api/reviews';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

const ReviewsTab = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); 
  const [userHasReviewed, setUserHasReviewed] = useState(false); 

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews(productId);
      setReviews(data);
      setLoading(false);


      const userReview = data.find((review) => review.user_id === localStorage.getItem('user_id')); 
      if (userReview) {
        setReviewToEdit(userReview);
        setUserHasReviewed(true);
      }
    } catch (err) {
      console.error('خطا در بارگذاری نظرها:', err);
      setError('بارگذاری نظرها با شکست مواجه شد.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      loadReviews();
    } catch (err) {
      console.error('حذف نظر با شکست مواجه شد:', err);
    }
  };

  const handleEdit = (review) => {
    setReviewToEdit(review);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false); 
    setReviewToEdit(null); 
  };

  const handleReviewSubmit = async () => {
    setIsFormVisible(false); 
    setReviewToEdit(null); 
    await loadReviews(); 
  };

  return (
    <div className="reviews-tab">
      {loading && <div>در حال بارگذاری نظرها...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && (
        <>
          <ReviewList reviews={reviews} onDelete={handleDelete} onEdit={handleEdit} />
          {!userHasReviewed && !isFormVisible && (
            <button
              className="btn btn-primary"
              onClick={() => setIsFormVisible(true)}
            >
              نوشتن نظر
            </button>
          )}
          {(userHasReviewed || isFormVisible) && (
            <ReviewForm
              productId={productId}
              onSubmit={handleReviewSubmit}
              reviewToEdit={reviewToEdit}
              clearEdit={handleCancel} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsTab;
