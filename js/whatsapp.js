/**
 * WOW BAKES — WhatsApp Ordering Module
 *
 * Handles the cart page: renders cart items, handles quantity
 * changes, customer form validation, and WhatsApp message generation.
 * Runs only on cart.html.
 */

(function initCartPage() {

  /* ── DOM References ─────────────────────────────────────── */
  const emptyState   = document.getElementById('empty-cart');
  const cartContent  = document.getElementById('cart-content');
  const itemsList    = document.getElementById('cart-items-list');
  const orderType    = () => document.querySelector('input[name="order-type"]:checked')?.value || 'pickup';

  /* ── Render a cart item row ──────────────────────────────── */
  function _renderCartItem(item) {
    const addOnTotal = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
    const linePrice  = (item.price + addOnTotal) * item.quantity;

    const addOnText = item.addOns && item.addOns.length > 0
      ? `<div class="cart-item-addons">+ ${item.addOns.map(a => a.name).join(', ')}</div>`
      : '';

    const variantText = item.variantName
      ? `<div class="cart-item-variant">${item.variantName}</div>`
      : '';

    const imgSrc = item.image
      || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop&q=80';

    return `
      <div
        class="cart-item"
        data-id="${item.id}"
        data-variant="${item.variantName || ''}"
      >
        <div class="cart-item-image">
          <img
            src="${imgSrc}"
            alt="${item.name}"
            loading="lazy"
            width="100" height="80"
            onerror="this.src='https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop&q=80'"
          >
        </div>
        <div>
          <div class="cart-item-name">${item.name}</div>
          ${variantText}
          ${addOnText}
          <div class="cart-item-controls">
            <div class="cart-item-qty-controls">
              <button
                class="cart-qty-btn"
                data-action="decrease"
                aria-label="Decrease quantity of ${item.name}"
              >−</button>
              <span class="cart-qty-value" aria-live="polite">${item.quantity}</span>
              <button
                class="cart-qty-btn"
                data-action="increase"
                aria-label="Increase quantity of ${item.name}"
              >+</button>
            </div>
            <button
              class="cart-item-remove"
              data-action="remove"
              aria-label="Remove ${item.name} from cart"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>
        <div class="cart-item-price" aria-label="Item total">
          ${CONFIG.CURRENCY}${linePrice}
        </div>
      </div>
    `;
  }

  /* ── Render all cart items ────────────────────────────────── */
  function renderCart() {
    const items = CART.getItems();

    if (items.length === 0) {
      if (emptyState)  emptyState.hidden  = false;
      if (cartContent) cartContent.hidden = true;
      return;
    }

    if (emptyState)  emptyState.hidden  = true;
    if (cartContent) cartContent.hidden = false;

    // Render items
    if (itemsList) {
      itemsList.innerHTML = items.map(_renderCartItem).join('');
    }

    // Update header count
    const countHeader = document.getElementById('cart-item-count-header');
    if (countHeader) countHeader.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} in your order`;

    const countEl = document.getElementById('cart-item-count');
    if (countEl) countEl.textContent = items.length;

    updateSummary();
  }

  /* ── Update order summary ─────────────────────────────────── */
  function updateSummary() {
    const ot = orderType();
    const subtotal  = CART.getSubtotal();
    const delivery  = CART.getDeliveryCharge(ot);
    const total     = subtotal + delivery;

    const items = CART.getItems();

    document.getElementById('summary-item-count') && (document.getElementById('summary-item-count').textContent = items.reduce((s, i) => s + i.quantity, 0));
    document.getElementById('summary-subtotal')   && (document.getElementById('summary-subtotal').textContent   = `${CONFIG.CURRENCY}${subtotal}`);
    document.getElementById('summary-total')      && (document.getElementById('summary-total').textContent      = `${CONFIG.CURRENCY}${total}`);

    const deliveryRow = document.getElementById('delivery-row');
    if (deliveryRow) {
      deliveryRow.hidden = ot !== 'delivery';
      const deliveryVal = document.getElementById('summary-delivery');
      if (deliveryVal) deliveryVal.textContent = `${CONFIG.CURRENCY}${delivery}`;
    }
  }

  /* ── Cart item action delegation ─────────────────────────── */
  function _initCartActions() {
    if (!itemsList) return;

    itemsList.addEventListener('click', e => {
      const btn  = e.target.closest('[data-action]');
      if (!btn) return;

      const row     = btn.closest('.cart-item');
      if (!row) return;

      const id      = row.dataset.id;
      const variant = row.dataset.variant;
      const action  = btn.dataset.action;

      if (action === 'remove') {
        CART.removeItem(id, variant);
        renderCart();
        return;
      }

      const qtyEl = row.querySelector('.cart-qty-value');
      const current = parseInt(qtyEl?.textContent || '1', 10);

      if (action === 'increase') {
        CART.updateQuantity(id, variant, current + 1);
      } else if (action === 'decrease') {
        CART.updateQuantity(id, variant, current - 1);
      }

      renderCart();
    });
  }

  /* ── Clear cart button ────────────────────────────────────── */
  function _initClearCart() {
    const btn = document.getElementById('clear-cart-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!confirm('Remove all items from cart?')) return;
      CART.clearAll();
      renderCart();
    });
  }

  /* ── Order type toggle ────────────────────────────────────── */
  function _initOrderType() {
    const pickupEl   = document.getElementById('order-pickup');
    const deliveryEl = document.getElementById('order-delivery');
    const delivFields = document.getElementById('delivery-fields');

    function toggle() {
      const isDelivery = deliveryEl?.checked;
      if (delivFields) delivFields.hidden = !isDelivery;
      updateSummary();
    }

    pickupEl?.addEventListener('change', toggle);
    deliveryEl?.addEventListener('change', toggle);
    toggle(); // initial state
  }

  /* ── Form validation ──────────────────────────────────────── */
  function _validateForm() {
    let valid = true;

    const name = document.getElementById('customer-name');
    const nameError = document.getElementById('name-error');
    if (!name?.value.trim()) {
      name?.classList.add('error');
      if (nameError) nameError.hidden = false;
      valid = false;
    } else {
      name?.classList.remove('error');
      if (nameError) nameError.hidden = true;
    }

    const phone = document.getElementById('customer-phone');
    const phoneError = document.getElementById('phone-error');
    if (!phone?.value.trim() || !/^[0-9]{10}$/.test(phone.value.trim())) {
      phone?.classList.add('error');
      if (phoneError) phoneError.hidden = false;
      valid = false;
    } else {
      phone?.classList.remove('error');
      if (phoneError) phoneError.hidden = true;
    }

    const ot = orderType();
    if (ot === 'delivery') {
      const addr = document.getElementById('delivery-address');
      const addrError = document.getElementById('address-error');
      if (!addr?.value.trim()) {
        addr?.classList.add('error');
        if (addrError) addrError.hidden = false;
        valid = false;
      } else {
        addr?.classList.remove('error');
        if (addrError) addrError.hidden = true;
      }
    }

    return valid;
  }

  /* ── Generate WhatsApp message ────────────────────────────── */
  function _generateWhatsAppMessage() {
    const items    = CART.getItems();
    const ot       = orderType();
    const name     = document.getElementById('customer-name')?.value.trim() || '';
    const phone    = document.getElementById('customer-phone')?.value.trim() || '';
    const address  = document.getElementById('delivery-address')?.value.trim() || '';
    const landmark = document.getElementById('delivery-landmark')?.value.trim() || '';
    const notes    = document.getElementById('special-notes')?.value.trim() || '';

    const subtotal  = CART.getSubtotal();
    const delivery  = CART.getDeliveryCharge(ot);
    const total     = subtotal + delivery;

    const lines = [];
    lines.push(`Hello *${CONFIG.BUSINESS_NAME}!* 🎉`);
    lines.push('');
    lines.push('I would like to place an order:');
    lines.push('');
    lines.push('*📦 Order Details:*');
    lines.push('─────────────────────');

    items.forEach((item, i) => {
      const addOnTotal = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
      const linePrice  = (item.price + addOnTotal) * item.quantity;

      lines.push(`${i + 1}. *${item.name}*`);
      if (item.variantName) lines.push(`   Variant: ${item.variantName}`);
      if (item.addOns && item.addOns.length > 0) {
        lines.push(`   Add-ons: ${item.addOns.map(a => `${a.name} (+${CONFIG.CURRENCY}${a.price})`).join(', ')}`);
      }
      lines.push(`   Qty: ${item.quantity} × ${CONFIG.CURRENCY}${item.price + addOnTotal} = *${CONFIG.CURRENCY}${linePrice}*`);
    });

    lines.push('─────────────────────');
    lines.push(`Subtotal: ${CONFIG.CURRENCY}${subtotal}`);
    if (ot === 'delivery' && delivery > 0) {
      lines.push(`Delivery: ${CONFIG.CURRENCY}${delivery}`);
    }
    lines.push(`*Total: ${CONFIG.CURRENCY}${total}*`);
    lines.push('');
    lines.push(`*📋 Order Type:* ${ot === 'delivery' ? '🚀 Delivery' : '🏪 Pickup'}`);
    lines.push(`*👤 Name:* ${name}`);
    lines.push(`*📱 Phone:* ${phone}`);

    if (ot === 'delivery') {
      lines.push(`*📍 Address:* ${address}`);
      if (landmark) lines.push(`*Landmark:* ${landmark}`);
    }

    if (notes) {
      lines.push('');
      lines.push(`*📝 Notes:* ${notes}`);
    }

    lines.push('');
    lines.push('Please confirm my order. Thank you! 🙏');

    return lines.join('\n');
  }

  /* ── WhatsApp button ──────────────────────────────────────── */
  function _initWhatsAppButton() {
    const btn = document.getElementById('whatsapp-order-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (CART.isEmpty()) {
        showToast('Your cart is empty. Add items first!', 'error');
        return;
      }

      if (!_validateForm()) {
        showToast('Please fill in your details to continue.', 'error');
        // Scroll to form
        document.getElementById('customer-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const message = _generateWhatsAppMessage();
      const url     = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /* ── Main init ────────────────────────────────────────────── */
  function main() {
    renderCart();
    _initCartActions();
    _initClearCart();
    _initOrderType();
    _initWhatsAppButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

})();
