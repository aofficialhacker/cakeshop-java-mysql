document.addEventListener('DOMContentLoaded', () => {
  // Call authentication functions from main.js
  checkAuth();
  updateNav();
  // Original functionality
  displayCart();
  updateCartBadge();
  document.getElementById('clear-cart').addEventListener('click', clearCart);
});

function displayCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsDiv = document.getElementById('cart-items');
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      let itemHTML = `
        <div class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-quantity">x${item.quantity}</span>
            <span class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <button onclick="removeItem(${index})" class="btn btn-remove">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      cartItemsDiv.innerHTML += itemHTML;
    });
  }
  updateTotal();
  updateCartBadge();
}

function updateTotal() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('cart-total').innerText = 'Total: ₹' + total.toFixed(2);
}

function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-badge').innerText = totalItems;
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

function clearCart() {
  localStorage.removeItem('cart');
  displayCart();
}
  
  
  