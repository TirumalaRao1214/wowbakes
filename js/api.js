/**
 * WOW BAKES — API Layer
 *
 * Handles data fetching from Google Apps Script, localStorage caching,
 * and fallback to local sample JSON in DEV_MODE.
 */

const API = (() => {
  const CACHE_KEY = 'wow_bakes_menu_cache';
  const CACHE_TS_KEY = 'wow_bakes_menu_cache_ts';

  /* ── Internal helpers ─────────────────────────────────────── */

  function _isCacheFresh() {
    const ts = localStorage.getItem(CACHE_TS_KEY);
    if (!ts) return false;
    return (Date.now() - parseInt(ts, 10)) < CONFIG.CACHE_DURATION;
  }

  function _readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function _writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
    } catch {
      // Quota exceeded or private browsing — fail silently
    }
  }

  function _showErrorBanner(msg) {
    const banner = document.getElementById('api-error-banner');
    const msgEl  = document.getElementById('api-error-message');
    if (banner) {
      if (msgEl) msgEl.textContent = msg;
      banner.hidden = false;
    }
  }

  function _hideErrorBanner() {
    const banner = document.getElementById('api-error-banner');
    if (banner) banner.hidden = true;
  }

  function isApiConfigured() {
    return CONFIG.API_URL &&
           CONFIG.API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL' &&
           CONFIG.API_URL.startsWith('https://');
  }

  /* ── Fetch from Apps Script ───────────────────────────────── */

  async function _fetchFromApi(action = 'all') {
    const url = `${CONFIG.API_URL}?action=${action}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  /* ── Fetch local fallback JSON ────────────────────────────── */

  async function _fetchLocalFallback() {
    // If running from file:// (opened directly in browser), fetch() is blocked
    // by same-origin policy. Use inline SAMPLE_DATA from js/data.js instead.
    if (window.location.protocol === 'file:' || window.SAMPLE_DATA) {
      if (window.SAMPLE_DATA) return window.SAMPLE_DATA;
      throw new Error('SAMPLE_DATA not loaded. Ensure js/data.js is included before api.js');
    }
    const response = await fetch('data/sample-products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load local sample data');
    return response.json();
  }

  /* ── Public: fetchAllData ─────────────────────────────────── */

  async function fetchAllData() {
    // 1. Try cache first
    if (_isCacheFresh()) {
      const cached = _readCache();
      if (cached) {
        _hideErrorBanner();
        return cached;
      }
    }

    // 2. DEV_MODE → use local JSON
    if (CONFIG.DEV_MODE) {
      try {
        const data = await _fetchLocalFallback();
        _writeCache(data);
        _hideErrorBanner();
        return data;
      } catch (err) {
        console.warn('[WOW BAKES] Could not load local sample data:', err.message);
        _showErrorBanner('Menu data unavailable. Please check data/sample-products.json');
        return { products: [], categories: [], addons: [] };
      }
    }

    // 3. Live API
    if (!isApiConfigured()) {
      console.warn('[WOW BAKES] API_URL not configured. Set DEV_MODE:true or configure API_URL in config.js');
      _showErrorBanner('Menu configuration incomplete. Contact the site admin.');
      return { products: [], categories: [], addons: [] };
    }

    try {
      const data = await _fetchFromApi('all');
      _writeCache(data);
      _hideErrorBanner();
      return data;
    } catch (err) {
      console.error('[WOW BAKES] API fetch failed:', err.message);

      // Try stale cache before showing error
      const stale = _readCache();
      if (stale) {
        console.warn('[WOW BAKES] Using stale cache due to API failure');
        _showErrorBanner('Menu may not be up to date. Tap to refresh.');
        return stale;
      }

      _showErrorBanner('Menu temporarily unavailable. Please try again later.');
      return { products: [], categories: [], addons: [] };
    }
  }

  /* ── Public: clearCache ───────────────────────────────────── */

  function clearCache() {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TS_KEY);
  }

  /* ── Public: fetchProducts (convenience) ─────────────────── */

  async function fetchProducts() {
    const { products = [] } = await fetchAllData();
    return products;
  }

  async function fetchCategories() {
    const { categories = [] } = await fetchAllData();
    return categories;
  }

  async function fetchAddOns() {
    const { addons = [] } = await fetchAllData();
    return addons;
  }

  return {
    fetchAllData,
    fetchProducts,
    fetchCategories,
    fetchAddOns,
    clearCache,
    isApiConfigured,
  };
})();

window.API = API;
