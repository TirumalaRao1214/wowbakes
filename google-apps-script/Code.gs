/**
 * WOW BAKES — Google Apps Script API
 * File: Code.gs
 *
 * Deploy as a Google Apps Script Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Endpoints:
 *   ?action=products    → Returns all products (grouped by ProductID)
 *   ?action=categories  → Returns all active categories
 *   ?action=addons      → Returns all available add-ons
 *   ?action=all         → Returns { products, categories, addons }
 *
 * Google Sheets required:
 *   Sheet 1: "Products"   (see column definitions below)
 *   Sheet 2: "AddOns"     (see column definitions below)
 *   Sheet 3: "Categories" (see column definitions below)
 */

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// IMPORTANT: This file lives inside Google Apps Script, NOT the public website.
// The SPREADSHEET_ID below is used only server-side. It is never sent to the
// browser. The public API URL (in js/config.js) is separate and read-only.
//
// NOTE: If this Code.gs file is committed to a public git repository,
// rotate the Google Sheet ID (File → Share → Change) and update here.
// ──────────────────────────────────────────────────────────────────────────────

var SPREADSHEET_ID = '13fNPq1la__RRQpeYWmq1BQ6uSmVKArMOYQRUU-A5d6o';

var SHEETS = {
  PRODUCTS:   'Products',
  ADDONS:     'AddOns',
  CATEGORIES: 'Categories',
};


// ──────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Handles all HTTP GET requests.
 * Returns JSON with CORS headers so the website can fetch it from any domain.
 */
function doGet(e) {
  // Only allow the four known read-only actions — reject everything else
  var ALLOWED_ACTIONS = { products: true, categories: true, addons: true, all: true };
  var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action) : 'all';

  if (!ALLOWED_ACTIONS[action]) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid request' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var result;
  try {
    if      (action === 'products')    result = { products:   getProducts() };
    else if (action === 'categories')  result = { categories: getCategories() };
    else if (action === 'addons')      result = { addons:     getAddOns() };
    else {
      result = {
        products:   getProducts(),
        categories: getCategories(),
        addons:     getAddOns(),
      };
    }
  } catch (err) {
    // Log full error internally — NEVER expose stack traces or internals to the client
    Logger.log('WOW BAKES API Error: ' + err.message + '\n' + err.stack);
    result = { error: 'Menu data temporarily unavailable. Please try again later.' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}


// ──────────────────────────────────────────────────────────────────────────────
// PRODUCTS
//
// Sheet columns (row 1 = headers):
//   A: ProductID
//   B: ProductName
//   C: Category
//   D: SubCategory
//   E: Description
//   F: Price
//   G: OfferPrice
//   H: VariantType
//   I: VariantName
//   J: JainAvailable   (YES / NO)
//   K: SpicyLevel      (0 / 1 / 2)
//   L: Available       (YES / NO)
//   M: Featured        (YES / NO)
//   N: ImageURL
//   O: DisplayOrder
//
// Multi-variant products:
//   Repeat the ProductID on multiple rows with different VariantName & Price.
//   The script groups them into a "variants" array.
// ──────────────────────────────────────────────────────────────────────────────

function getProducts() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) throw new Error('Sheet "' + SHEETS.PRODUCTS + '" not found');

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0].map(function(h) { return String(h).trim(); });

  // Map header → column index
  function col(name) { return headers.indexOf(name); }

  var grouped = {};  // keyed by ProductID
  var order   = [];  // track insertion order

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Skip completely blank rows
    var rowText = row.join('').replace(/\s/g, '');
    if (!rowText) continue;

    var productId = String(row[col('ProductID')] || '').trim();
    if (!productId) continue;

    var variantName = String(row[col('VariantName')] || 'Regular').trim();
    var price       = _toNum(row[col('Price')]);
    var offerPrice  = _toNum(row[col('OfferPrice')]);

    if (grouped[productId]) {
      // Add variant to existing product
      grouped[productId].variants.push({
        name:  variantName,
        price: price,
      });
      // Update base price to the lowest variant price
      grouped[productId].price = Math.min(
        grouped[productId].price,
        price
      );
    } else {
      // New product
      order.push(productId);
      grouped[productId] = {
        id:           productId,
        name:         String(row[col('ProductName')] || '').trim(),
        category:     String(row[col('Category')]    || '').trim(),
        subCategory:  String(row[col('SubCategory')] || '').trim(),
        description:  String(row[col('Description')] || '').trim(),
        price:        price,
        offerPrice:   offerPrice || null,
        variants: [{
          name:  variantName,
          price: price,
        }],
        jainAvailable: _toBoolean(row[col('JainAvailable')]),
        spicyLevel:    _toNum(row[col('SpicyLevel')]),
        available:     _toBoolean(row[col('Available')]),
        featured:      _toBoolean(row[col('Featured')]),
        imageURL:      String(row[col('ImageURL')]    || '').trim(),
        displayOrder:  _toNum(row[col('DisplayOrder')]),
      };
    }
  }

  // Return in insertion order, sorted by displayOrder
  var products = order.map(function(id) { return grouped[id]; });
  products.sort(function(a, b) { return (a.displayOrder || 9999) - (b.displayOrder || 9999); });
  return products;
}


// ──────────────────────────────────────────────────────────────────────────────
// ADD-ONS
//
// Sheet columns:
//   A: AddOnID
//   B: Category
//   C: AddOnName
//   D: Price
//   E: Available  (YES / NO)
// ──────────────────────────────────────────────────────────────────────────────

function getAddOns() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.ADDONS);
  if (!sheet) return [];  // AddOns sheet is optional

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var addons = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row.join('').replace(/\s/g, '') === '') continue; // skip blank

    var id   = String(row[0] || '').trim();
    var name = String(row[2] || '').trim();
    if (!id || !name) continue;

    addons.push({
      id:        id,
      category:  String(row[1] || '').trim(),
      name:      name,
      price:     _toNum(row[3]),
      available: _toBoolean(row[4]),
    });
  }

  return addons;
}


// ──────────────────────────────────────────────────────────────────────────────
// CATEGORIES
//
// Sheet columns:
//   A: CategoryID
//   B: CategoryName
//   C: Emoji
//   D: ImageURL
//   E: DisplayOrder
//   F: Active  (YES / NO)
// ──────────────────────────────────────────────────────────────────────────────

function getCategories() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.CATEGORIES);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var categories = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row.join('').replace(/\s/g, '') === '') continue; // skip blank

    var id   = String(row[0] || '').trim();
    var name = String(row[1] || '').trim();
    if (!id || !name) continue;

    var active = _toBoolean(row[5]);
    if (!active) continue;  // only return active categories

    categories.push({
      id:           id,
      name:         name,
      emoji:        String(row[2] || '').trim(),
      imageURL:     String(row[3] || '').trim(),
      displayOrder: _toNum(row[4]),
      active:       true,
    });
  }

  categories.sort(function(a, b) {
    return (a.displayOrder || 9999) - (b.displayOrder || 9999);
  });

  return categories;
}


// ──────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Converts a cell value to a number.
 * Returns 0 if the value is empty or not a valid number.
 */
function _toNum(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

/**
 * Converts YES/NO (or 1/0, TRUE/FALSE, true/false) to boolean.
 * Default is false for any unrecognised value.
 */
function _toBoolean(val) {
  if (val === true || val === 1) return true;
  var str = String(val).trim().toUpperCase();
  return str === 'YES' || str === 'TRUE' || str === '1';
}


// ──────────────────────────────────────────────────────────────────────────────
// TESTING — Run this function manually to test from the Apps Script editor
// ──────────────────────────────────────────────────────────────────────────────

function testApi() {
  var result = {
    products:   getProducts(),
    categories: getCategories(),
    addons:     getAddOns(),
  };
  Logger.log('Products: ' + result.products.length);
  Logger.log('Categories: ' + result.categories.length);
  Logger.log('AddOns: ' + result.addons.length);
  Logger.log(JSON.stringify(result.products.slice(0, 2), null, 2));
}
