/**
 * WOW BAKES — Products & Product Modal
 *
 * Handles rendering of the product grid on menu.html,
 * paginated loading, category tabs, search, and the
 * product detail modal with variant/add-on selection.
 */

(async function initMenuPage() {

  /* ── State ──────────────────────────────────────────────── */
  let _allProducts = [];
  let _addons      = [];
  let _categories  = [];
  let _filtered    = [];
  let _displayed   = 0;
  const PAGE_SIZE  = CONFIG.PRODUCTS_PER_PAGE || 24;

  /* ── Modal state ────────────────────────────────────────── */
  let _modalProduct    = null;
  let _selectedVariant = null;
  let _selectedAddons  = [];
  let _qty             = 1;

  /* ────────────────────────────────────────────────────────
     PRODUCT CARD RENDERING
  ─────────────────────────────────────────────────────── */

  function _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _buildCard(product) {
    const variants  = product.variants || [{ name: 'Regular', price: product.price }];
    const minPrice  = Math.min(...variants.map(v => v.price));
    const hasVars   = variants.length > 1;
    const available = product.available !== false;

    const spicyBadge = product.spicyLevel === 2
      ? `<span class="badge badge-hot" aria-label="Spicy">🌶 Spicy</span>`
      : product.spicyLevel === 1
        ? `<span class="badge badge-mild" aria-label="Mild">🌶 Mild</span>`
        : '';

    const jainBadge = product.jainAvailable
      ? `<span class="badge badge-jain" aria-label="Jain option available">🌱 Jain</span>`
      : '';

    const imgSrc = product.imageURL
      || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80';

    return `
      <article
        class="product-card${available ? '' : ' out-of-stock'}"
        role="listitem"
        tabindex="0"
        data-product-id="${_escHtml(product.id)}"
        aria-label="${_escHtml(product.name)}, ${CONFIG.CURRENCY}${minPrice}${available ? '' : ', Out of Stock'}"
      >
        <div class="product-card-image">
          <img
            src="${_escHtml(imgSrc)}"
            alt="${_escHtml(product.name)}"
            loading="lazy"
            width="300" height="225"
            onerror="this.src='https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80'"
          >
          ${product.featured ? `<div class="product-card-badge"><span class="badge badge-featured">⭐ Popular</span></div>` : ''}
          ${!available ? `<div class="product-card-oos-overlay"><span class="product-card-oos-label">Out of Stock</span></div>` : ''}
        </div>
        <div class="product-card-body">
          <div class="product-card-meta">
            <div class="veg-indicator veg" aria-label="Vegetarian" title="Vegetarian"></div>
            ${jainBadge}
            ${spicyBadge}
          </div>
          <h3 class="product-card-name">${_escHtml(product.name)}</h3>
          ${product.description ? `<p class="product-card-desc">${_escHtml(product.description)}</p>` : ''}
          <div class="product-card-footer">
            <div class="product-card-price">
              ${hasVars ? `<span class="product-card-price-from">from</span>` : ''}
              <span class="product-card-price-current">${CONFIG.CURRENCY}${minPrice}</span>
            </div>
            ${available
              ? `<button class="product-card-add" aria-label="Add ${_escHtml(product.name)} to cart" data-product-id="${_escHtml(product.id)}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                 </button>`
              : `<span class="badge badge-oos">Unavailable</span>`
            }
          </div>
        </div>
      </article>
    `;
  }

  /* ────────────────────────────────────────────────────────
     GRID RENDERING (PAGINATED)
  ─────────────────────────────────────────────────────── */

  function _renderGrid(reset = false) {
    const grid      = document.getElementById('product-grid');
    const loadWrap  = document.getElementById('load-more-wrap');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');

    if (!grid) return;

    if (_filtered.length === 0) {
      grid.hidden   = true;
      if (loadWrap) loadWrap.hidden = true;
      if (noResults) noResults.hidden = false;
      if (resultsCount) resultsCount.textContent = '0';
      return;
    }

    if (noResults) noResults.hidden = true;
    grid.hidden = false;

    if (reset) {
      _displayed = 0;
      grid.innerHTML = '';
    }

    const slice = _filtered.slice(_displayed, _displayed + PAGE_SIZE);
    if (slice.length === 0) return;

    // Batch DOM insert for performance
    const fragment = document.createDocumentFragment();
    slice.forEach(product => {
      const div = document.createElement('div');
      div.innerHTML = _buildCard(product);
      fragment.appendChild(div.firstElementChild);
    });
    grid.appendChild(fragment);

    _displayed += slice.length;

    // Results count
    if (resultsCount) resultsCount.textContent = _filtered.length;

    // Load more button
    const remaining = _filtered.length - _displayed;
    if (loadWrap) {
      loadWrap.hidden = remaining <= 0;
      const remEl = document.getElementById('remaining-count');
      if (remEl) remEl.textContent = remaining > 0 ? ` (${remaining} more)` : '';
    }
  }

  /* ────────────────────────────────────────────────────────
     SEARCH (debounced)
  ─────────────────────────────────────────────────────── */

  let _searchDebounce = null;
  let _searchQuery    = '';

  function _initSearch() {
    const input = document.getElementById('menu-search');
    const clear = document.getElementById('search-clear');
    if (!input) return;

    input.addEventListener('input', () => {
      clearTimeout(_searchDebounce);
      _searchDebounce = setTimeout(() => {
        _searchQuery = input.value.trim();
        if (clear) clear.hidden = _searchQuery.length === 0;
        _applyAndRender();
      }, 300);
    });

    clear && clear.addEventListener('click', () => {
      input.value = '';
      _searchQuery = '';
      clear.hidden = true;
      _applyAndRender();
      input.focus();
    });
  }

  /* ────────────────────────────────────────────────────────
     APPLY FILTERS → RE-RENDER
  ─────────────────────────────────────────────────────── */

  function _applyAndRender() {
    // Hide loading state if still showing
    const loading = document.getElementById('products-loading');
    if (loading) loading.hidden = true;

    _filtered = FILTERS.apply(_allProducts, _searchQuery);
    _renderGrid(true);
  }

  /* ────────────────────────────────────────────────────────
     CATEGORY TABS
  ─────────────────────────────────────────────────────── */

  function _buildCategoryTabs(categories, products) {
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    const countMap = {};
    products.forEach(p => { countMap[p.category] = (countMap[p.category] || 0) + 1; });

    const sorted = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const pills = sorted.map(cat => {
      const count = countMap[cat.name] || 0;
      return `
        <button
          class="category-pill"
          data-category="${_escHtml(cat.name)}"
          role="tab"
          aria-selected="false"
          aria-controls="product-grid"
        >
          ${cat.emoji ? `<span class="category-pill-icon" aria-hidden="true">${cat.emoji}</span>` : ''}
          ${_escHtml(cat.name)}
          <span style="opacity:0.6; font-size:0.75rem; margin-left:2px;">(${count})</span>
        </button>
      `;
    }).join('');

    // Preserve the "All" button, append category buttons
    const allBtn = tabsContainer.querySelector('[data-category="all"]');
    tabsContainer.innerHTML = '';
    if (allBtn) tabsContainer.appendChild(allBtn);
    const tmp = document.createElement('div');
    tmp.innerHTML = pills;
    while (tmp.firstChild) tabsContainer.appendChild(tmp.firstChild);

    // Click handler
    tabsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.category-pill');
      if (!btn) return;

      tabsContainer.querySelectorAll('.category-pill').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      FILTERS.setCategory(btn.dataset.category);
      _applyAndRender();
    });
  }

  /* ────────────────────────────────────────────────────────
     URL PARAM: ?category=Burgers or ?highlight=B001
  ─────────────────────────────────────────────────────── */

  function _handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const cat    = params.get('category');

    if (cat) {
      FILTERS.setCategory(cat);
      // Activate matching tab
      const tabs = document.getElementById('category-tabs');
      if (tabs) {
        tabs.querySelectorAll('.category-pill').forEach(btn => {
          const active = btn.dataset.category === cat;
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-selected', String(active));
        });
      }
    }
  }

  /* ────────────────────────────────────────────────────────
     INFINITE SCROLL (sentinel)
  ─────────────────────────────────────────────────────── */

  function _initInfiniteScroll() {
    const sentinel = document.getElementById('scroll-sentinel');
    const loadMoreBtn = document.getElementById('load-more-btn');

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        _renderGrid(false);
      });
    }

    if (sentinel && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && _displayed < _filtered.length) {
            _renderGrid(false);
          }
        });
      }, { rootMargin: '200px' });
      observer.observe(sentinel);
    }
  }

  /* ────────────────────────────────────────────────────────
     CARD CLICK → OPEN MODAL
  ─────────────────────────────────────────────────────── */

  function _initCardClicks() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.addEventListener('click', e => {
      const addBtn = e.target.closest('.product-card-add');
      const card   = e.target.closest('.product-card');
      if (!card) return;

      const productId = card.dataset.productId;
      const product = _allProducts.find(p => p.id === productId);
      if (!product) return;

      if (addBtn) {
        // If single variant, add directly
        if (!product.variants || product.variants.length <= 1) {
          const variant = (product.variants || [])[0] || { name: 'Regular', price: product.price };
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
          return;
        }
        // Multi-variant → open modal
      }

      // Open product modal
      openModal(product);
    });

    grid.addEventListener('keydown', e => {
      const card = e.target.closest('.product-card');
      if (card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const productId = card.dataset.productId;
        const product = _allProducts.find(p => p.id === productId);
        if (product) openModal(product);
      }
    });
  }

  /* ────────────────────────────────────────────────────────
     PRODUCT MODAL
  ─────────────────────────────────────────────────────── */

  function _calcModalTotal() {
    if (!_modalProduct) return 0;
    const base = _selectedVariant ? _selectedVariant.price : (_modalProduct.price || 0);
    const addOnSum = _selectedAddons.reduce((s, a) => s + (a.price || 0), 0);
    return (base + addOnSum) * _qty;
  }

  function _updateModalTotal() {
    const el = document.getElementById('modal-total-amount');
    if (el) el.textContent = `${CONFIG.CURRENCY}${_calcModalTotal()}`;
  }

  function openModal(product) {
    if (!product) return;
    _modalProduct    = product;
    _selectedAddons  = [];
    _qty             = 1;

    const variants   = product.variants || [{ name: 'Regular', price: product.price }];
    _selectedVariant = variants[0];

    // Image
    const img = document.getElementById('modal-image');
    if (img) {
      img.src = product.imageURL || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80';
      img.alt = product.name;
    }

    // Name & description
    const nameEl = document.getElementById('modal-product-name');
    if (nameEl) nameEl.textContent = product.name;

    const descEl = document.getElementById('modal-product-desc');
    if (descEl) descEl.textContent = product.description || '';

    // Badges
    const badgesEl = document.getElementById('modal-badges');
    if (badgesEl) {
      let badges = '<span class="badge badge-veg"><span style="width:8px;height:8px;border-radius:50%;background:var(--green-veg);display:inline-block;"></span>VEG</span>';
      if (product.jainAvailable) badges += '<span class="badge badge-jain">🌱 Jain</span>';
      if (product.spicyLevel === 2) badges += '<span class="badge badge-hot">🌶 Spicy</span>';
      else if (product.spicyLevel === 1) badges += '<span class="badge badge-mild">🌶 Mild</span>';
      badgesEl.innerHTML = badges;
    }

    // Jain note
    const jainNote = document.getElementById('modal-jain-note');
    if (jainNote) jainNote.hidden = !product.jainAvailable;

    // Variants
    const varSection = document.getElementById('modal-variants');
    const varOptions = document.getElementById('modal-variant-options');
    if (varSection && varOptions) {
      if (variants.length > 1) {
        varOptions.innerHTML = variants.map((v, i) => `
          <button
            class="variant-option${i === 0 ? ' selected' : ''}"
            data-variant-index="${i}"
            role="radio"
            aria-checked="${i === 0 ? 'true' : 'false'}"
            aria-label="${v.name} — ${CONFIG.CURRENCY}${v.price}"
          >
            ${_escHtml(v.name)}
            <span class="variant-option-price">${CONFIG.CURRENCY}${v.price}</span>
          </button>
        `).join('');
        varSection.hidden = false;
      } else {
        varSection.hidden = true;
      }
    }

    // Add-ons
    const addonsSection = document.getElementById('modal-addons-section');
    const addonsList    = document.getElementById('modal-addons-list');
    if (addonsSection && addonsList) {
      const applicable = _addons.filter(a => a.category === product.category && a.available !== false);
      if (applicable.length > 0) {
        addonsList.innerHTML = applicable.map(ao => `
          <div
            class="addon-item"
            data-addon-id="${_escHtml(ao.id)}"
            role="checkbox"
            aria-checked="false"
            tabindex="0"
          >
            <div class="addon-checkbox"></div>
            <span class="addon-name">${_escHtml(ao.name)}</span>
            <span class="addon-price">+${CONFIG.CURRENCY}${ao.price}</span>
          </div>
        `).join('');
        addonsSection.hidden = false;
      } else {
        addonsSection.hidden = true;
      }
    }

    // Reset qty display
    const qtyEl = document.getElementById('modal-qty-value');
    if (qtyEl) qtyEl.textContent = '1';

    _updateModalTotal();

    // Show modal
    const backdrop = document.getElementById('modal-backdrop');
    const modal    = document.getElementById('product-modal');
    if (backdrop) { backdrop.classList.add('open'); backdrop.removeAttribute('aria-hidden'); }
    if (modal)    {
      modal.hidden = false;
      modal.classList.add('open');
    }
    document.body.style.overflow = 'hidden';

    // Focus trap: focus close button
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const modal    = document.getElementById('product-modal');
    if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); }
    if (modal)    { modal.classList.remove('open'); }
    document.body.style.overflow = '';
    setTimeout(() => { if (modal) modal.hidden = true; }, 380);
    _modalProduct = null;
  }

  function _initModalEvents() {
    // Close button
    document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);

    // Backdrop click
    document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);

    // ESC key
    document.addEventListener('keydown', e => {
      const modal = document.getElementById('product-modal');
      if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });

    // Variant selection
    document.getElementById('modal-variant-options')?.addEventListener('click', e => {
      const btn = e.target.closest('.variant-option');
      if (!btn) return;
      document.querySelectorAll('#modal-variant-options .variant-option').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      const idx = parseInt(btn.dataset.variantIndex, 10);
      const variants = _modalProduct?.variants || [];
      _selectedVariant = variants[idx] || null;
      _updateModalTotal();
    });

    // Add-on toggle
    document.getElementById('modal-addons-list')?.addEventListener('click', e => {
      const item = e.target.closest('.addon-item');
      if (!item) return;
      _toggleAddon(item);
    });

    document.getElementById('modal-addons-list')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.addon-item');
        if (item) { e.preventDefault(); _toggleAddon(item); }
      }
    });

    // Qty controls
    document.getElementById('modal-qty-minus')?.addEventListener('click', () => {
      if (_qty > 1) { _qty--; }
      const el = document.getElementById('modal-qty-value');
      if (el) el.textContent = _qty;
      _updateModalTotal();
    });

    document.getElementById('modal-qty-plus')?.addEventListener('click', () => {
      _qty++;
      const el = document.getElementById('modal-qty-value');
      if (el) el.textContent = _qty;
      _updateModalTotal();
    });

    // Add to cart
    document.getElementById('modal-add-to-cart')?.addEventListener('click', () => {
      if (!_modalProduct) return;
      const variant = _selectedVariant
        || (_modalProduct.variants || [])[0]
        || { name: 'Regular', price: _modalProduct.price };

      CART.addItem({
        id:          _modalProduct.id,
        name:        _modalProduct.name,
        category:    _modalProduct.category,
        variantName: variant.name,
        price:       variant.price,
        addOns:      [..._selectedAddons],
        quantity:    _qty,
        image:       _modalProduct.imageURL || '',
      });
      closeModal();
    });
  }

  function _toggleAddon(itemEl) {
    const addonId = itemEl.dataset.addonId;
    const addon   = _addons.find(a => a.id === addonId);
    if (!addon) return;

    const isSelected = itemEl.classList.contains('selected');
    if (isSelected) {
      _selectedAddons = _selectedAddons.filter(a => a.id !== addonId);
      itemEl.classList.remove('selected');
      itemEl.setAttribute('aria-checked', 'false');
    } else {
      _selectedAddons.push(addon);
      itemEl.classList.add('selected');
      itemEl.setAttribute('aria-checked', 'true');
    }
    _updateModalTotal();
  }

  /* ────────────────────────────────────────────────────────
     RESULTS INFO
  ─────────────────────────────────────────────────────── */

  function _updateResultsInfo() {
    const info = document.getElementById('results-info');
    if (!info) return;
    info.innerHTML = `Showing <strong id="results-count">${_filtered.length}</strong> items`;
  }

  /* ────────────────────────────────────────────────────────
     MAIN INIT
  ─────────────────────────────────────────────────────── */

  async function main() {
    // Show mobile filter button
    if (window.innerWidth < 1024) FILTERS.showFilterButton();
    window.addEventListener('resize', () => {
      if (window.innerWidth < 1024) FILTERS.showFilterButton();
    });

    // Mobile: search button scrolls to search input
    document.getElementById('mobile-search-btn')?.addEventListener('click', () => {
      const inp = document.getElementById('menu-search');
      if (inp) { inp.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => inp.focus(), 400); }
    });

    // Init controls and register change callback
    FILTERS.initControls();
    FILTERS.onChange(() => _applyAndRender());

    // Init modal events
    _initModalEvents();

    // Init search
    _initSearch();

    // Init infinite scroll / load more
    _initInfiniteScroll();

    // Fetch data
    const loading = document.getElementById('products-loading');
    try {
      const data = await API.fetchAllData();
      _allProducts = data.products  || [];
      _addons      = data.addons    || [];
      _categories  = data.categories || [];
    } catch (err) {
      console.error('[WOW BAKES] Menu page data error:', err);
      _allProducts = [];
    }

    // Build category tabs
    _buildCategoryTabs(_categories, _allProducts);

    // Handle URL params (?category=...)
    _handleUrlParams();

    // Initial filter + render
    _filtered = FILTERS.apply(_allProducts, _searchQuery);

    if (loading) loading.hidden = true;
    _renderGrid(true);

    // Init card clicks AFTER first render
    _initCardClicks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

})();
