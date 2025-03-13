document.addEventListener('DOMContentLoaded', () => {
  // Call authentication functions from main.js
  checkAuth();
  updateNav();
  // Fetch cakes and update cart badge
  fetchCakes();
  updateCartBadge();
});

let cakes = [];

// Fetch all cakes from the backend API
function fetchCakes() {
  fetch('/api/cakes')
    .then(response => response.json())
    .then(data => {
      cakes = data;
      displayCakes(cakes);
    })
    .catch(error => console.error('Error fetching cakes:', error));
}

// Render cake cards using an improved, modern layout
function displayCakes(cakesToDisplay) {
  const cakeList = document.getElementById('cake-list');
  cakeList.innerHTML = '';
  cakesToDisplay.forEach(cake => {
    const cakeHTML = `
      <div class="cake-card" data-aos="fade-up" data-aos-duration="800">
        <div class="cake-image-container">
          <img src="${cake.photoUrl}" alt="${cake.name}" class="cake-image">
          <div class="cake-overlay">
            <button class="add-to-cart-btn" onclick="addToCart(${cake.id}, '${cake.name}', ${cake.price})">
              <i class="bi bi-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
        <div class="cake-info">
          <h3 class="cake-title">${cake.name}</h3>
          <p class="cake-description">${cake.description}</p>
          <p class="cake-price">₹${cake.price}</p>
        </div>
      </div>
    `;
    cakeList.innerHTML += cakeHTML;
  });
}

// Function to add items to the cart and update the badge
function addToCart(id, name, price) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${name} added to cart.`);
  updateCartBadge();
}

// Update the cart badge with the total number of items
function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-badge').innerText = totalItems;
}

// Apply search, filter, and sort options
function applyFilters() {
  const searchText = document.getElementById('search-box').value.toLowerCase();
  const filterValue = document.getElementById('filter-select').value;
  const sortValue = document.getElementById('sort-select').value;

  let filteredCakes = cakes.filter(cake => {
    return cake.name.toLowerCase().includes(searchText) ||
           cake.description.toLowerCase().includes(searchText);
  });

  if (filterValue) {
    filteredCakes = filteredCakes.filter(cake => {
      if (filterValue === 'under20') {
        return cake.price < 20;
      } else if (filterValue === '20to40') {
        return cake.price >= 20 && cake.price <= 40;
      } else if (filterValue === 'above40') {
        return cake.price > 40;
      }
      return true;
    });
  }

  if (sortValue) {
    if (sortValue === 'price-asc') {
      filteredCakes.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
      filteredCakes.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'name-asc') {
      filteredCakes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === 'name-desc') {
      filteredCakes.sort((a, b) => b.name.localeCompare(a.name));
    }
  }

  displayCakes(filteredCakes);
}
