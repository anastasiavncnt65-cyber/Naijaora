import { useEffect, useState } from 'react';
import { business } from '../config/business';
import { fetchReviews, getAverageRating, renderStars } from '../lib/reviews';

type HeroProps = {
  onOrderClick: () => void;
};

export function Hero({ onOrderClick }: HeroProps) {
  const [reviewCount, setReviewCount] = useState(0);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    fetchReviews().then((reviews) => {
      setReviewCount(reviews.length);
      setAverage(getAverageRating(reviews));
    });
  }, []);

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{business.contact.publicLocation}</p>
          <h1>{business.name}</h1>
          <p className="hero-tagline">{business.tagline}</p>
          <p className="hero-text">{business.description}</p>

          {reviewCount > 0 && (
            <div className="hero-rating">
              <span className="rating-stars-display">{renderStars(average)}</span>
              <span>
                {average.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </span>
              <a href="#reviews" className="hero-rating-link">
                Read reviews
              </a>
            </div>
          )}

          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={onOrderClick}>
              Order now
            </button>
            <a className="btn btn-secondary" href="#menu">
              View menu
            </a>
          </div>

          <ul className="hero-trust">
            <li>{business.contact.publicLocation}</li>
            <li>{business.prepTimeNote}</li>
          </ul>
        </div>
        <div className="hero-visual">
          <img
            src="/images/jollof-rice.png"
            alt="Naijaora jollof rice with chicken"
            className="hero-food"
            width={640}
            height={480}
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
