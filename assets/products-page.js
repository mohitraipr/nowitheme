document.addEventListener('DOMContentLoaded', function() {
  console.log('[v0] Products page initialized');

  // Wishlist functionality
  const wishlistButtons = document.querySelectorAll('.wishlist-btn');
  const wishlistKey = 'shopify_wishlist';

  // Load wishlist from localStorage
  const loadWishlist = () => {
    const wishlist = localStorage.getItem(wishlistKey);
    return wishlist ? JSON.parse(wishlist) : [];
  };

  // Save wishlist to localStorage
  const saveWishlist = (wishlist) => {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  };

  // Initialize wishlist buttons
  const currentWishlist = loadWishlist();
  wishlistButtons.forEach(button => {
    const productId = button.getAttribute('data-product-id');
    if (currentWishlist.includes(productId)) {
      button.classList.add('active');
    }

    button.addEventListener('click', function(e) {
      e.preventDefault();
      toggleWishlist(productId, button);
    });
  });

  // Toggle wishlist
  const toggleWishlist = (productId, button) => {
    let wishlist = loadWishlist();
    
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
      button.classList.remove('active');
      console.log('[v0] Removed from wishlist:', productId);
    } else {
      wishlist.push(productId);
      button.classList.add('active');
      console.log('[v0] Added to wishlist:', productId);
    }

    saveWishlist(wishlist);
  };

  // Add to Cart functionality
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = button.getAttribute('data-product-id');
      addToCart(productId);
    });
  });

  const addToCart = (productId) => {
    const formData = {
      items: [
        {
          id: productId,
          quantity: 1
        }
      ]
    };

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (response.ok) {
        console.log('[v0] Product added to cart:', productId);
        showNotification('Added to cart!');
      }
    })
    .catch(error => {
      console.error('[v0] Error adding to cart:', error);
    });
  };

  // Notification helper
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #3a7d63;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Filter and Sort button listeners
  const filterBtn = document.getElementById('filterBtn');
  const sortBtn = document.getElementById('sortBtn');

  if (filterBtn) {
    filterBtn.addEventListener('click', function() {
      console.log('[v0] Filter clicked');
      // Add your filter logic here
    });
  }

  if (sortBtn) {
    sortBtn.addEventListener('click', function() {
      console.log('[v0] Sort clicked');
      // Add your sort logic here
    });
  }
});
