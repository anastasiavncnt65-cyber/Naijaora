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
            then message us on WhatsApp or Messenger to confirm.
          </p>
          <p>
            We&apos;ll continue the conversation in chat and let you know when your order is ready.
          </p>
        </div>
        <ul className="about-list">
          <li>
            <strong>Order online</strong>
            <span>Browse the menu and add dishes to your cart.</span>
          </li>
          <li>
            <strong>Message us</strong>
            <span>Send your order on WhatsApp or Messenger.</span>
          </li>
          <li>
            <strong>Ready in ~{business.prepMinutes} minutes</strong>
            <span>We&apos;ll text you when your order is ready.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
