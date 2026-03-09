/**
 * Checkout Module
 * Handles cart page and order processing
 */

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    initDeliveryCalculator();
    initCheckoutForm();
});

// Load cart items
function loadCart() {
    const cartItems = Cart.getItems();
    const cartEmpty = document.getElementById('cartEmpty');
    const cartContent = document.getElementById('cartContent');
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cartItems.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';
    
    // Render cart items
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/100x100?text=No+Image'}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4><a href="product.html?id=${item.id}">${item.name}</a></h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="10" readonly>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    ${formatPrice(item.price * item.quantity)}
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Update summary
    updateCartSummary();
    
    // Clear cart button
    const clearBtn = document.getElementById('clearCart');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Очистить корзину?')) {
                Cart.clear();
                loadCart();
            }
        });
    }
}

// Update cart quantity
function updateCartQuantity(productId, quantity) {
    Cart.updateQuantity(productId, quantity);
    loadCart();
}

// Remove from cart
function removeFromCart(productId) {
    Cart.remove(productId);
    loadCart();
}

// Update cart summary
function updateCartSummary() {
    const items = Cart.getItems();
    const subtotal = Cart.getTotal();
    const count = Cart.getCount();
    
    document.getElementById('summaryCount') && (document.getElementById('summaryCount').textContent = count);
    document.getElementById('summarySubtotal') && (document.getElementById('summarySubtotal').textContent = formatPrice(subtotal));
    document.getElementById('summaryTotal') && (document.getElementById('summaryTotal').textContent = formatPrice(subtotal));
}

// Delivery Calculator
let deliveryCost = 0;
let floorCost = 0;
let assemblyCost = 0;

function initDeliveryCalculator() {
    const calculateBtn = document.getElementById('calculateDelivery');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateDelivery);
    }
}

function calculateDelivery() {
    const distance = parseFloat(document.getElementById('deliveryDistance').value) || 0;
    const floor = parseInt(document.getElementById('deliveryFloor').value) || 1;
    const hasElevator = document.getElementById('hasElevator').checked;
    const needAssembly = document.getElementById('needAssembly').checked;
    
    const deliverySettings = DataManager.getDeliverySettings();
    const zones = deliverySettings.zones || [];
    const floorSettings = deliverySettings.floorPrices || {};
    
    // Calculate delivery cost
    deliveryCost = 0;
    for (const zone of zones) {
        if (distance <= zone.maxDistance) {
            deliveryCost = zone.basePrice + (distance * zone.pricePerKm);
            break;
        }
    }
    
    // If distance is greater than all zones, use the last zone
    if (deliveryCost === 0 && zones.length > 0) {
        const lastZone = zones[zones.length - 1];
        deliveryCost = lastZone.basePrice + (distance * lastZone.pricePerKm);
    }
    
    // Calculate floor cost
    floorCost = 0;
    if (!hasElevator) {
        const baseFloor = floorSettings.withoutElevator?.baseFloor || 3;
        const pricePerFloor = floorSettings.withoutElevator?.perFloor || 200;
        if (floor > baseFloor) {
            floorCost = (floor - baseFloor) * pricePerFloor;
        }
    }
    
    // Calculate assembly cost
    assemblyCost = 0;
    if (needAssembly) {
        // Get max assembly cost from items
        const items = Cart.getItems();
        const assemblyPrices = deliverySettings.assembly || {};
        
        items.forEach(item => {
            const categoryPrices = {
                'refrigerators': assemblyPrices.refrigerator || 1500,
                'washing-machines': assemblyPrices.washingMachine || 2000,
                'dishwashers': assemblyPrices.dishwasher || 2000,
                'ovens': assemblyPrices.oven || 1500,
                'microwaves': assemblyPrices.microwave || 500,
                'vacuum-cleaners': assemblyPrices.vacuumCleaner || 0
            };
            assemblyCost += categoryPrices[item.category] || 1000;
        });
    }
    
    // Display results
    const resultDiv = document.getElementById('deliveryResult');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        document.getElementById('deliveryPrice').textContent = formatPrice(deliveryCost);
        
        const floorRow = document.getElementById('floorRow');
        if (floorRow) {
            floorRow.style.display = floorCost > 0 ? 'flex' : 'none';
            document.getElementById('floorPrice').textContent = formatPrice(floorCost);
        }
        
        const assemblyRow = document.getElementById('assemblyRow');
        if (assemblyRow) {
            assemblyRow.style.display = assemblyCost > 0 ? 'flex' : 'none';
            document.getElementById('assemblyPrice').textContent = formatPrice(assemblyCost);
        }
    }
    
    // Update total
    updateTotal();
}

function updateTotal() {
    const subtotal = Cart.getTotal();
    const total = subtotal + deliveryCost + floorCost + assemblyCost;
    document.getElementById('summaryTotal').textContent = formatPrice(total);
}

// Checkout Form
function initCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (form) {
        form.addEventListener('submit', handleCheckout);
    }
}

function handleCheckout(e) {
    e.preventDefault();
    
    const items = Cart.getItems();
    if (items.length === 0) {
        alert('Корзина пуста');
        return;
    }
    
    const order = {
        customer: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail')?.value || '',
            address: document.getElementById('deliveryAddress').value
        },
        items: items,
        subtotal: Cart.getTotal(),
        delivery: {
            distance: parseFloat(document.getElementById('deliveryDistance')?.value) || 0,
            floor: parseInt(document.getElementById('deliveryFloor')?.value) || 1,
            hasElevator: document.getElementById('hasElevator')?.checked || true,
            cost: deliveryCost,
            floorCost: floorCost,
            assemblyCost: assemblyCost
        },
        total: Cart.getTotal() + deliveryCost + floorCost + assemblyCost,
        comment: document.getElementById('orderComment')?.value || ''
    };
    
    // Save order
    const orderId = DataManager.addOrder(order);
    
    // Clear cart
    Cart.clear();
    
    // Show success modal
    const modal = document.getElementById('orderModal');
    const orderNumber = document.getElementById('orderNumber');
    
    if (orderNumber) {
        orderNumber.textContent = '#' + orderId.toString().slice(-6);
    }
    
    if (modal) {
        modal.classList.add('active');
    }
}
