import { useState, type FormEvent } from 'react';
import { useCart } from '../context/CartContext';
import {
  buildFacebookPageUrl,
  buildMessengerUrl,
  buildOrderMessage,
  buildWhatsAppUrl,
  openMessenger,
  openWhatsApp,
} from '../lib/orders-db';
import { generateOrderNumber, formatMoney } from '../lib/orders';
import type { CheckoutForm, PlacedOrder } from '../types';

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  onOrderPlaced: (order: PlacedOrder, channel: 'whatsapp' | 'messenger') => void;
};

const initialForm: CheckoutForm = {
  name: '',
  phone: '',
  email: '',
};

export function CheckoutModal({ open, onClose, onOrderPlaced }: CheckoutModalProps) {
  const { lines, subtotal, total, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [error, setError] = useState('');
  const [sending, setSending] = useState<'whatsapp' | 'messenger' | null>(null);

  if (!open) return null;

  function buildOrder(): PlacedOrder | null {
    setError('');
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.');
      return null;
    }
    if (lines.length === 0) {
      setError('Your cart is empty.');
      return null;
    }
    return {
      orderNumber: generateOrderNumber(),
      lines: [...lines],
      subtotal,
      total,
      form: { ...form },
      placedAt: new Date().toISOString(),
      status: 'messaging',
    };
  }

  async function handleChannel(channel: 'whatsapp' | 'messenger', e?: FormEvent) {
    e?.preventDefault();
    const order = buildOrder();
    if (!order) return;

    if (channel === 'messenger' && !buildMessengerUrl()) {
      setError('Messenger is not set up yet. Please use WhatsApp.');
      return;
    }

    setSending(channel);
    if (channel === 'whatsapp') {
      openWhatsApp(order);
    } else {
      await openMessenger(order);
    }

    clearCart();
    setForm(initialForm);
    setSending(null);
    onOrderPlaced(order, channel);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="modal checkout-modal">
        <div className="modal-header">
          <h2 id="checkout-title">Checkout</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close checkout">
            ✕
          </button>
        </div>

        <form
          className="checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="checkout-columns">
            <div className="checkout-main">
              <fieldset>
                <legend>Your details</legend>
                <label>
                  Full name *
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Your full name"
                  />
                </label>
                <label>
                  Phone *
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    placeholder="So we can message you back"
                  />
                </label>
              </fieldset>

              <p className="field-note">
                Send your order on WhatsApp or Messenger — we&apos;ll finish details there.
              </p>
            </div>

            <aside className="checkout-side">
              <h3>Order summary</h3>
              <ul className="summary-lines">
                {lines.map((line) => (
                  <li key={line.itemId}>
                    <span>
                      {line.quantity}× {line.name}
                    </span>
                    <span>{formatMoney(line.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-totals">
                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatMoney(total)}</strong>
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="channel-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  disabled={sending !== null}
                  onClick={() => handleChannel('whatsapp')}
                >
                  {sending === 'whatsapp' ? 'Opening WhatsApp…' : 'Send on WhatsApp'}
                </button>
                {buildMessengerUrl() && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-block"
                    disabled={sending !== null}
                    onClick={() => handleChannel('messenger')}
                  >
                    {sending === 'messenger' ? 'Opening Messenger…' : 'Send on Messenger'}
                  </button>
                )}
              </div>
              <p className="muted messenger-hint">
                Opens a chat with your order ready to send. We&apos;ll continue there.
              </p>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

type OrderFlowProps = {
  order: PlacedOrder | null;
  channel: 'whatsapp' | 'messenger' | null;
  onClose: () => void;
};

export function OrderConfirmation({ order, channel, onClose }: OrderFlowProps) {
  if (!order) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal confirmation-modal">
        <div className="confirmation-icon">✓</div>
        <h2>Continue in chat</h2>
        <p className="muted">
          Your order message is ready
          {channel === 'whatsapp' ? ' on WhatsApp' : channel === 'messenger' ? ' on Messenger' : ''}.
          Send it, then we&apos;ll continue the conversation there.
        </p>

        {channel === 'messenger' && (
          <>
            <p className="muted messenger-hint">
              Order text was copied. If Messenger didn&apos;t open the Naijaora chat, open the
              Page, tap <strong>Message</strong>, then paste.
            </p>
            {buildFacebookPageUrl() && (
              <a
                className="btn btn-secondary btn-block"
                href={buildFacebookPageUrl()!}
                target="_blank"
                rel="noreferrer"
              >
                Open Facebook Page
              </a>
            )}
          </>
        )}

        <div className="confirmation-actions">
          {channel === 'whatsapp' && (
            <a
              className="btn btn-primary btn-block"
              href={buildWhatsAppUrl(order)}
              target="_blank"
              rel="noreferrer"
            >
              Open WhatsApp again
            </a>
          )}
          {channel === 'messenger' && buildMessengerUrl() && (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => openMessenger(order)}
            >
              Open Messenger again
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>
            Back to menu
          </button>
        </div>

        <details className="order-preview">
          <summary>Preview message</summary>
          <pre>{buildOrderMessage(order)}</pre>
        </details>
      </div>
    </div>
  );
}
