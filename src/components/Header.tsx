import { business } from '../config/business';
import { useCart } from '../context/CartContext';

type HeaderProps = {
  onCartClick: () => void;
  onOrderClick: () => void;
};

export function Header({ onCartClick, onOrderClick }: HeaderProps) {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#" className="brand" onClick={(e) => e.preventDefault()}>
          <span className="brand-name">{business.name}</span>
        </a>

        <nav className="header-nav" aria-label="Main">
          <button type="button" className="nav-link" onClick={onOrderClick}>
            Menu
          </button>
          <a className="nav-link" href="#how-to-order">
            How to order
          </a>
          <a className="nav-link" href="#reviews">
            Reviews
          </a>
        </nav>

        <button type="button" className="cart-button" onClick={onCartClick}>
          <span>Cart</span>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>
      </div>
    </header>
  );
}
