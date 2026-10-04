# WOW BAKES — Website Setup Guide

A production-ready, mobile-first food ordering website for **WOW BAKES** café/restaurant.  
Static HTML/CSS/JS — deployable on Render, Netlify, or GitHub Pages with zero backend.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Technology Stack](#2-technology-stack)
3. [Quick Start (Local Testing)](#3-quick-start-local-testing)
4. [Google Sheets Setup](#4-google-sheets-setup)
5. [Google Apps Script Deployment](#5-google-apps-script-deployment)
6. [Connect Website to Google Sheets](#6-connect-website-to-google-sheets)
7. [How to Manage Products](#7-how-to-manage-products)
8. [How to Manage Categories & Add-Ons](#8-how-to-manage-categories--add-ons)
9. [How to Change WhatsApp Number](#9-how-to-change-whatsapp-number)
10. [Deploy on Render](#10-deploy-on-render)
11. [Deploy on Netlify](#11-deploy-on-netlify)
12. [Customising the Brand](#12-customising-the-brand)
13. [Cache & Refresh](#13-cache--refresh)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Project Structure

```
wow-bakes/
├── index.html                  ← Homepage
├── menu.html                   ← Full menu catalog
├── cart.html                   ← Cart & WhatsApp checkout
├── css/
│   ├── style.css               ← Design system, layout, typography
│   ├── components.css          ← Buttons, cards, modals, forms
│   └── responsive.css          ← All breakpoint overrides
├── js/
│   ├── config.js               ← ★ ALL business config lives here
│   ├── api.js                  ← Google Sheets fetch, caching, fallback
│   ├── cart.js                 ← Cart state + shared utilities
│   ├── app.js                  ← Homepage logic
│   ├── products.js             ← Menu catalog + product modal
│   ├── filters.js              ← Category, dietary, price filters
│   └── whatsapp.js             ← Cart page + WhatsApp ordering
├── assets/
│   ├── logo/favicon.svg        ← Brand favicon
│   ├── icons/                  ← SVG icons
│   └── products/               ← Local product images (optional)
├── data/
│   └── sample-products.json    ← Development fallback data
└── google-apps-script/
    └── Code.gs                 ← Complete Apps Script backend
```

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Google Fonts (Playfair Display + DM Sans) |
| Data | Google Sheets |
| Backend | Google Apps Script (Web App) |
| Ordering | WhatsApp (wa.me link) |
| Hosting | Render / Netlify / GitHub Pages |
| Storage | Browser localStorage (cart persistence) |

**No React. No Node.js. No database server. No Firebase. No Bootstrap.**

---

## 3. Quick Start (Local Testing)

### Option A: Python HTTP Server (recommended)

```bash
cd wow-bakes
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

### Option B: VS Code Live Server

Install the "Live Server" extension → right-click `index.html` → "Open with Live Server".

### Dev Mode (uses local JSON, no API needed)

`js/config.js` has `DEV_MODE: true` by default.  
This loads `data/sample-products.json` directly — no internet or API needed.

**To switch to live Google Sheets data**, set `DEV_MODE: false` and configure `API_URL`.

---

## 4. Google Sheets Setup

### Step 1: Create a New Google Sheet

Go to [sheets.google.com](https://sheets.google.com) → **+ New spreadsheet**.

Name it: `WOW BAKES Menu`

### Step 2: Create Three Sheets (tabs)

Right-click the Sheet1 tab → Rename to `Products`  
Add two more: `AddOns` and `Categories`

---

### Sheet 1: Products

**Row 1 (headers — exact spelling matters):**

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ProductID | ProductName | Category | SubCategory | Description | Price | OfferPrice | VariantType | VariantName | JainAvailable | SpicyLevel | Available | Featured | ImageURL | DisplayOrder |

**Sample data rows:**

| ProductID | ProductName | Category | SubCategory | Description | Price | OfferPrice | VariantType | VariantName | JainAvailable | SpicyLevel | Available | Featured | ImageURL | DisplayOrder |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B001 | Veggie Burger | Burgers | Classic Burgers | Classic veggie burger | 129 | | Single | Regular | YES | 0 | YES | YES | https://... | 1 |
| P001 | Margherita Pizza | Pizza | Classic | Classic mozzarella pizza | 179 | | Size | Regular (7") | YES | 0 | YES | NO | https://... | 9 |
| P001 | Margherita Pizza | Pizza | Classic | Classic mozzarella pizza | 249 | | Size | Medium (9") | YES | 0 | YES | NO | https://... | 9 |
| M001 | Veg Fried Momos | Momos | Veg Momos | Veg momos 6 pcs | 149 | | Preparation | Steamed | NO | 1 | YES | YES | https://... | 65 |
| M001 | Veg Fried Momos | Momos | Veg Momos | Veg momos 6 pcs | 159 | | Preparation | Fried | NO | 1 | YES | YES | https://... | 65 |

> **Multi-variant products** (like Momos): repeat the same ProductID on two rows.  
> The script groups them into one product with a `variants` array.

**Field reference:**

| Field | Values | Description |
|---|---|---|
| JainAvailable | YES / NO | Shows 🌱 Jain badge |
| SpicyLevel | 0 / 1 / 2 | 0=none, 1=mild🌶, 2=spicy🌶 |
| Available | YES / NO | NO shows "Out of Stock" |
| Featured | YES / NO | YES shows on homepage "Popular Today" |
| OfferPrice | number or blank | Strikethrough original if set |

---

### Sheet 2: AddOns

| A | B | C | D | E |
|---|---|---|---|---|
| AddOnID | Category | AddOnName | Price | Available |

**Sample data:**

| AddOnID | Category | AddOnName | Price | Available |
|---|---|---|---|---|
| ao-001 | Burgers | Extra Cheese | 30 | YES |
| ao-002 | Pizza | Regular Veggies | 20 | YES |
| ao-003 | Pizza | Extra Veggies | 30 | YES |
| ao-004 | Pizza | Extra Cheese | 40 | YES |
| ao-005 | Pasta | Garlic Bread - 2 Pcs | 49 | YES |

> Add-ons are shown in the product modal for items whose **Category** matches.

---

### Sheet 3: Categories

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| CategoryID | CategoryName | Emoji | ImageURL | DisplayOrder | Active |

**Sample data:**

| CategoryID | CategoryName | Emoji | ImageURL | DisplayOrder | Active |
|---|---|---|---|---|---|
| cat-01 | Burgers | 🍔 | https://images.unsplash.com/... | 1 | YES |
| cat-02 | Pizza | 🍕 | https://images.unsplash.com/... | 2 | YES |
| cat-03 | Pasta | 🍝 | https://images.unsplash.com/... | 3 | YES |
| cat-04 | Nachos | 🫙 | https://... | 4 | YES |
| cat-05 | Fries & Garlic Bread | 🍟 | https://... | 5 | YES |
| cat-06 | Between the Breads | 🥪 | https://... | 6 | YES |
| cat-07 | Starters | 🥗 | https://... | 7 | YES |
| cat-08 | Momos | 🥟 | https://... | 8 | YES |
| cat-09 | Main Course | 🍛 | https://... | 9 | YES |
| cat-10 | Milkshakes | 🥛 | https://... | 10 | YES |
| cat-11 | Thickshakes | 🧋 | https://... | 11 | YES |

---

## 5. Google Apps Script Deployment

### Step 1: Open Apps Script

In your Google Sheet → **Extensions → Apps Script**

### Step 2: Replace the Code

Delete all existing code in the editor.  
Copy and paste the entire contents of `google-apps-script/Code.gs`.

### Step 3: Set Your Spreadsheet ID

Find your Google Sheet's ID in its URL:

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit
```

Replace in the script:

```javascript
var SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID';  // ← Paste your ID here
```

### Step 4: Test the Script

Click **Run → testApi**.  
If it works, the Logger will show product/category/addon counts.

### Step 5: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon → **Web app**
3. Set:
   - **Description:** WOW BAKES Menu API
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/XXXX/exec`)

> **Important:** Each time you edit `Code.gs`, you must create a **New deployment** (or **Manage deployments → edit**) and get the new URL. Old URLs keep serving old code.

---

## 6. Connect Website to Google Sheets

Open `js/config.js` and make two changes:

```javascript
const CONFIG = {
  // 1. Paste your Apps Script Web App URL
  API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

  // 2. Set DEV_MODE to false for production
  DEV_MODE: false,

  // ... rest stays the same
};
```

Save the file. The website will now fetch live data from Google Sheets.

---

## 7. How to Manage Products

### Add a New Product

Add a new row in the **Products** sheet with all columns filled.

### Change a Price

Find the product row in the Products sheet → update the **Price** column.  
The website reflects the change within 5 minutes (cache duration).

### Mark a Product Out of Stock

Find the product → change **Available** column from `YES` to `NO`.  
The product will show "Out of Stock" badge and the Add button disappears.

### Mark a Product as Featured (Homepage)

Change the **Featured** column to `YES`.  
The product will appear in "Popular Today" on the homepage.

### Add a New Variant (e.g., size)

For a product like Pizza that has Regular and Medium:

- Add a second row with the **same ProductID**
- Different VariantName (e.g., "Medium (9\")")
- Different Price

### Add Product Images

**Option A: Google Drive (recommended)**

1. Upload image to Google Drive
2. Right-click → Get link → Change to "Anyone with the link can view"
3. Copy the link: `https://drive.google.com/file/d/FILE_ID/view`
4. Convert to direct image URL: `https://drive.google.com/uc?export=view&id=FILE_ID`
5. Paste in the **ImageURL** column

**Option B: Any public image URL**

Paste any publicly accessible image URL directly (e.g., Unsplash, Cloudinary, etc.)

---

## 8. How to Manage Categories & Add-Ons

### Add a New Category

Add a row in the **Categories** sheet.  
Set **Active** to `YES`.  
Set a **DisplayOrder** number for sorting.

### Hide a Category

Change **Active** to `NO` — it won't appear on the website.

### Add an Add-On

Add a row in the **AddOns** sheet.  
Set **Category** to match exactly the product category name (e.g., `Pizza`).

### Disable an Add-On

Change **Available** to `NO`.

---

## 9. How to Change WhatsApp Number

Open `js/config.js`:

```javascript
WHATSAPP_NUMBER: '91XXXXXXXXXX',
```

Format rules:
- Country code + number
- No `+`, no spaces, no dashes
- India example: `919876543210` (for +91 9876543210)

---

## 10. Deploy on Render

### Step 1: Push to GitHub

```bash
cd wow-bakes
git init
git add .
git commit -m "Initial WOW BAKES website"
git remote add origin https://github.com/YOUR_USERNAME/wow-bakes.git
git push -u origin main
```

### Step 2: Create Render Static Site

1. Go to [render.com](https://render.com) → **New → Static Site**
2. Connect your GitHub repository
3. Settings:
   - **Name:** wow-bakes
   - **Branch:** main
   - **Root Directory:** (leave blank, or `wow-bakes` if in a subdirectory)
   - **Build Command:** (leave blank — no build needed)
   - **Publish Directory:** `.` (or `wow-bakes`)
4. Click **Create Static Site**

Your website is live in ~2 minutes!

### Step 3: Custom Domain (optional)

Render Dashboard → Your site → **Settings → Custom Domains** → Add your domain.

---

## 11. Deploy on Netlify

### Option A: Netlify Drop (instant, no account needed)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the `wow-bakes/` folder
3. Done — site is live!

### Option B: GitHub + Netlify (auto-deploy on push)

1. Push to GitHub (see Step 1 above)
2. [app.netlify.com](https://app.netlify.com) → **New site from Git**
3. Connect GitHub → select repository
4. Build settings: leave blank (no build step)
5. Deploy

---

## 12. Customising the Brand

All brand configuration is in `js/config.js`:

```javascript
const CONFIG = {
  BUSINESS_NAME:    'WOW BAKES',
  BUSINESS_TAGLINE: 'Freshly Baked. Deliciously Made.',
  BUSINESS_ADDRESS: 'Your full address here',
  BUSINESS_PHONE:   '+91 XXXX-XXXXXX',
  BUSINESS_EMAIL:   'info@wowbakes.in',
  INSTAGRAM_URL:    'https://instagram.com/wowbakes',
  OPENING_HOURS:    'Mon – Sun: 10:00 AM – 10:30 PM',
  DELIVERY_ENABLED: true,
  DELIVERY_CHARGE:  40,
  FREE_DELIVERY_ABOVE: 499,
  CURRENCY:         '₹',
};
```

### Change Brand Colors

Open `css/style.css` → `:root` section:

```css
:root {
  --burnt-orange:  #C75B2A;  /* Main brand color */
  --cream:         #FDF6EE;  /* Background */
  --brown-deep:    #2C1810;  /* Dark text */
  /* ... */
}
```

---

## 13. Cache & Refresh

The website caches API responses in localStorage for **5 minutes** (configurable in `config.js`).

```javascript
CACHE_DURATION: 5 * 60 * 1000,  // 5 minutes
```

### Force Refresh

On the Menu page, click the **"Refresh Menu"** button (top right of the toolbar).  
This clears the cache and re-fetches from Google Sheets immediately.

### Programmatic cache clear

Open browser console → type:

```javascript
API.clearCache(); location.reload();
```

---

## 14. Troubleshooting

### Menu not loading

1. Check `js/config.js` → Is `DEV_MODE: false` and `API_URL` set correctly?
2. Open browser console (F12) → check for errors
3. Visit the Apps Script URL directly in browser — you should see JSON

### "Menu temporarily unavailable"

- The API fetch failed. Check your Google Apps Script deployment.
- Verify the script has "Anyone" access in deployment settings.

### WhatsApp button not working

- Check `WHATSAPP_NUMBER` in `js/config.js`
- Format: `91XXXXXXXXXX` (no `+`, no spaces)

### Product images not showing

- Check the ImageURL in Google Sheets is a direct image URL (not a sharing page)
- Google Drive: use `https://drive.google.com/uc?export=view&id=FILE_ID`

### Changes in Google Sheets not reflecting

- Wait 5 minutes for cache to expire, OR
- Click "Refresh Menu" on the menu page, OR
- Clear localStorage: `API.clearCache()` in browser console

### Cart is empty after refresh

- Cart uses localStorage. If you're in private/incognito mode, localStorage is cleared on session end.

---

## Sample Google Sheet Data

The file `data/sample-products.json` contains the complete WOW BAKES menu with all 97 products across 11 categories. Copy this data into your Google Sheet to get started quickly.

---

## Contact & Support

This website was built as a reusable template. The entire product catalog, pricing, and availability is managed through Google Sheets — no code editing required for day-to-day operations.

**To reuse this template for another business:**

1. Copy the `wow-bakes/` folder
2. Update `js/config.js` with the new business details
3. Set up a new Google Sheet with the same column structure
4. Deploy new Google Apps Script
5. Update `API_URL` and `WHATSAPP_NUMBER`

---

*WOW BAKES Website — Built with ❤️*
