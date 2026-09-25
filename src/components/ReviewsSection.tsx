import { useEffect, useState, type FormEvent } from 'react';
import { menuItems } from '../config/business';
import {
  fetchReviews,
  formatReviewDate,
  getAverageRating,
  renderStars,
  submitReview,
} from '../lib/reviews';
import type { Review } from '../types';

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div
      className={`star-rating ${readonly ? 'readonly' : ''}`}
      role={readonly ? 'img' : 'group'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'star filled' : 'star'}
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <div>
          <strong>{review.name}</strong>
          {review.dish && <span className="review-dish">{review.dish}</span>}
        </div>
        <StarRating value={review.rating} readonly />
      </div>
      <p>{review.comment}</p>
      <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
    </article>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [dish, setDish] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  const average = getAverageRating(reviews);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !comment.trim()) {
      setError('Please enter your name and review.');
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await submitReview({
        name: name.trim(),
        rating,
        comment: comment.trim(),
        dish: dish || undefined,
      });
      setReviews((prev) => [newReview, ...prev]);
      setName('');
      setRating(5);
      setComment('');
      setDish('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit review.');
    }
    setSubmitting(false);
  }

  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <div className="reviews-header">
          <div className="section-heading">
            <h2>Reviews</h2>
            <p>Real feedback from customers who have ordered from us.</p>
          </div>
          {reviews.length > 0 && (
            <div className="rating-summary">
              <span className="rating-big">{average.toFixed(1)}</span>
              <span className="rating-stars-display" aria-hidden>
                {renderStars(average)}
              </span>
              <span className="muted">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>

        <div className="reviews-grid">
          <div className="reviews-list">
            {loading && <p className="muted">Loading reviews…</p>}
            {!loading && reviews.length === 0 && (
              <div className="empty-state">
                <p>No reviews yet.</p>
                <p className="muted">Be the first to leave a review after your order.</p>
              </div>
            )}
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          <form className="review-form" onSubmit={handleSubmit}>
            <h3>Leave a review</h3>
            <p className="muted">Only share genuine feedback from your own order.</p>

            <label>
              Your name *
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name or initials"
              />
            </label>

            <label>
              Rating *
              <StarRating value={rating} onChange={setRating} />
            </label>

            <label>
              What did you order?
              <select value={dish} onChange={(e) => setDish(e.target.value)}>
                <option value="">Select a dish (optional)</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Your review *
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your order?"
              />
            </label>

            {error && <p className="form-error">{error}</p>}
            {submitted && <p className="form-success">Thank you — your review has been posted.</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
