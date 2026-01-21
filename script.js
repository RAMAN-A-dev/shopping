// Data Management
const STORAGE_KEYS = {
    MENU_ITEMS: 'menuItems',
    CART: 'cart',
    SALES: 'sales',
    PAYMENT_LINK: 'paymentLink'
};

// Default menu items with placeholder images
const DEFAULT_MENU_ITEMS = [
    { id: 1, name: 'Idly', price: 25, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', description: 'Soft steamed rice cakes' },
    { id: 2, name: 'Puttu', price: 30, image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400', description: 'Steamed rice cake with coconut' },
    { id: 3, name: 'Poori', price: 40, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', description: 'Deep fried bread' },
    { id: 4, name: 'Coffee', price: 15, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', description: 'Hot South Indian filter coffee' },
    { id: 5, name: 'Dosa', price: 45, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', description: 'Crispy fermented crepe' },
    { id: 6, name: 'Vada', price: 20, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', description: 'Savory fried doughnut' },
    { id: 7, name: 'Pazhampori', price: 35, image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=400', description: 'Sweet banana fritters' }
];

// Initialize application
let currentEditingItemId = null;
let currentOrder = null;

// ========== MENU INITIALIZATION ==========
function initMenu() {
    let menuItems = getMenuItems();
    
    if (menuItems.length === 0) {
        saveMenuItems(DEFAULT_MENU_ITEMS);
        menuItems = DEFAULT_MENU_ITEMS;
    }
    
    renderMenu();
    updateCartDisplay();
    
    // Initialize payment link if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_LINK)) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_LINK, 'UPI://pay?pa=your-upi-id@paytm&pn=Restaurant&am={amount}&cu=INR');
    }
}

function getMenuItems() {
    const items = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return items ? JSON.parse(items) : [];
}

function saveMenuItems(items) {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
}

function renderMenu() {
    const menuGrid = document.getElementById('menu-grid');
    const menuItems = getMenuItems();
    
    menuGrid.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItemCard = document.createElement('div');
        menuItemCard.className = 'menu-item';
        menuItemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-item-image" 
                 onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}'">
            <div class="menu-item-info">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">₹${item.price}</div>
                ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
                <button class="add-to-cart-btn" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
        menuGrid.appendChild(menuItemCard);
    });
}

// ========== CART MANAGEMENT ==========
function getCart() {
    const cart = localStorage.getItem(STORAGE_KEYS.CART);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function addToCart(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    let cart = getCart();
    const existingItem = cart.find(c => c.itemId === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            itemId: itemId,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartDisplay();
    
    // Show feedback
    showNotification(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(c => c.itemId !== itemId);
    saveCart(cart);
    updateCartDisplay();
}

function updateQuantity(itemId, change) {
    let cart = getCart();
    const item = cart.find(c => c.itemId === itemId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveCart(cart);
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cart = getCart();
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        calculateTotal();
        return;
    }
    
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.itemId}, -1)">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.itemId}, 1)">+</button>
                <button class="remove-item-btn" onclick="removeFromCart(${item.itemId})">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    calculateTotal();
}

function calculateTotal() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    
    return total;
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        saveCart([]);
        updateCartDisplay();
        showNotification('Cart cleared!');
    }
}

// ========== BILLING ==========
function handlePayment() {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = calculateTotal();
    
    // Generate order
    const orderId = 'ORD' + Date.now();
    const order = {
        orderId: orderId,
        date: new Date().toISOString(),
        items: cart.map(item => ({ ...item })),
        total: total
    };
    
    // Save order to sales
    let sales = getSales();
    sales.push(order);
    saveSales(sales);
    
    // Store current order for printing
    currentOrder = order;
    
    // Generate QR code
    generateQRCode(total);
    
    // Show QR modal
    document.getElementById('qr-modal').classList.add('active');
    
    // Clear cart after payment
    setTimeout(() => {
        clearCart();
    }, 100);
}

function generateQRCode(amount) {
    const paymentLink = localStorage.getItem(STORAGE_KEYS.PAYMENT_LINK) || 
                       'UPI://pay?pa=your-upi-id@paytm&pn=Restaurant&am=' + amount + '&cu=INR';
    
    // Replace {amount} placeholder if exists
    const finalLink = paymentLink.replace('{amount}', amount.toFixed(2));
    
    const qrContainer = document.getElementById('qrcode-container');
    qrContainer.innerHTML = '';
    
    QRCode.toCanvas(qrContainer, finalLink, {
        width: 250,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function (error) {
        if (error) {
            qrContainer.innerHTML = '<p>Error generating QR code</p>';
            console.error(error);
        }
    });
}

function printBill() {
    const cart = getCart();
    
    if (cart.length === 0 && !currentOrder) {
        alert('No items to print!');
        return;
    }
    
    // Use current order if available, otherwise use cart
    const order = currentOrder || {
        orderId: 'CART' + Date.now(),
        date: new Date().toISOString(),
        items: cart,
        total: calculateTotal()
    };
    
    // Populate bill
    document.getElementById('bill-date').textContent = 
        `Date: ${new Date(order.date).toLocaleString()}`;
    document.getElementById('bill-order-id').textContent = 
        `Order ID: ${order.orderId}`;
    
    const billItems = document.getElementById('bill-items');
    billItems.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        `;
        billItems.appendChild(row);
    });
    
    document.getElementById('bill-total').innerHTML = 
        `<strong>₹${order.total.toFixed(2)}</strong>`;
    
    // Print
    window.print();
}

// ========== MENU CRUD OPERATIONS ==========
function renderAdminMenu() {
    const adminMenuList = document.getElementById('admin-menu-list');
    const menuItems = getMenuItems();
    
    adminMenuList.innerHTML = '';
    
    menuItems.forEach(item => {
        const adminItem = document.createElement('div');
        adminItem.className = 'admin-menu-item';
        adminItem.innerHTML = `
            <div class="admin-menu-item-info">
                <div class="admin-menu-item-name">${item.name}</div>
                <div class="admin-menu-item-price">₹${item.price}</div>
            </div>
            <div class="admin-menu-item-actions">
                <button class="btn-edit" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
        `;
        adminMenuList.appendChild(adminItem);
    });
}

function openAddItemModal() {
    currentEditingItemId = null;
    document.getElementById('modal-title').textContent = 'Add Menu Item';
    document.getElementById('item-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('item-modal').classList.add('active');
}

function editMenuItem(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    currentEditingItemId = itemId;
    document.getElementById('modal-title').textContent = 'Edit Menu Item';
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-image').value = item.image;
    document.getElementById('item-description').value = item.description || '';
    document.getElementById('item-modal').classList.add('active');
}

function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    let menuItems = getMenuItems();
    menuItems = menuItems.filter(i => i.id !== itemId);
    saveMenuItems(menuItems);
    
    renderMenu();
    renderAdminMenu();
    showNotification('Item deleted!');
}

function saveMenuItem(event) {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('item-id').value);
    const name = document.getElementById('item-name').value.trim();
    const price = parseFloat(document.getElementById('item-price').value);
    const image = document.getElementById('item-image').value.trim();
    const description = document.getElementById('item-description').value.trim();
    
    if (!name || !price || !image) {
        alert('Please fill in all required fields!');
        return;
    }
    
    let menuItems = getMenuItems();
    
    if (id && currentEditingItemId) {
        // Edit existing item
        const index = menuItems.findIndex(i => i.id === id);
        if (index !== -1) {
            menuItems[index] = { id, name, price, image, description };
        }
        showNotification('Item updated!');
    } else {
        // Add new item
        const newId = Math.max(...menuItems.map(i => i.id), 0) + 1;
        menuItems.push({ id: newId, name, price, image, description });
        showNotification('Item added!');
    }
    
    saveMenuItems(menuItems);
    renderMenu();
    renderAdminMenu();
    closeItemModal();
}

function closeItemModal() {
    document.getElementById('item-modal').classList.remove('active');
    currentEditingItemId = null;
}

// ========== SALES REPORT ==========
function getSales() {
    const sales = localStorage.getItem(STORAGE_KEYS.SALES);
    return sales ? JSON.parse(sales) : [];
}

function saveSales(sales) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
}

function renderSalesReport() {
    const sales = getSales();
    
    // Populate month and year dropdowns
    populateDateFilters(sales);
    
    // Filter sales based on selected month/year
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    
    let filteredSales = sales;
    
    if (month || year) {
        filteredSales = sales.filter(order => {
            const orderDate = new Date(order.date);
            const orderMonth = (orderDate.getMonth() + 1).toString();
            const orderYear = orderDate.getFullYear().toString();
            
            if (month && orderMonth !== month) return false;
            if (year && orderYear !== year) return false;
            
            return true;
        });
    }
    
    // Calculate statistics
    const totalSales = filteredSales.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredSales.length;
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Update statistics
    document.getElementById('total-sales').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('avg-order').textContent = `₹${avgOrder.toFixed(2)}`;
    
    // Render sales table
    const tbody = document.getElementById('sales-tbody');
    tbody.innerHTML = '';
    
    if (filteredSales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No sales data available</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedSales = [...filteredSales].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedSales.forEach(order => {
        const row = document.createElement('tr');
        const date = new Date(order.date);
        const itemsList = order.items.map(i => `${i.name} (${i.quantity})`).join(', ');
        
        row.innerHTML = `
            <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
            <td>${order.orderId}</td>
            <td>${itemsList}</td>
            <td>₹${order.total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateDateFilters(sales) {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    // Get unique months and years from sales
    const dates = sales.map(order => new Date(order.date));
    const uniqueMonths = [...new Set(dates.map(d => d.getMonth() + 1))].sort((a, b) => a - b);
    const uniqueYears = [...new Set(dates.map(d => d.getFullYear()))].sort((a, b) => b - a);
    
    // Populate months
    const currentMonth = (new Date().getMonth() + 1).toString();
    monthSelect.innerHTML = '<option value="">All Months</option>';
    uniqueMonths.forEach(month => {
        const option = document.createElement('option');
        option.value = month.toString();
        option.textContent = new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
        if (month.toString() === currentMonth) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    });
    
    // Populate years
    yearSelect.innerHTML = '<option value="">All Years</option>';
    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        if (year === new Date().getFullYear()) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    });
}

// ========== VIEW MANAGEMENT ==========
function switchView(viewName) {
    // Update buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active');
        }
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewName + '-view').classList.add('active');
    
    // Render admin data if switching to admin view
    if (viewName === 'admin') {
        renderAdminMenu();
        renderSalesReport();
    }
}

// ========== UTILITY FUNCTIONS ==========
function showNotification(message) {
    // Simple notification (could be enhanced with a toast library)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #764ba2;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    initMenu();
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
    
    // Cart actions
    document.getElementById('pay-now-btn').addEventListener('click', handlePayment);
    document.getElementById('print-bill-btn').addEventListener('click', printBill);
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
    
    // QR Modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    document.getElementById('close-qr-btn').addEventListener('click', function() {
        document.getElementById('qr-modal').classList.remove('active');
    });
    
    // Close modals on outside click
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Admin menu management
    document.getElementById('add-item-btn').addEventListener('click', openAddItemModal);
    document.getElementById('item-form').addEventListener('submit', saveMenuItem);
    document.getElementById('cancel-item-btn').addEventListener('click', closeItemModal);
    
    // Sales report filters
    document.getElementById('month-select').addEventListener('change', renderSalesReport);
    document.getElementById('year-select').addEventListener('change', renderSalesReport);
    
    // Payment configuration
    const paymentLinkInput = document.getElementById('payment-link');
    const savedPaymentLink = localStorage.getItem(STORAGE_KEYS.PAYMENT_LINK);
    if (savedPaymentLink) {
        paymentLinkInput.value = savedPaymentLink;
    }
    
    document.getElementById('save-payment-btn').addEventListener('click', function() {
        const paymentLink = paymentLinkInput.value.trim();
        if (paymentLink) {
            localStorage.setItem(STORAGE_KEYS.PAYMENT_LINK, paymentLink);
            showNotification('Payment info saved!');
        } else {
            alert('Please enter a payment link!');
        }
    });
});
