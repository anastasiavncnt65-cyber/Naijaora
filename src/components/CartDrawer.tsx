import { useCart } from '../context/CartContext';
import { asset } from '../lib/asset';
import { formatMoney } from '../lib/orders';

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { lines, itemCount, subtotal, setQuantity, removeItem } = useCart();

  return (
    <>
      <div
        className={`cart-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-label="Shopping cart">
        <div className="cart-header">
          <h2>Your order</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Browse menu
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map((line) => (
                <li key={line.itemId} className="cart-line">
                  <div className="cart-line-media">
                    {line.image ? (
                      <img src={asset(line.image)} alt="" />
                    ) : (
                      '🍴'
                    )}
                  </div>
                  <div className="cart-line-info">
                    <strong>{line.name}</strong>
                    <span>{formatMoney(line.price)} each</span>
                    <div className="qty-controls">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(line.itemId, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(line.itemId, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-right">
                    <strong>{formatMoney(line.price * line.quantity)}</strong>
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => removeItem(line.itemId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              <p className="cart-note">Pickup only · Payment required to confirm</p>
              <div className="cart-summary-row">
                <span>{itemCount} items</span>
                <strong>{formatMoney(subtotal)}</strong>
              </div>
              <button type="button" className="btn btn-primary btn-block" onClick={onCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
