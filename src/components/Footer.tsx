import { business } from '../config/business';

export function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">{business.name}</p>
          <p className="footer-tagline">{business.tagline}</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>
            <a href={`tel:${business.contact.phone.replace(/\s/g, '')}`}>
              {business.contact.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${business.contact.email}`}>{business.contact.email}</a>
          </p>
          <p>{business.contact.hours}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} {business.name}</p>
        </div>
      </div>
    </footer>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="container about-grid">
        <div>
          <p className="eyebrow">About</p>
          <h2>Authentic Nigerian food in Christchurch</h2>
          <p>
            Naijaora serves bold, home-style Nigerian dishes in Christchurch. Order online,
            pay by bank transfer, and collect when your food is ready.
          </p>
          <p>
            Upload your payment receipt to confirm your order. Once verified, we prepare your
            food and message you when it&apos;s ready for pickup.
          </p>
        </div>
        <ul className="about-list">
          <li>
            <strong>Order online</strong>
            <span>Browse the menu, checkout, and pay by bank transfer.</span>
          </li>
          <li>
            <strong>Pay to confirm</strong>
            <span>Upload your bank receipt so we can verify payment quickly.</span>
          </li>
          <li>
            <strong>Ready in ~{business.prepMinutes} minutes</strong>
            <span>We&apos;ll text you when your order is ready to collect.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
