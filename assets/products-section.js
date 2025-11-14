class ProductsSection {
  constructor() {
    this.wishlistKey = 'shopify-wishlist';
    this.notificationContainer = null;
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.attachEventListeners();
    this.createNotificationContainer();
    this.loadWishlist();
  }

  attachEventListeners() {
    document.addEventListener('click', this.handleDocumentClick);
  }

  handleDocumentClick(event) {
    const wishlistButton = event.target.closest('.wishlist-btn');
    if (wishlistButton) {
      event.preventDefault();
      this.handleWishlist(wishlistButton);
      return;
    }

    const addToCartButton = event.target.closest('.add-to-cart-btn');
    if (addToCartButton) {
      event.preventDefault();
      this.handleAddToCart(addToCartButton);
    }
  }

  readWishlist() {
    try {
      const stored = localStorage.getItem(this.wishlistKey);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to read wishlist from storage', error);
      return [];
    }
  }

  saveWishlist(items) {
    try {
      localStorage.setItem(this.wishlistKey, JSON.stringify(items));
    } catch (error) {
      console.warn('Unable to save wishlist to storage', error);
    }
  }

  handleWishlist(button) {
    const productCard = button.closest('.product-card');
    if (!productCard) return;

    const productId = productCard.dataset.productId;
    if (!productId) return;

    const productTitle = button.dataset.productTitle || 'Product';
    const wishlist = this.readWishlist();
    const idAsString = String(productId);
    const isActive = button.classList.toggle('active');

    button.setAttribute('aria-pressed', String(isActive));

    if (isActive) {
      if (!wishlist.includes(idAsString)) {
        wishlist.push(idAsString);
      }
      this.saveWishlist(wishlist);
      this.showNotification(`${productTitle} added to your wishlist.`);
    } else {
      const updatedWishlist = wishlist.filter((id) => id !== idAsString);
      this.saveWishlist(updatedWishlist);
      this.showNotification(`${productTitle} removed from your wishlist.`, 'error');
    }
  }

  handleAddToCart(button) {
    if (button.disabled) {
      return;
    }

    const variantId = button.dataset.variantId;
    if (!variantId || variantId === 'null') {
      this.setButtonState(button, 'error');
      this.showNotification('This product is currently unavailable.', 'error');
      setTimeout(() => this.setButtonState(button, 'idle'), 2200);
      return;
    }

    const quantity = Number(button.dataset.quantity || 1) || 1;
    const productTitle = button.dataset.productTitle || 'Product';

    this.setButtonState(button, 'loading');

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            id: Number(variantId),
            quantity
          }
        ]
      })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw error;
          });
        }
        return response.json();
      })
      .then(() => {
        this.setButtonState(button, 'success');
        this.showNotification(`${productTitle} added to your cart.`);
        setTimeout(() => this.setButtonState(button, 'idle'), 2200);
      })
      .catch((error) => {
        console.error('Error adding to cart:', error);
        const errorMessage =
          (error && (error.message || error.description)) || 'Unable to add to cart.';
        this.setButtonState(button, 'error');
        this.showNotification(errorMessage, 'error');
        setTimeout(() => this.setButtonState(button, 'idle'), 2400);
      });
  }

  setButtonState(button, state) {
    const textElement = button.querySelector('.btn-text');
    const defaultText = button.dataset.defaultText || 'Add to cart';
    const loadingText = button.dataset.loadingText || 'Adding…';
    const successText = button.dataset.successText || 'Added to cart';
    const errorText = button.dataset.errorText || 'Try again';

    switch (state) {
      case 'loading':
        button.classList.add('is-loading');
        button.classList.remove('is-success', 'is-error');
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        if (textElement) textElement.textContent = loadingText;
        break;
      case 'success':
        button.classList.remove('is-loading', 'is-error');
        button.classList.add('is-success');
        button.disabled = true;
        button.setAttribute('aria-busy', 'false');
        if (textElement) textElement.textContent = successText;
        break;
      case 'error':
        button.classList.remove('is-loading', 'is-success');
        button.classList.add('is-error');
        button.disabled = false;
        button.setAttribute('aria-busy', 'false');
        if (textElement) textElement.textContent = errorText;
        break;
      default:
        button.classList.remove('is-loading', 'is-success', 'is-error');
        button.disabled = false;
        button.setAttribute('aria-busy', 'false');
        if (textElement) textElement.textContent = defaultText;
    }
  }

  loadWishlist() {
    const wishlist = this.readWishlist();
    const ids = wishlist.map((id) => String(id));
    document.querySelectorAll('.wishlist-btn').forEach((button) => {
      const productCard = button.closest('.product-card');
      if (!productCard) return;
      const productId = String(productCard.dataset.productId || '');
      const isActive = ids.includes(productId);
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  createNotificationContainer() {
    if (this.notificationContainer && document.body.contains(this.notificationContainer)) {
      return;
    }

    this.notificationContainer = document.querySelector('.products-section__notifications');

    if (!this.notificationContainer) {
      this.notificationContainer = document.createElement('div');
      this.notificationContainer.className = 'products-section__notifications';
      document.body.appendChild(this.notificationContainer);
    }
  }

  showNotification(message, type = 'success') {
    this.createNotificationContainer();

    const notification = document.createElement('div');
    notification.className = 'products-notification';

    if (type === 'error') {
      notification.classList.add('products-notification--error');
    }

    notification.textContent = message;
    this.notificationContainer.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('is-visible');
    });

    setTimeout(() => {
      notification.classList.remove('is-visible');
      notification.addEventListener(
        'transitionend',
        () => {
          notification.remove();
        },
        { once: true }
      );
    }, 3200);
  }
}

const initProductsSection = () => {
  if (window.__productsSectionInstance) {
    window.__productsSectionInstance.loadWishlist();
    return;
  }

  window.__productsSectionInstance = new ProductsSection();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductsSection);
} else {
  initProductsSection();
}

document.addEventListener('shopify:section:load', () => {
  initProductsSection();
});
