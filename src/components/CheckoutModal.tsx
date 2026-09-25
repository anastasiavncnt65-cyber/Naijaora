import { useRef, useState, type FormEvent } from 'react';
import { business } from '../config/business';
import { useCart } from '../context/CartContext';
import {
  buildMessengerUrl,
  buildWhatsAppUrl,
  confirmOrderPayment,
  formatReadyTime,
  openMessenger,
  openWhatsApp,
  saveOrder,
  uploadReceipt,
} from '../lib/orders-db';
import { generateOrderNumber, formatMoney } from '../lib/orders';
import { supabaseConfigured } from '../lib/supabase';
import type { CheckoutForm, PlacedOrder } from '../types';

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  onOrderPlaced: (order: PlacedOrder) => void;
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
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!supabaseConfigured) {
      setError('Ordering is not connected yet. Please contact us directly.');
      return;
    }

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }

    setSubmitting(true);

    let order: PlacedOrder = {
      orderNumber: generateOrderNumber(),
      lines: [...lines],
      subtotal,
      total,
      form: { ...form },
      placedAt: new Date().toISOString(),
      status: 'pending_payment',
    };

    try {
      order = await saveOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your order. Please try again.');
      setSubmitting(false);
      return;
    }

    clearCart();
    setForm(initialForm);
    setSubmitting(false);
    onOrderPlaced(order);
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

        <form className="checkout-form" onSubmit={handleSubmit}>
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
                    placeholder="We will message you when your order is ready"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Optional"
                  />
                </label>
              </fieldset>

              <p className="field-note">{business.prepTimeNote}</p>
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
                  <span>Total due</span>
                  <strong>{formatMoney(total)}</strong>
                </div>
              </div>

              <div className="payment-box">
                <h4>Pay by bank transfer</h4>
                <p>{business.payment.instructions}</p>
                <dl>
                  <div>
                    <dt>Account name</dt>
                    <dd>{business.payment.bank.accountName}</dd>
                  </div>
                  <div>
                    <dt>Bank</dt>
                    <dd>{business.payment.bank.bankName}</dd>
                  </div>
                  <div>
                    <dt>Account number</dt>
                    <dd className="mono">{business.payment.bank.accountNumber}</dd>
                  </div>
                </dl>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Saving order…' : 'Place order'}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

type OrderFlowProps = {
  order: PlacedOrder | null;
  onUpdate: (order: PlacedOrder) => void;
  onClose: () => void;
};

export function OrderConfirmation({ order, onUpdate, onClose }: OrderFlowProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const isPaid = order.status === 'payment_submitted';

  function handleReceiptChange(file: File | null) {
    setReceiptFile(file);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handlePaymentConfirmed() {
    if (!receiptFile) {
      setError('Please upload a screenshot of your bank transfer receipt.');
      return;
    }

    setConfirming(true);
    setError('');
    try {
      const receiptUrl = await uploadReceipt(order!.orderNumber, receiptFile);
      const updated = await confirmOrderPayment(order!, receiptUrl);
      onUpdate(updated);
      // Opens WhatsApp so the customer can send you the order + receipt (free, no Twilio)
      openWhatsApp(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm payment. Please try again.');
    }
    setConfirming(false);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal confirmation-modal">
        {!isPaid ? (
          <>
            <div className="confirmation-icon pending">1</div>
            <h2>Pay & upload receipt</h2>
            <p className="order-number">{order.orderNumber}</p>
            <p>
              Transfer <strong>{formatMoney(order.total)}</strong> using reference{' '}
              <strong>{order.orderNumber}</strong>.
            </p>

            <div className="payment-box align-left">
              <dl>
                <div>
                  <dt>Account number</dt>
                  <dd className="mono">{business.payment.bank.accountNumber}</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd className="mono highlight">{order.orderNumber}</dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd className="mono highlight">{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="receipt-upload">
              <p className="pickup-label">Upload bank receipt *</p>
              <p className="muted">{business.payment.receiptNote}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => fileInputRef.current?.click()}
              >
                {receiptFile ? 'Change screenshot' : 'Choose screenshot'}
              </button>
              {receiptFile && <p className="file-name">{receiptFile.name}</p>}
              {receiptPreview && (
                <img src={receiptPreview} alt="Receipt preview" className="receipt-preview" />
              )}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="confirmation-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handlePaymentConfirmed}
                disabled={confirming || !receiptFile}
              >
                {confirming ? 'Submitting…' : 'Confirm payment'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="confirmation-icon">✓</div>
            <h2>Order confirmed</h2>
            <p className="order-number">{order.orderNumber}</p>

            {order.estimatedReadyAt && (
              <p className="ready-time">
                See you around <strong>{formatReadyTime(order.estimatedReadyAt)}</strong>
              </p>
            )}

            <p className="muted">
              We&apos;re preparing your order now. We&apos;ll message{' '}
              <strong>{order.form.phone}</strong> when it&apos;s ready.
            </p>

            <p className="muted notify-hint">
              Send your order to us so we can start preparing it:
            </p>

            <div className="confirmation-actions">
              <a
                className="btn btn-primary btn-block"
                href={buildWhatsAppUrl(order)}
                target="_blank"
                rel="noreferrer"
              >
                Send on WhatsApp
              </a>
              {buildMessengerUrl() && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => openMessenger(order)}
                >
                  Send on Messenger
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>
                Back to menu
              </button>
            </div>
            {buildMessengerUrl() && (
              <p className="muted messenger-hint">
                Messenger: order details are copied — paste them into the chat.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
