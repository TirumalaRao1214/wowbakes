/**
 * WOW BAKES — Homepage Logic
 *
 * Renders featured products, category grid, hero CTAs.
 * Runs only on index.html.
 */

(async function initHomepage() {

  /* ── Update contact info from config ────────────────────── */
  function populateContactInfo() {
    const contactAddress = document.getElementById('contact-address');
    if (contactAddress) contactAddress.textContent = CONFIG.BUSINESS_ADDRESS;

    const contactPhone = document.getElementById('contact-phone');
    if (contactPhone) {
      contactPhone.textContent = CONFIG.BUSINESS_PHONE;
      contactPhone.href = `tel:${CONFIG.BUSINESS_PHONE.replace(/\s/g, '')}`;
    }

    const contactHours = document.getElementById('contact-hours');
    if (contactHours) contactHours.textContent = CONFIG.OPENING_HOURS;

    const waBtn = document.getElementById('contact-whatsapp-btn');
    if (waBtn) {
      const msg = encodeURIComponent(`Hello ${CONFIG.BUSINESS_NAME}! I would like to know more about your menu.`);
      waBtn.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`;
      waBtn.setAttribute('target', '_blank');
      waBtn.setAttribute('rel', 'noopener noreferrer');
    }
  }

  /* ── WhatsApp CTAs ───────────────────────────────────────── */
  function initWhatsAppCTAs() {
    const msg = encodeURIComponent(`Hello ${CONFIG.BUSINESS_NAME}! I would like to place an order.`);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`;

    ['hero-whatsapp-btn', 'cta-whatsapp-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.href = url;
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  /* ── Build product card HTML ─────────────────────────────── */
  function buildProductCard(product) {
    const minPrice = product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map(v => v.price))
      : product.price;

    const maxPrice = product.variants && product.variants.length > 0
      ? Math.max(...product.variants.map(v => v.price))
      : product.price;

    const hasVariants = product.variants && product.variants.length > 1;

    const spicyBadge = product.spicyLevel === 2
      ? '<span class="badge badge-hot" aria-label="Spicy">🌶 Spicy</span>'
      : product.spicyLevel === 1
        ? '<span class="badge badge-mild" aria-label="Mild">🌶 Mild</span>'
        : '';

    const jainBadge = product.jainAvailable
      ? '<span class="badge badge-jain" aria-label="Jain available">🌱 Jain</span>'
      : '';

    const priceDisplay = hasVariants
      ? `<span class="product-card-price-current">${CONFIG.CURRENCY}${minPrice}</span>
         <span class="product-card-price-from">from</span>`
      : `<span class="product-card-price-current">${CONFIG.CURRENCY}${minPrice}</span>`;

    const imgSrc = product.imageURL || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80';

    return `
      <div
        class="product-card"
        role="listitem"
        tabindex="0"
        data-product-id="${product.id}"
        aria-label="${product.name}, ${CONFIG.CURRENCY}${minPrice}"
      >
        <div class="product-card-image">
          <img
            src="${imgSrc}"
            alt="${product.name}"
            loading="lazy"
            width="300"
            height="225"
            onerror="this.src='https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80'"
          >
          ${product.featured ? '<div class="product-card-badge"><span class="badge badge-featured">⭐ Popular</span></div>' : ''}
        </div>
        <div class="product-card-body">
          <div class="product-card-meta">
            <div class="veg-indicator veg" aria-label="Vegetarian" title="Vegetarian"></div>
            ${jainBadge}
            ${spicyBadge}
          </div>
          <h3 class="product-card-name">${product.name}</h3>
          ${product.description ? `<p class="product-card-desc">${product.description}</p>` : ''}
          <div class="product-card-footer">
            <div class="product-card-price">
              ${priceDisplay}
            </div>
            <button
              class="product-card-add"
              aria-label="Add ${product.name} to cart"
              data-product-id="${product.id}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* ── Render featured products ────────────────────────────── */
  function renderFeaturedProducts(products) {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;

    const featured = products.filter(p => p.featured);

    if (featured.length === 0) {
      grid.innerHTML = '<div class="state-empty"><p>No featured items at the moment.</p></div>';
      return;
    }

    // Show max 8 featured on homepage
    const toShow = featured.slice(0, 8);
    grid.innerHTML = toShow.map(buildProductCard).join('');

    // Click handler — navigate to menu with product highlight
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.product-card-add')) return; // handled separately
        const id = card.dataset.productId;
        window.location.href = `menu.html?highlight=${id}`;
      });

      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Add button quick-add (for single-variant items without opening modal)
    grid.querySelectorAll('.product-card-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.productId;
        const product = products.find(p => p.id === id);
        if (!product) return;

        const variant = product.variants && product.variants.length > 0
          ? product.variants[0]
          : { name: 'Regular', price: product.price };

        CART.addItem({
          id:          product.id,
          name:        product.name,
          category:    product.category,
          variantName: variant.name,
          price:       variant.price,
          addOns:      [],
          quantity:    1,
          image:       product.imageURL || '',
        });
      });
    });
  }

  /* ── Render category grid ────────────────────────────────── */
  function renderCategoryGrid(categories, products) {
    const grid = document.getElementById('home-categories-grid');
    if (!grid) return;

    const sorted = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    if (sorted.length === 0) {
      grid.innerHTML = '<p class="text-muted text-center">No categories available.</p>';
      return;
    }

    // Count products per category
    const countMap = {};
    products.forEach(p => {
      countMap[p.category] = (countMap[p.category] || 0) + 1;
    });

    grid.innerHTML = sorted.map(cat => {
      const count = countMap[cat.name] || 0;
      const imgSrc = cat.imageURL || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80';
      return `
        <a
          href="menu.html?category=${encodeURIComponent(cat.name)}"
          class="category-card reveal"
          aria-label="${cat.name} — ${count} items"
          role="listitem"
        >
          <img
            class="category-card-image"
            src="${imgSrc}"
            alt="${cat.name}"
            loading="lazy"
            width="300"
            height="400"
            onerror="this.src='https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80'"
          >
          <div class="category-card-overlay" aria-hidden="true"></div>
          <div class="category-card-content">
            <div class="category-card-icon" aria-hidden="true">${cat.emoji || '🍽'}</div>
            <div class="category-card-name">${cat.name}</div>
            <div class="category-card-count">${count} item${count !== 1 ? 's' : ''}</div>
          </div>
        </a>
      `;
    }).join('');

    // Re-initialize scroll reveal for new elements
    initScrollReveal();
  }

  /* ── Main init ───────────────────────────────────────────── */
  async function main() {
    populateContactInfo();
    initWhatsAppCTAs();

    try {
      const { products = [], categories = [] } = await API.fetchAllData();

      renderFeaturedProducts(products);
      renderCategoryGrid(categories, products);

      // Refresh button
      const refreshBtn = document.getElementById('refresh-menu-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          API.clearCache();
          window.location.reload();
        });
      }

    } catch (err) {
      console.error('[WOW BAKES] Homepage init error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

})();
