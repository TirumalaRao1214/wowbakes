/**
 * WOW BAKES — Filters Module
 *
 * Manages filter state for menu.html.
 * Syncs desktop sidebar and mobile bottom sheet filters.
 * Exposes global FILTERS object.
 */

const FILTERS = (() => {

  const _state = {
    category:      'all',
    vegOnly:       false,
    jainOnly:      false,
    spicyOnly:     false,
    availableOnly: false,
    minPrice:      0,
    maxPrice:      Infinity,
  };

  let _onChangeCallback = null;

  /* ── Register change callback ───────────────────────────── */
  function onChange(cb) {
    _onChangeCallback = cb;
  }

  function _notify() {
    if (_onChangeCallback) _onChangeCallback({ ..._state });
    _updateFilterCountBadge();
  }

  /* ── Sync mobile ↔ desktop filter controls ──────────────── */
  function _syncControls() {
    // Toggle switches
    const pairs = [
      ['filter-veg',       'm-filter-veg',       'vegOnly'],
      ['filter-jain',      'm-filter-jain',       'jainOnly'],
      ['filter-spicy',     'm-filter-spicy',      'spicyOnly'],
      ['filter-available', 'm-filter-available',  'availableOnly'],
    ];

    pairs.forEach(([desktopId, mobileId, key]) => {
      const desk = document.getElementById(desktopId);
      const mob  = document.getElementById(mobileId);
      if (desk) desk.checked = _state[key];
      if (mob)  mob.checked  = _state[key];
    });

    // Price fields
    ['price-min', 'm-price-min'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = _state.minPrice > 0 ? _state.minPrice : '';
    });
    ['price-max', 'm-price-max'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = _state.maxPrice < Infinity ? _state.maxPrice : '';
    });
  }

  /* ── Update filter count badge on the filter toggle button ─ */
  function _updateFilterCountBadge() {
    let active = 0;
    if (_state.vegOnly)       active++;
    if (_state.jainOnly)      active++;
    if (_state.spicyOnly)     active++;
    if (_state.availableOnly) active++;
    if (_state.minPrice > 0)  active++;
    if (_state.maxPrice < Infinity) active++;

    const badge = document.getElementById('filter-count');
    const toggleBtn = document.getElementById('filter-toggle-btn');

    if (badge) {
      badge.textContent = active;
      badge.hidden = active === 0;
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('has-filters', active > 0);
    }
  }

  /* ── Read values from a pair of filter controls ─────────── */
  function _readFromControls(prefix) {
    const p = prefix ? `${prefix}-` : '';
    const vegEl       = document.getElementById(`${p}filter-veg`);
    const jainEl      = document.getElementById(`${p}filter-jain`);
    const spicyEl     = document.getElementById(`${p}filter-spicy`);
    const availEl     = document.getElementById(`${p}filter-available`);
    const minEl       = document.getElementById(`${p}price-min`);
    const maxEl       = document.getElementById(`${p}price-max`);

    if (vegEl)   _state.vegOnly       = vegEl.checked;
    if (jainEl)  _state.jainOnly      = jainEl.checked;
    if (spicyEl) _state.spicyOnly     = spicyEl.checked;
    if (availEl) _state.availableOnly = availEl.checked;
    if (minEl)   _state.minPrice      = minEl.value ? parseInt(minEl.value, 10) : 0;
    if (maxEl)   _state.maxPrice      = maxEl.value ? parseInt(maxEl.value, 10) : Infinity;
  }

  /* ── Set category ─────────────────────────────────────────── */
  function setCategory(cat) {
    _state.category = cat || 'all';
    _notify();
  }

  function getCategory() {
    return _state.category;
  }

  /* ── Clear all filters ────────────────────────────────────── */
  function clearAll() {
    _state.category      = 'all';
    _state.vegOnly       = false;
    _state.jainOnly      = false;
    _state.spicyOnly     = false;
    _state.availableOnly = false;
    _state.minPrice      = 0;
    _state.maxPrice      = Infinity;
    _syncControls();
    _notify();
  }

  /* ── Apply: apply current filter state to product array ────── */
  function apply(products, searchQuery = '') {
    let result = products;

    // Category
    if (_state.category && _state.category !== 'all') {
      result = result.filter(p => p.category === _state.category);
    }

    // Search
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.subCategory || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Dietary
    if (_state.jainOnly)   result = result.filter(p => p.jainAvailable);
    if (_state.spicyOnly)  result = result.filter(p => p.spicyLevel > 0);

    // Availability
    if (_state.availableOnly) result = result.filter(p => p.available !== false);

    // Price range (check against minimum variant price)
    if (_state.minPrice > 0 || _state.maxPrice < Infinity) {
      result = result.filter(p => {
        const prices = p.variants && p.variants.length > 0
          ? p.variants.map(v => v.price)
          : [p.price];
        const minP = Math.min(...prices);
        return minP >= _state.minPrice && minP <= _state.maxPrice;
      });
    }

    return result;
  }

  /* ── Count active filters ────────────────────────────────── */
  function countActive() {
    let n = 0;
    if (_state.vegOnly)       n++;
    if (_state.jainOnly)      n++;
    if (_state.spicyOnly)     n++;
    if (_state.availableOnly) n++;
    if (_state.minPrice > 0)  n++;
    if (_state.maxPrice < Infinity) n++;
    return n;
  }

  /* ── Init controls ─────────────────────────────────────────── */
  function initControls() {
    // Desktop apply
    document.getElementById('apply-filters-btn')?.addEventListener('click', () => {
      _readFromControls('');   // desktop IDs have no prefix: filter-veg, price-min…
      _syncControls();
      _notify();
    });

    // Desktop clear
    document.getElementById('clear-filters-btn')?.addEventListener('click', clearAll);

    // Mobile apply
    document.getElementById('m-apply-filters-btn')?.addEventListener('click', () => {
      _readFromControls('m'); // mobile IDs have "m-" prefix: m-filter-veg, m-price-min…
      _syncControls();
      closeFilterSheet();
      _notify();
    });

    // Mobile clear
    document.getElementById('m-clear-filters-btn')?.addEventListener('click', clearAll);

    // "Clear all" button in no-results state
    document.getElementById('clear-all-btn')?.addEventListener('click', clearAll);

    // Refresh menu button
    document.getElementById('refresh-menu-btn')?.addEventListener('click', () => {
      API.clearCache();
      window.location.reload();
    });

    // Toggle switches — instant apply on desktop sidebar
    ['filter-veg','filter-jain','filter-spicy','filter-available'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        _readFromControls('');
        _notify();
      });
    });

    // Mobile filter open/close
    document.getElementById('filter-toggle-btn')?.addEventListener('click', openFilterSheet);
    document.getElementById('filter-sheet-close')?.addEventListener('click', closeFilterSheet);
    document.getElementById('filter-backdrop')?.addEventListener('click', closeFilterSheet);
  }

  /* ── Mobile filter sheet open/close ─────────────────────── */
  function openFilterSheet() {
    const sheet = document.getElementById('filter-bottom-sheet');
    const backdrop = document.getElementById('filter-backdrop');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    if (!sheet) return;
    _syncControls();
    sheet.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add('open');
      if (backdrop) {
        backdrop.classList.add('open');
        backdrop.removeAttribute('aria-hidden');
      }
    });
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeFilterSheet() {
    const sheet = document.getElementById('filter-bottom-sheet');
    const backdrop = document.getElementById('filter-backdrop');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    if (!sheet) return;
    sheet.classList.remove('open');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { sheet.hidden = true; }, 400);
  }

  /* ── Show filter button on mobile ───────────────────────── */
  function showFilterButton() {
    const btn = document.getElementById('filter-toggle-btn');
    if (btn) btn.style.display = '';
  }

  return {
    onChange,
    setCategory,
    getCategory,
    clearAll,
    apply,
    countActive,
    initControls,
    openFilterSheet,
    closeFilterSheet,
    showFilterButton,
  };
})();

window.FILTERS = FILTERS;
