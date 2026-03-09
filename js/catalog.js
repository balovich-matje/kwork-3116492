/**
 * Catalog Module
 * Handles catalog page with filters and search
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize filters
    initFilters();
    
    // Load products
    loadProducts();
    
    // Initialize mobile filters
    initMobileFilters();
});

// State
let currentFilters = {
    query: '',
    category: '',
    priceMin: '',
    priceMax: '',
    condition: [],
    brand: [],
    year: [],
    sort: 'popular'
};

// Initialize filters
function initFilters() {
    // Get URL params
    const urlParams = new URLSearchParams(window.location.search);
    currentFilters.category = urlParams.get('category') || '';
    currentFilters.query = urlParams.get('search') || '';
    
    // Set search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput && currentFilters.query) {
        searchInput.value = currentFilters.query;
    }
    
    // Load filter options
    loadCategoryFilter();
    loadConditionFilter();
    loadBrandFilter();
    loadYearFilter();
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentFilters.query = e.target.value;
            loadProducts();
        }, 300));
    }
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentFilters.query = searchInput.value;
            loadProducts();
        });
    }
    
    // Price filters
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin) {
        priceMin.addEventListener('input', debounce(() => {
            currentFilters.priceMin = priceMin.value;
            loadProducts();
        }, 300));
    }
    
    if (priceMax) {
        priceMax.addEventListener('input', debounce(() => {
            currentFilters.priceMax = priceMax.value;
            loadProducts();
        }, 300));
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentFilters.sort = sortSelect.value;
            loadProducts();
        });
    }
    
    // Reset filters
    const resetBtn = document.getElementById('resetFilters');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    const resetHandler = () => {
        currentFilters = {
            query: '',
            category: '',
            priceMin: '',
            priceMax: '',
            condition: [],
            brand: [],
            year: [],
            sort: 'popular'
        };
        
        if (searchInput) searchInput.value = '';
        if (priceMin) priceMin.value = '';
        if (priceMax) priceMax.value = '';
        if (sortSelect) sortSelect.value = 'popular';
        
        // Uncheck all checkboxes
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        loadProducts();
    };
    
    if (resetBtn) resetBtn.addEventListener('click', resetHandler);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', resetHandler);
}

// Load category filter
function loadCategoryFilter() {
    const container = document.getElementById('categoryFilter');
    if (!container) return;
    
    const categories = DataManager.getCategories();
    
    container.innerHTML = categories.map(cat => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${cat.id}" 
                   ${currentFilters.category === cat.id ? 'checked' : ''}>
            <span>${cat.name}</span>
        </label>
    `).join('');
    
    // Event listeners
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            const checked = container.querySelectorAll('input:checked');
            currentFilters.category = checked.length === 1 ? checked[0].value : '';
            loadProducts();
        });
    });
}

// Load condition filter
function loadConditionFilter() {
    const container = document.getElementById('conditionFilter');
    if (!container) return;
    
    const config = DataManager.getConfig();
    const conditions = config.filters?.conditions || ['Отличное', 'Хорошее'];
    
    container.innerHTML = conditions.map(cond => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${cond}">
            <span>${cond}</span>
        </label>
    `).join('');
    
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            currentFilters.condition = Array.from(container.querySelectorAll('input:checked'))
                .map(cb => cb.value);
            loadProducts();
        });
    });
}

// Load brand filter
function loadBrandFilter() {
    const container = document.getElementById('brandFilter');
    if (!container) return;
    
    const config = DataManager.getConfig();
    const brands = config.filters?.brands || [];
    
    container.innerHTML = brands.map(brand => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${brand}">
            <span>${brand}</span>
        </label>
    `).join('');
    
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            currentFilters.brand = Array.from(container.querySelectorAll('input:checked'))
                .map(cb => cb.value);
            loadProducts();
        });
    });
}

// Load year filter
function loadYearFilter() {
    const container = document.getElementById('yearFilter');
    if (!container) return;
    
    const config = DataManager.getConfig();
    const years = config.filters?.years || [2026, 2025, 2024, 2023];
    
    container.innerHTML = years.map(year => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${year}">
            <span>${year}</span>
        </label>
    `).join('');
    
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            currentFilters.year = Array.from(container.querySelectorAll('input:checked'))
                .map(cb => parseInt(cb.value));
            loadProducts();
        });
    });
}

// Load and display products
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const countEl = document.getElementById('productsCount');
    const noResults = document.getElementById('noResults');
    
    if (!grid) return;
    
    // Get filtered products
    let products = DataManager.searchProducts(currentFilters.query, {
        category: currentFilters.category,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
        condition: currentFilters.condition,
        brand: currentFilters.brand,
        year: currentFilters.year,
        available: true
    });
    
    // Sort
    switch (currentFilters.sort) {
        case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            products.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        default:
            // Popular first
            products.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
    
    // Update count
    if (countEl) countEl.textContent = products.length;
    
    // Show/hide no results
    if (products.length === 0) {
        grid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        
        grid.innerHTML = products.map(product => createProductCard(product)).join('');
        
        // Add event listeners
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
}

// Create product card (reuse from main.js)
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

// Mobile filters
function initMobileFilters() {
    const toggleBtn = document.getElementById('filtersToggle');
    const sidebar = document.getElementById('filtersSidebar');
    const closeBtn = document.getElementById('closeFilters');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
