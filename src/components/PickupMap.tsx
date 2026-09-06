import { business } from '../config/business';

export function PickupMap() {
  return (
    <section id="pickup" className="pickup-section">
      <div className="container pickup-grid">
        <div>
          <p className="eyebrow">Pickup location</p>
          <h2>Collect your order here</h2>
          <p className="section-lead">{business.contact.pickupAddress}</p>
          <p className="muted">{business.contact.hours}</p>
          <p className="muted">{business.prepTimeNote}</p>
          <a
            className="btn btn-secondary map-link-btn"
            href={business.contact.mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="map-frame">
          <iframe
            title="Naijaora pickup location"
            src={business.contact.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
