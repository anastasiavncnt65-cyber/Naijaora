import { useState } from 'react';
import { AboutSection, Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import {
  CheckoutModal,
  OrderConfirmation,
} from './components/CheckoutModal';
import { HowToOrder } from './components/HowToOrder';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { ReviewsSection } from './components/ReviewsSection';
import { CartProvider } from './context/CartContext';
import type { PlacedOrder } from './types';
import './index.css';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [orderChannel, setOrderChannel] = useState<'whatsapp' | 'messenger' | null>(null);

  function scrollToMenu() {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  }

  function openCheckout() {
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  function handleOrderPlaced(order: PlacedOrder, channel: 'whatsapp' | 'messenger') {
    setCheckoutOpen(false);
    setOrderChannel(channel);
    setPlacedOrder(order);
  }

  return (
    <CartProvider>
      <Header
        onCartClick={() => setCartOpen(true)}
        onOrderClick={scrollToMenu}
      />
      <main>
        <Hero onOrderClick={scrollToMenu} />
        <HowToOrder />
        <MenuSection />
        <AboutSection />
        <ReviewsSection />
      </main>
      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={openCheckout}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />
      <OrderConfirmation
        order={placedOrder}
        channel={orderChannel}
        onClose={() => {
          setPlacedOrder(null);
          setOrderChannel(null);
        }}
      />
    </CartProvider>
  );
}

export default App;
