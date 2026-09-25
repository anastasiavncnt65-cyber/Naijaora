import { useEffect, useMemo, useState } from 'react';
import { business, menuCategories, menuItems } from '../config/business';
import { useCart } from '../context/CartContext';
import { asset } from '../lib/asset';
import { fetchPopularItemIds } from '../lib/orders-db';
import { formatMoney } from '../lib/orders';

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id ?? '');
  const [popularIds, setPopularIds] = useState<Set<string>>(new Set());
  const { addItem } = useCart();

  useEffect(() => {
    fetchPopularItemIds().then(setPopularIds).catch(() => setPopularIds(new Set()));
  }, []);

  const filteredItems = useMemo(
    () => menuItems.filter((item) => item.categoryId === activeCategory),
    [activeCategory],
  );

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        <div className="section-heading">
          <h2>Menu</h2>
        </div>

        <div className="category-tabs" role="tablist" aria-label="Menu categories">
          {menuCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="menu-card">
              <div className="menu-card-media">
                <img
                  src={asset(item.image)}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={480}
                />
                {popularIds.has(item.id) && (
                  <span className="popular-badge">Popular</span>
                )}
              </div>
              <div className="menu-card-body">
                <div className="menu-card-top">
                  <h3>{item.name}</h3>
                  <span className="menu-price">{formatMoney(item.price)}</span>
                </div>
                <p>{item.description}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => addItem(item.id)}
                >
                  Add to order
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="menu-note">{business.prepTimeNote}</p>
      </div>
    </section>
  );
}
