/**
 * WOW BAKES — Central Configuration
 *
 * This file is the single source of truth for all business configuration.
 * Update these values to customize the website for any business.
 * Never scatter configuration throughout the project.
 */

const CONFIG = {
  // ── Google Sheets API ──────────────────────────────────────────────
  // Replace with your deployed Google Apps Script Web App URL
  API_URL: 'https://script.google.com/macros/s/AKfycbxXGxpey_1tEQtJKnqLKUbh-mAxRKjplvfU0-GSMup0WtO25RbX1H7Tt9WKqw_AmWtXbQ/exec',

  // ── WhatsApp ───────────────────────────────────────────────────────
  // Format: country code + number, no spaces, no +, no dashes
  // Example: "919876543210" for India +91 9876543210
  WHATSAPP_NUMBER: '919966864859',

  // ── Business Information ───────────────────────────────────────────
  BUSINESS_NAME:    'WOW BAKES',
  BUSINESS_TAGLINE: 'Freshly Baked. Deliciously Made.',
  BUSINESS_ADDRESS: '9/1, D.no. 6-9-18, Arundelpet, Opp. IndusInd Bank, Guntur - 522004, Andhra Pradesh',
  BUSINESS_PHONE:   '+91 99668 64859',
  BUSINESS_EMAIL:   'info@wowbakes.in',

  // ── Social Media ───────────────────────────────────────────────────
  INSTAGRAM_URL:    'https://www.instagram.com/wowbakes_guntur/',
  FACEBOOK_URL:     '',
  GOOGLE_MAPS_URL:  'https://maps.google.com/?q=WOW+BAKES+Arundelpet+Guntur',

  // ── Hours ──────────────────────────────────────────────────────────
  OPENING_HOURS:    'Mon – Sun: 10:00 AM – 10:30 PM',

  // ── Features ──────────────────────────────────────────────────────
  DELIVERY_ENABLED: true,
  DELIVERY_CHARGE:  40,     // ₹ flat delivery charge
  FREE_DELIVERY_ABOVE: 499, // Free delivery above this amount (0 = always charge)
  CURRENCY:         '₹',

  // ── Performance ───────────────────────────────────────────────────
  CACHE_DURATION:   0,               // 0 = always fetch fresh from Google Sheets (immediate updates)
  PRODUCTS_PER_PAGE: 24,             // Cards per batch in product grid

  // ── Development ───────────────────────────────────────────────────
  // Set to true to use local data/sample-products.json instead of live API.
  // Always false in production.
  DEV_MODE: false,
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
