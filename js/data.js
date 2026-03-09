/**
 * Data Management Module
 * Handles loading and saving data to LocalStorage
 */

const DataManager = {
    // Keys for LocalStorage
    KEYS: {
        PRODUCTS: 'appliance_shop_products',
        CATEGORIES: 'appliance_shop_categories',
        CONFIG: 'appliance_shop_config',
        CART: 'appliance_shop_cart',
        ORDERS: 'appliance_shop_orders'
    },

    // Default data
    defaultProducts: null,
    defaultCategories: null,
    defaultConfig: null,

    // Initialize - load default data if nothing in storage
    async init() {
        // Load default data from JSON files
        try {
            const productsResponse = await fetch('data/products.json');
            const productsData = await productsResponse.json();
            this.defaultCategories = productsData.categories;
            this.defaultProducts = productsData.products;
        } catch (e) {
            console.error('Failed to load default products:', e);
            this.defaultCategories = [];
            this.defaultProducts = [];
        }

        try {
            const configResponse = await fetch('data/config.json');
            this.defaultConfig = await configResponse.json();
        } catch (e) {
            console.error('Failed to load default config:', e);
            this.defaultConfig = {};
        }

        // Initialize storage if empty
        if (!localStorage.getItem(this.KEYS.CATEGORIES)) {
            this.saveCategories(this.defaultCategories);
        }
        if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
            this.saveProducts(this.defaultProducts);
        }
        if (!localStorage.getItem(this.KEYS.CONFIG)) {
            this.saveConfig(this.defaultConfig);
        }
    },

    // Getters
    getProducts() {
        const data = localStorage.getItem(this.KEYS.PRODUCTS);
        return data ? JSON.parse(data) : [];
    },

    getCategories() {
        const data = localStorage.getItem(this.KEYS.CATEGORIES);
        return data ? JSON.parse(data) : [];
    },

    getConfig() {
        const data = localStorage.getItem(this.KEYS.CONFIG);
        return data ? JSON.parse(data) : {};
    },

    getCart() {
        const data = localStorage.getItem(this.KEYS.CART);
        return data ? JSON.parse(data) : [];
    },

    getOrders() {
        const data = localStorage.getItem(this.KEYS.ORDERS);
        return data ? JSON.parse(data) : [];
    },

    // Setters
    saveProducts(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    },

    saveCategories(categories) {
        localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
    },

    saveConfig(config) {
        localStorage.setItem(this.KEYS.CONFIG, JSON.stringify(config));
    },

    saveCart(cart) {
        localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
    },

    saveOrders(orders) {
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    },

    // Product operations
    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === parseInt(id));
    },

    getProductsByCategory(categoryId) {
        const products = this.getProducts();
        return products.filter(p => p.category === categoryId);
    },

    getPopularProducts(limit = 4) {
        const products = this.getProducts();
        return products.filter(p => p.popular && p.available).slice(0, limit);
    },

    addProduct(product) {
        const products = this.getProducts();
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        product.id = newId;
        products.push(product);
        this.saveProducts(products);
        return newId;
    },

    updateProduct(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct, id: parseInt(id) };
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== parseInt(id));
        this.saveProducts(filtered);
    },

    // Category operations
    getCategoryById(id) {
        const categories = this.getCategories();
        return categories.find(c => c.id === id);
    },

    addCategory(category) {
        const categories = this.getCategories();
        categories.push(category);
        this.saveCategories(categories);
    },

    updateCategory(id, updatedCategory) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            // Update category in all products if ID changed
            if (id !== updatedCategory.id) {
                const products = this.getProducts();
                products.forEach(p => {
                    if (p.category === id) {
                        p.category = updatedCategory.id;
                    }
                });
                this.saveProducts(products);
            }
            categories[index] = { ...updatedCategory };
            this.saveCategories(categories);
            return true;
        }
        return false;
    },

    deleteCategory(id) {
        const categories = this.getCategories();
        const filtered = categories.filter(c => c.id !== id);
        this.saveCategories(filtered);
    },

    // Order operations
    addOrder(order) {
        const orders = this.getOrders();
        const newId = Date.now();
        order.id = newId;
        order.date = new Date().toISOString();
        order.status = 'new';
        orders.unshift(order);
        this.saveOrders(orders);
        return newId;
    },

    // Search and filter
    searchProducts(query, filters = {}) {
        let products = this.getProducts();

        // Text search
        if (query) {
            const lowerQuery = query.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description?.toLowerCase().includes(lowerQuery) ||
                p.brand?.toLowerCase().includes(lowerQuery)
            );
        }

        // Category filter
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }

        // Price filter
        if (filters.priceMin) {
            products = products.filter(p => p.price >= parseInt(filters.priceMin));
        }
        if (filters.priceMax) {
            products = products.filter(p => p.price <= parseInt(filters.priceMax));
        }

        // Condition filter
        if (filters.condition && filters.condition.length > 0) {
            products = products.filter(p => filters.condition.includes(p.condition));
        }

        // Brand filter
        if (filters.brand && filters.brand.length > 0) {
            products = products.filter(p => filters.brand.includes(p.brand));
        }

        // Year filter
        if (filters.year && filters.year.length > 0) {
            products = products.filter(p => filters.year.includes(p.year));
        }

        // Only available
        if (filters.available) {
            products = products.filter(p => p.available);
        }

        return products;
    },

    // Get shop info
    getShopInfo() {
        const config = this.getConfig();
        return config.shop || {};
    },

    // Get delivery settings
    getDeliverySettings() {
        const config = this.getConfig();
        return config.delivery || {};
    },

    // Export all data
    exportAllData() {
        return {
            products: this.getProducts(),
            categories: this.getCategories(),
            config: this.getConfig(),
            orders: this.getOrders(),
            exportDate: new Date().toISOString()
        };
    },

    // Import all data
    importAllData(data) {
        if (data.products) this.saveProducts(data.products);
        if (data.categories) this.saveCategories(data.categories);
        if (data.config) this.saveConfig(data.config);
        if (data.orders) this.saveOrders(data.orders);
    },

    // Reset to defaults
    resetToDefaults() {
        localStorage.removeItem(this.KEYS.PRODUCTS);
        localStorage.removeItem(this.KEYS.CATEGORIES);
        localStorage.removeItem(this.KEYS.CONFIG);
        this.init();
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();
});

// Helper function to format price
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Helper function to truncate text
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
