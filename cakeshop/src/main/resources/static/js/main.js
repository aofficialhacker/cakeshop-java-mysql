// Called when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  // First fetch current user info from server
  fetchCurrentUser().then(() => {
    // Then check authentication status
    checkAuth();
    // Always update navigation based on auth status
    updateNav();
    // Only run these functions if the elements exist on the current page
    if (document.getElementById('cakes-section')) {
      showSection('cakes-section');
      fetchCakes();
    }
    updateCartBadge();
  });
});

// Fetch current user information from the server
function fetchCurrentUser() {
  return fetch('/api/auth/current-user')
    .then(response => response.json())
    .then(data => {
      if (data.authenticated) {
        // Store user info in localStorage
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
      } else {
        // Clear user info if not authenticated
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
      }
    })
    .catch(error => {
      console.error('Error fetching current user:', error);
      // Clear user info on error
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
    });
}

// Check authentication status and redirect if needed
function checkAuth() {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Pages that require authentication
  const protectedPages = ['cart.html', 'checkout.html'];
  // Pages that should not be accessible when logged in
  const authPages = ['login.html', 'register.html'];

  if (!userEmail && protectedPages.includes(currentPage)) {
    // Redirect to login if trying to access protected pages while logged out
    window.location.href = 'login.html';
    return false;
  }

  if (userEmail && authPages.includes(currentPage)) {
    // Redirect to home if trying to access auth pages while logged in
    window.location.href = 'index.html';
    return false;
  }

  // Show/hide admin panel based on user role
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {
    adminPanel.style.display = userRole === 'ADMIN' ? 'block' : 'none';
  }
  
  return true;
}

// Updates the navigation auth links based on login state.
function updateNav() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  // Remove any dynamic auth links already added.
  navLinks.querySelectorAll('.auth-link').forEach(item => item.remove());

  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');

  if (userEmail) {
    // Update user info display
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      userInfo.innerHTML = `<span>Welcome, ${userEmail}</span>`;
    }

    // Logged in: add a Logout link
    const liLogout = document.createElement('li');
    liLogout.classList.add('auth-link');
    liLogout.innerHTML = `<a href="#" onclick="logout()"><i class="bi bi-box-arrow-right"></i> Logout</a>`;
    navLinks.appendChild(liLogout);

    // Add Orders link for logged-in users
    const liOrders = document.createElement('li');
    liOrders.classList.add('auth-link');
    liOrders.innerHTML = `<a href="orders.html"><i class="bi bi-card-list"></i> Orders</a>`;
    navLinks.appendChild(liOrders);

  } else {
    // Clear user info display
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      userInfo.innerHTML = '';
    }

    // Not logged in: add Login and Register links
    const liLogin = document.createElement('li');
    liLogin.classList.add('auth-link');
    liLogin.innerHTML = `<a href="login.html"><i class="bi bi-person"></i> Login</a>`;
    navLinks.appendChild(liLogin);

    const liRegister = document.createElement('li');
    liRegister.classList.add('auth-link');
    liRegister.innerHTML = `<a href="register.html"><i class="bi bi-person-plus"></i> Register</a>`;
    navLinks.appendChild(liRegister);
  }
}

// Logout function: clear login data and update navigation.
function logout() {
  // Call the server logout endpoint
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })
  .then(() => {
    // Clear local storage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    // Update navigation
    updateNav();
    // Redirect to home
    window.location.href = 'index.html';
  })
  .catch(error => {
    console.error('Error during logout:', error);
    // Still clear local storage and redirect even if server logout fails
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    updateNav();
    window.location.href = 'index.html';
  });
}

// Example function: show a section by id.
function showSection(sectionId) {
  // For simplicity, assume only "cakes-section" is toggled.
  const cakesSection = document.getElementById('cakes-section');
  if (cakesSection) {
    cakesSection.style.display = 'none';
  }
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }
  if (sectionId === 'cakes-section') {
    fetchCakes();
  }
}

// Fetch cakes from backend.
function fetchCakes() {
  fetch('/api/cakes')
    .then(response => response.json())
    .then(data => {
      const cakeList = document.getElementById('cake-list');
      if (!cakeList) return;
      
      cakeList.innerHTML = ''; // Clear previous list
      data.forEach(cake => {
        // Build markup that matches the CSS (.cake-card, .cake-info, etc.)
        let cakeHTML = `
          <div class="cake-card">
            <img src="${cake.photoUrl}" alt="${cake.name}" />
            <div class="cake-info">
              <h3>${cake.name}</h3>
              <p>${cake.description}</p>
              <p>Price: ₹${cake.price}</p>
              <button class="add-to-cart-btn"
                      onclick="addToCart(${cake.id}, '${cake.name}', ${cake.price})">
                <i class="bi bi-cart-plus"></i> Add to Cart
              </button>
              ${
                localStorage.getItem('userRole') === 'ADMIN'
                  ? `<button class="delete-btn" onclick="deleteCake(${cake.id})">Delete</button>`
                  : ''
              }
            </div>
          </div>
        `;
        cakeList.innerHTML += cakeHTML;
      });
    })
    .catch(error => console.error('Error fetching cakes:', error));
}


function addCake() {
  const name = document.getElementById('cake-name').value;
  const description = document.getElementById('cake-description').value;
  const photoUrl = document.getElementById('cake-photo').value;
  const price = parseFloat(document.getElementById('cake-price').value);
  const cake = { name, description, price, photoUrl };
  const userRole = localStorage.getItem('userRole');

  fetch('/api/cakes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': userRole
    },
    body: JSON.stringify(cake)
  })
    .then(res => res.json())
    .then(data => {
      alert('Cake added successfully!');
      fetchCakes();
      // Clear input fields.
      document.getElementById('cake-name').value = '';
      document.getElementById('cake-description').value = '';
      document.getElementById('cake-photo').value = '';
      document.getElementById('cake-price').value = '';
    })
    .catch(error => console.error('Error adding cake:', error));
}

function deleteCake(id) {
  const userRole = localStorage.getItem('userRole');
  fetch('/api/cakes/' + id, {
    method: 'DELETE',
    headers: { 'X-User-Role': userRole }
  })
    .then(() => {
      alert('Cake deleted!');
      fetchCakes();
    })
    .catch(error => console.error('Error deleting cake:', error));
}

// Add to cart function
function addToCart(id, name, price) {
  // Get current cart from localStorage or initialize empty array
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === id);
  
  if (existingItemIndex > -1) {
    // Item exists, increment quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // Item doesn't exist, add new item
    cart.push({
      id: id,
      name: name,
      price: price,
      quantity: 1
    });
  }
  
  // Save updated cart back to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart badge
  updateCartBadge();
  
  // Show confirmation to user
  alert(`${name} added to cart!`);
}

function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.innerText = totalItems;
  }
}
