/**
 * Main JavaScript Module
 * Handles homepage functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initMobileMenu();
    
    // Load and display categories
    loadCategories();
    
    // Load and display popular products
    loadPopularProducts();
    
    // Load shop info
    loadShopInfo();
});

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });
    }
}

// Load Categories
function loadCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    const categories = DataManager.getCategories();
    
    grid.innerHTML = categories.map(cat => `
        <a href="catalog.html?category=${cat.id}" class="category-card">
            <div class="category-icon">${cat.icon || '📦'}</div>
            <h3>${cat.name}</h3>
            <p>${cat.description || ''}</p>
            <span class="category-link">Смотреть <i class="fas fa-arrow-right"></i></span>
        </a>
    `).join('');
}

// Load Popular Products
function loadPopularProducts() {
    const grid = document.getElementById('popularProducts');
    if (!grid) return;
    
    const products = DataManager.getPopularProducts(4);
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="no-products">Пока нет популярных товаров</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => createProductCard(product)).join('');
    
    // Add event listeners to add-to-cart buttons
    grid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(btn.dataset.id);
            const product = DataManager.getProductById(productId);
            if (product) {
                Cart.add(product);
            }
        });
    });
}

// Create Product Card HTML
function createProductCard(product) {
    const category = DataManager.getCategoryById(product.category);
    const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    
    return `
        <div class="product-card">
            <a href="product.html?id=${product.id}" class="product-link">
                <div class="product-image">
                    <img src="${product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                         alt="${product.name}" loading="lazy">
                    ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
                    ${product.popular ? '<span class="product-badge popular">Популярное</span>' : ''}
                </div>
                <div class="product-info">
                    <span class="product-category">${category?.name || product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-specs">
                        ${product.condition ? `<span><i class="fas fa-star"></i> ${product.condition}</span>` : ''}
                        ${product.year ? `<span><i class="fas fa-calendar"></i> ${product.year}</span>` : ''}
                    </div>
                    <div class="product-price">
                        <span class="current-price">${formatPrice(product.price)}</span>
                        ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                    </div>
                </div>
            </a>
            <button class="add-to-cart" data-id="${product.id}">
                <i class="fas fa-shopping-cart"></i> В корзину
            </button>
        </div>
    `;
}

// Load Shop Info
function loadShopInfo() {
    const config = DataManager.getConfig();
    const shop = config.shop || {};
    
    // Update footer phone
    const footerPhone = document.getElementById('footerPhone');
    if (footerPhone && shop.phone) {
        footerPhone.textContent = shop.phone;
    }
    
    // Update footer address
    const footerAddress = document.getElementById('footerAddress');
    if (footerAddress && shop.address) {
        footerAddress.textContent = shop.address;
    }
}
