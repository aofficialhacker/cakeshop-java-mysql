document.addEventListener('DOMContentLoaded', () => {
  // Call authentication functions from main.js
  checkAuth();
  updateNav();
  // Original functionality
  displayOrderSummary();
  updateCartBadge();

  // Handle payment method toggling
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', handlePaymentChange);
  });

  // Handle form submission
  document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    processCheckout();
  });
});

// Display order items and total from localStorage cart
function displayOrderSummary() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const orderItemsDiv = document.getElementById('order-items');
  orderItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    orderItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('order-total').innerText = '';
    return;
  }

  cart.forEach(item => {
    orderItemsDiv.innerHTML += `<p>${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}</p>`;
  });

  let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('order-total').innerText = 'Total: ₹' + total.toFixed(2);
}

// Show/hide relevant payment fields
function handlePaymentChange() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  // Hide all sections by default
  document.getElementById('card-details').style.display = 'none';
  document.getElementById('netbanking-details').style.display = 'none';
  document.getElementById('upi-qr').style.display = 'none';

  // Show relevant fields
  if (paymentMethod === 'credit') {
    document.getElementById('card-details').style.display = 'block';
  } else if (paymentMethod === 'netbanking') {
    document.getElementById('netbanking-details').style.display = 'block';
  } else if (paymentMethod === 'upi') {
    document.getElementById('upi-qr').style.display = 'block';
  }
}

// Update cart badge count (if needed)
function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-badge').innerText = totalItems;
}

// Process the checkout
function processCheckout() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // Build order items array
  let orderItems = cart.map(item => `${item.name} x ${item.quantity}`);
  let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  let paymentDetails = {};

  // Capture extra details based on payment method
  if (paymentMethod === 'credit') {
    paymentDetails.cardNumber = document.getElementById('card-number').value;
    paymentDetails.cardExpiry = document.getElementById('card-expiry').value;
    paymentDetails.cardCVV = document.getElementById('card-cvv').value;
  } else if (paymentMethod === 'netbanking') {
    paymentDetails.bank = document.getElementById('bank-select').value;
  }
  // For UPI, no extra input fields—just the QR code display

  let order = {
    items: orderItems,
    total: total,
    paymentMethod: paymentMethod,
    paymentDetails: paymentDetails
  };

  // POST the order to the backend
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  })
    .then(response => response.json())
    .then(data => {
      alert('Order placed successfully! Order ID: ' + data.id);
      // Clear cart after successful order
      localStorage.removeItem('cart');
      // Redirect to a thank you page
      window.location.href = 'thank-you.html';
    })
    .catch(error => {
      console.error('Error placing order:', error);
      alert('There was an error processing your order. Please try again.');
    });
}
  