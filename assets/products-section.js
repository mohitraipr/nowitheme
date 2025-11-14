class ProductsSection {
  constructor() {
    this.wishlistKey = 'shopify-wishlist';
    this.init();
  }

  init() {
    this.loadWishlist();
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.wishlist-btn')) {
        this.handleWishlist(e);
      }
      if (e.target.closest('.add-to-cart-btn')) {
        this.handleAddToCart(e);
      }
    });
  }

  handleWishlist(event) {
    event.preventDefault();
    const btn = event.target.closest('.wishlist-btn');
    const productCard = btn.closest('.product-card');
    const productId = productCard.dataset.productId;

    btn.classList.toggle('active');

    let wishlist = JSON.parse(localStorage.getItem(this.wishlistKey)) || [];

    if (btn.classList.contains('active')) {
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
      }
      this.showNotification('Added to wishlist');
    } else {
      wishlist = wishlist.filter((id) => id !== productId);
      this.showNotification('Removed from wishlist');
    }

    localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist));
  }

  handleAddToCart(event) {
    event.preventDefault();
    const btn = event.target.closest('.add-to-cart-btn');
    const variantId = btn.dataset.variantId;

    if (!variantId) {
      console.error('No variant id found on button');
      this.showNotification('Unable to add to cart', 'error');
      return;
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            id: Number(variantId),
            quantity: 1
          }
        ]
      })
    })
      .then((response) => response.json())
      .then(() => {
        this.showNotification('Added to cart');
        btn.textContent = 'Added!';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Add to Cart';
          btn.disabled = false;
        }, 2000);
      })
      .catch((error) => {
        console.error('Error adding to cart:', error);
        this.showNotification('Error adding to cart', 'error');
      });
  }

  loadWishlist() {
    const wishlist = JSON.parse(localStorage.getItem(this.wishlistKey)) || [];
    document.querySelectorAll('.product-card').forEach((card) => {
      const productId = card.dataset.productId;
      if (wishlist.includes(productId)) {
        const btn = card.querySelector('.wishlist-btn');
        if (btn) {
          btn.classList.add('active');
        }
      }
    });
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: ${type === 'success' ? '#3a7d63' : '#d87c5c'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProductsSection();
});
