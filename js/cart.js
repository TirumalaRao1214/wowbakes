/**
 * WOW BAKES — Cart Module
 *
 * Manages the shopping cart state.
 * Persists to localStorage so cart survives page navigation and refresh.
 * Exposes global CART object.
 */

const CART = (() => {
  const STORAGE_KEY = 'wow_bakes_cart';

  /* ── State ──────────────────────────────────────────────── */
  let _items = [];

  /* ── Load from localStorage on init ────────────────────── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(_items)) _items = [];
    } catch {
      _items = [];
    }
  }

  /* ── Save to localStorage ──────────────────────────────── */
  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_items));
    } catch {
      // Quota exceeded — fail silently
    }
    _updateAllBadges();
  }

  /* ── Update cart badges on all pages ────────────────────── */
  function _updateAllBadges() {
    const count = getCount();
    const displayVal = count > 0 ? String(count) : '0';

    document.querySelectorAll('#nav-cart-count, #mobile-cart-count').forEach(el => {
      el.textContent = displayVal;
      // Show/hide based on count
      if (count > 0) {
        el.removeAttribute('data-count');
        el.style.display = '';
      } else {
        el.setAttribute('data-count', '0');
      }
    });
  }

  /* ── Generate a unique line item key ────────────────────── */
  function _itemKey(productId, variantName) {
    return `${productId}::${variantName || 'default'}`;
  }

  /* ── Public API ─────────────────────────────────────────── */

  function getItems() {
    return [..._items];
  }

  function getCount() {
    return _items.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return _items.reduce((sum, item) => {
      const addOnTotal = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
      return sum + (item.price + addOnTotal) * item.quantity;
    }, 0);
  }

  function getDeliveryCharge(orderType) {
    if (!CONFIG.DELIVERY_ENABLED) return 0;
    if (orderType !== 'delivery') return 0;
    const subtotal = getSubtotal();
    if (CONFIG.FREE_DELIVERY_ABOVE > 0 && subtotal >= CONFIG.FREE_DELIVERY_ABOVE) return 0;
    return CONFIG.DELIVERY_CHARGE;
  }

  function getTotal(orderType) {
    return getSubtotal() + getDeliveryCharge(orderType);
  }

  function addItem(item) {
    /**
     * item shape:
     * {
     *   id, name, category,
     *   variantName, price,
     *   addOns: [{ name, price }],
     *   quantity,
     *   image
     * }
     */
    const key = _itemKey(item.id, item.variantName);
    const existing = _items.find(i => _itemKey(i.id, i.variantName) === key);

    if (existing) {
      existing.quantity += (item.quantity || 1);
    } else {
      _items.push({
        id:          item.id,
        name:        item.name,
        category:    item.category || '',
        variantName: item.variantName || '',
        price:       item.price,
        addOns:      item.addOns || [],
        quantity:    item.quantity || 1,
        image:       item.image || '',
      });
    }

    _save();
    showToast(`"${item.name}" added to cart`, 'success');
  }

  function removeItem(productId, variantName) {
    const key = _itemKey(productId, variantName);
    _items = _items.filter(i => _itemKey(i.id, i.variantName) !== key);
    _save();
  }

  function updateQuantity(productId, variantName, qty) {
    const key = _itemKey(productId, variantName);
    const item = _items.find(i => _itemKey(i.id, i.variantName) === key);
    if (!item) return;

    if (qty <= 0) {
      removeItem(productId, variantName);
    } else {
      item.quantity = qty;
      _save();
    }
  }

  function clearAll() {
    _items = [];
    _save();
  }

  function isEmpty() {
    return _items.length === 0;
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    _load();
    _updateAllBadges();
  }

  return {
    getItems,
    getCount,
    getSubtotal,
    getDeliveryCharge,
    getTotal,
    addItem,
    removeItem,
    updateQuantity,
    clearAll,
    isEmpty,
    init,
  };
})();

window.CART = CART;

/* ── Toast utility (shared across all pages) ─────────────── */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Auto-remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ── Shared: Sticky Nav ─────────────────────────────────── */
function initStickyNav() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Shared: Hamburger / Mobile Drawer ─────────────────── */
function initHamburger() {
  const btn    = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');

  if (!btn || !drawer) return;

  function open() {
    drawer.hidden = false;
    drawer.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function close() {
    drawer.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // hide after transition
    setTimeout(() => { drawer.hidden = true; }, 400);
    btn.focus();
  }

  btn.addEventListener('click', () => drawer.hidden ? open() : close());
  overlay && overlay.addEventListener('click', close);
  closeBtn && closeBtn.addEventListener('click', close);

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !drawer.hidden && drawer.classList.contains('open')) close();
  });
}

/* ── Shared: Scroll Reveal ─────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ── Shared: Footer year + dynamic brand info ───────────── */
function initFooter() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Brand info from config
  const addressEl = document.getElementById('footer-address');
  if (addressEl) addressEl.textContent = CONFIG.BUSINESS_ADDRESS;

  const phoneEl = document.getElementById('footer-phone');
  if (phoneEl) {
    phoneEl.textContent = CONFIG.BUSINESS_PHONE;
    phoneEl.href = `tel:${CONFIG.BUSINESS_PHONE.replace(/\s/g,'')}`;
  }

  const hoursEl = document.getElementById('footer-hours');
  if (hoursEl) hoursEl.textContent = CONFIG.OPENING_HOURS;

  const igLink = document.getElementById('footer-instagram');
  if (igLink && CONFIG.INSTAGRAM_URL) igLink.href = CONFIG.INSTAGRAM_URL;

  const waLink = document.getElementById('footer-whatsapp');
  if (waLink) waLink.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;
}

/* Auto-init cart badge on every page */
document.addEventListener('DOMContentLoaded', () => {
  CART.init();
  initStickyNav();
  initHamburger();
  initScrollReveal();
  initFooter();
});
