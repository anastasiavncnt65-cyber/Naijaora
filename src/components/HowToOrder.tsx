const steps = [
  {
    n: '1',
    title: 'Add to cart',
    text: 'Browse the menu and add the dishes you want.',
  },
  {
    n: '2',
    title: 'Checkout',
    text: 'Enter your name and phone number.',
  },
  {
    n: '3',
    title: 'Send on WhatsApp or Messenger',
    text: 'Choose WhatsApp or Messenger — your order message opens ready to send.',
  },
  {
    n: '4',
    title: 'We continue in chat',
    text: 'We’ll reply there to confirm details and when your order will be ready.',
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
