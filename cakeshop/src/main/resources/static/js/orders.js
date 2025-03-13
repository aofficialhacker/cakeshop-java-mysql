document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('Please log in to view your orders.');
        window.location.href = 'login.html';
        return;
    }

    console.log('Fetching orders for:', userEmail); // Debugging line

    fetch(`/api/orders/user?email=${userEmail}`)
        .then(response => response.json())
        .then(orders => {
            console.log('Orders fetched:', orders); // Debugging line
            const ordersList = document.getElementById('orders-list');
            ordersList.innerHTML = ''; // Clear previous orders

            if (orders.length === 0) {
                ordersList.innerHTML = '<p>No orders found.</p>';
                return;
            }

            orders.forEach(order => {
                let orderHTML = `
                    <div class="order-card">
                        <h3>Order ID: ${order.id}</h3>
                        <p>Status: ${order.status}</p>
                        <p>Total: ₹${order.total}</p>
                        <ul>
                            ${order.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `;
                ordersList.innerHTML += orderHTML;
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
});