/**
 * Cart Module
 * Handles cart operations
 */

const Cart = {
    items: [],

    init() {
        this.load();
        this.updateUI();
    },

    load() {
        this.items = DataManager.getCart();
    },

    save() {
        DataManager.saveCart(this.items);
        this.updateUI();
    },

    add(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                category: product.category,
                quantity: quantity
            });
        }
        
        this.save();
        this.showNotification('Товар добавлен в корзину');
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== parseInt(productId));
        this.save();
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === parseInt(productId));
        if (item) {
            if (quantity <= 0) {
                this.remove(productId);
            } else {
                item.quantity = quantity;
                this.save();
            }
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    getCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getItems() {
        return this.items;
    },

    updateUI() {
        // Update cart count badges
        const count = this.getCount();
        document.querySelectorAll('#cartCount').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    showNotification(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 14px 24px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
