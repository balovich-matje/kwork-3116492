/**
 * Product Detail Module
 * Handles product detail page
 */

document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
});

// Load product details
function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showProductNotFound();
        return;
    }
    
    const product = DataManager.getProductById(productId);
    
    if (!product) {
        showProductNotFound();
        return;
    }
    
    displayProduct(product);
    loadSimilarProducts(product);
}

// Display product
function displayProduct(product) {
    const container = document.getElementById('productDetail');
    const breadcrumbName = document.getElementById('breadcrumbProductName');
    const category = DataManager.getCategoryById(product.category);
    
    if (breadcrumbName) {
        breadcrumbName.textContent = product.name;
    }
    
    if (!container) return;
    
    const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    
    container.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                <img src="${product.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image'}" 
                     alt="${product.name}" id="mainImage">
                ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
            </div>
            ${product.images && product.images.length > 1 ? `
                <div class="thumbnail-list">
                    ${product.images.map((img, i) => `
                        <img src="${img}" alt="${product.name} - ${i + 1}" 
                             class="thumbnail ${i === 0 ? 'active' : ''}"
                             onclick="changeImage('${img}', this)">
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="product-details">
            <div class="product-header">
                <span class="product-category">${category?.name || product.category}</span>
                <h1>${product.name}</h1>
                <div class="product-meta">
                    ${product.condition ? `<span class="meta-item condition-${getConditionClass(product.condition)}">
                        <i class="fas fa-star"></i> ${product.condition}
                    </span>` : ''}
                    ${product.year ? `<span class="meta-item"><i class="fas fa-calendar"></i> ${product.year} г.</span>` : ''}
                    ${product.brand ? `<span class="meta-item"><i class="fas fa-tag"></i> ${product.brand}</span>` : ''}
                    <span class="meta-item ${product.available ? 'available' : 'unavailable'}">
                        <i class="fas fa-${product.available ? 'check' : 'times'}"></i>
                        ${product.available ? 'В наличии' : 'Нет в наличии'}
                    </span>
                </div>
            </div>
            
            <div class="product-price-block">
                <div class="price-main">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                ${discount > 0 ? `<p class="economy">Экономия: ${formatPrice(product.oldPrice - product.price)}</p>` : ''}
            </div>
            
            <div class="product-description">
                <h3>Описание</h3>
                <p>${product.description || 'Описание отсутствует'}</p>
            </div>
            
            ${product.specs && Object.keys(product.specs).length > 0 ? `
                <div class="product-specs-block">
                    <h3>Характеристики</h3>
                    <table class="specs-table">
                        ${Object.entries(product.specs).map(([key, value]) => `
                            <tr>
                                <td>${key}</td>
                                <td>${value}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            ` : ''}
            
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="qty-btn" onclick="changeQuantity(-1)">-</button>
                    <input type="number" value="1" min="1" max="10" id="quantityInput" readonly>
                    <button class="qty-btn" onclick="changeQuantity(1)">+</button>
                </div>
                <button class="btn btn-primary btn-lg add-to-cart-main" 
                        ${!product.available ? 'disabled' : ''}
                        data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    ${product.available ? 'В корзину' : 'Нет в наличии'}
                </button>
            </div>
            
            <div class="product-benefits">
                <div class="benefit-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>Гарантия 6 месяцев</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-truck"></i>
                    <span>Доставка от 500 ₽</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-tools"></i>
                    <span>Установка и подключение</span>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener
    const addBtn = container.querySelector('.add-to-cart-main');
    if (addBtn && product.available) {
        addBtn.addEventListener('click', () => {
            const qty = parseInt(document.getElementById('quantityInput').value) || 1;
            Cart.add(product, qty);
        });
    }
}

// Change main image
function changeImage(src, thumbnail) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = src;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Change quantity
function changeQuantity(delta) {
    const input = document.getElementById('quantityInput');
    if (!input) return;
    
    let value = parseInt(input.value) + delta;
    value = Math.max(1, Math.min(10, value));
    input.value = value;
}

// Get condition CSS class
function getConditionClass(condition) {
    const map = {
        'Новое': 'new',
        'Отличное': 'excellent',
        'Хорошее': 'good',
        'Удовлетворительное': 'fair'
    };
    return map[condition] || 'good';
}

// Load similar products
function loadSimilarProducts(currentProduct) {
    const container = document.getElementById('similarProducts');
    if (!container) return;
    
    const products = DataManager.getProducts()
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id && p.available)
        .slice(0, 4);
    
    if (products.length === 0) {
        container.parentElement.style.display = 'none';
        return;
    }
    
    container.innerHTML = products.map(product => createProductCard(product)).join('');
    
    // Add event listeners
    container.querySelectorAll('.add-to-cart').forEach(btn => {
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

// Create product card
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
                </div>
                <div class="product-info">
                    <span class="product-category">${category?.name || product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
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

// Show not found
function showProductNotFound() {
    const container = document.getElementById('productDetail');
    if (container) {
        container.innerHTML = `
            <div class="not-found">
                <i class="fas fa-search"></i>
                <h2>Товар не найден</h2>
                <p>Запрашиваемый товар не существует или был удален</p>
                <a href="catalog.html" class="btn btn-primary">Вернуться в каталог</a>
            </div>
        `;
    }
}
