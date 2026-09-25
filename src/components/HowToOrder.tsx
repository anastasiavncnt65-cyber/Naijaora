const steps = [
  {
    n: '1',
    title: 'Add to cart',
    text: 'Browse the menu and add the dishes you want.',
  },
  {
    n: '2',
    title: 'Checkout & pay',
    text: 'Enter your details, then transfer the total to our Westpac account using your order number as the reference.',
  },
  {
    n: '3',
    title: 'Upload your receipt',
    text: 'Screenshot your online banking confirmation and upload it to confirm your order.',
  },
  {
    n: '4',
    title: 'Send on WhatsApp or Messenger',
    text: 'Send us your order so we know it is ready to prepare. Email also notifies us as a backup.',
  },
  {
    n: '5',
    title: 'When it’s ready',
    text: 'We’ll message you when it’s ready — usually about 50 minutes after payment is verified.',
  },
];

export function HowToOrder() {
  return (
    <section id="how-to-order" className="howto-section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Getting started</p>
          <h2>How to order</h2>
        </div>

        <ol className="howto-steps">
          {steps.map((step) => (
            <li key={step.n} className="howto-step">
              <span className="howto-num" aria-hidden>
                {step.n}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
