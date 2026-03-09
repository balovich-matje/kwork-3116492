/**
 * Admin Panel Module
 * Handles admin functionality
 */

// Current editing state
let editingProductId = null;
let editingCategoryId = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for DataManager to be ready
    setTimeout(() => {
        initTabs();
        loadProducts();
        loadCategories();
        loadContactsForm();
        loadDeliveryForm();
        initProductForm();
        initCategoryForm();
        initExportImport();
    }, 100);
});

// Tab navigation
function initTabs() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show tab
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId + 'Tab').classList.add('active');
        });
    });
}

// Load products table
function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    const products = DataManager.getProducts();
    const categories = DataManager.getCategories();
    
    tbody.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.category);
        return `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.images?.[0] ? '../' + product.images[0] : 'https://via.placeholder.com/50x50?text=No+Image'}" alt="" width="50" height="50" style="object-fit: cover; border-radius: 6px;"></td>
                <td>${product.name}</td>
                <td>${category?.name || product.category}</td>
                <td>${formatPrice(product.price)}</td>
                <td><span class="badge badge-${getConditionBadge(product.condition)}">${product.condition}</span></td>
                <td><span class="badge badge-${product.available ? 'success' : 'danger'}">${product.available ? 'Да' : 'Нет'}</span></td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load categories table
function loadCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    const categories = DataManager.getCategories();
    const products = DataManager.getProducts();
    
    tbody.innerHTML = categories.map(cat => {
        const count = products.filter(p => p.category === cat.id).length;
        return `
            <tr>
                <td>${cat.id}</td>
                <td style="font-size: 1.5rem;">${cat.icon || ''}</td>
                <td>${cat.name}</td>
                <td>${cat.description || ''}</td>
                <td>${count}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editCategory('${cat.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteCategory('${cat.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load contacts form
function loadContactsForm() {
    const config = DataManager.getConfig();
    const shop = config.shop || {};
    
    document.getElementById('shopName') && (document.getElementById('shopName').value = shop.name || '');
    document.getElementById('shopTagline') && (document.getElementById('shopTagline').value = shop.tagline || '');
    document.getElementById('shopPhone1') && (document.getElementById('shopPhone1').value = shop.phone || '');
    document.getElementById('shopPhone2') && (document.getElementById('shopPhone2').value = shop.phone2 || '');
    document.getElementById('shopEmail') && (document.getElementById('shopEmail').value = shop.email || '');
    document.getElementById('shopAddress') && (document.getElementById('shopAddress').value = shop.address || '');
    
    // Working hours
    const wh = shop.workingHours || {};
    document.getElementById('whMonday') && (document.getElementById('whMonday').value = wh.monday || '');
    document.getElementById('whTuesday') && (document.getElementById('whTuesday').value = wh.tuesday || '');
    document.getElementById('whWednesday') && (document.getElementById('whWednesday').value = wh.wednesday || '');
    document.getElementById('whThursday') && (document.getElementById('whThursday').value = wh.thursday || '');
    document.getElementById('whFriday') && (document.getElementById('whFriday').value = wh.friday || '');
    document.getElementById('whSaturday') && (document.getElementById('whSaturday').value = wh.saturday || '');
    document.getElementById('whSunday') && (document.getElementById('whSunday').value = wh.sunday || '');
    
    // Social
    const social = shop.social || {};
    document.getElementById('socialVk') && (document.getElementById('socialVk').value = social.vk || '');
    document.getElementById('socialTelegram') && (document.getElementById('socialTelegram').value = social.telegram || '');
    document.getElementById('socialWhatsapp') && (document.getElementById('socialWhatsapp').value = social.whatsapp || '');
    
    // Form submit
    const form = document.getElementById('contactsForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveContacts();
        });
    }
}

// Save contacts
function saveContacts() {
    const config = DataManager.getConfig();
    
    config.shop = {
        name: document.getElementById('shopName').value,
        tagline: document.getElementById('shopTagline').value,
        phone: document.getElementById('shopPhone1').value,
        phone2: document.getElementById('shopPhone2').value,
        email: document.getElementById('shopEmail').value,
        address: document.getElementById('shopAddress').value,
        workingHours: {
            monday: document.getElementById('whMonday').value,
            tuesday: document.getElementById('whTuesday').value,
            wednesday: document.getElementById('whWednesday').value,
            thursday: document.getElementById('whThursday').value,
            friday: document.getElementById('whFriday').value,
            saturday: document.getElementById('whSaturday').value,
            sunday: document.getElementById('whSunday').value
        },
        social: {
            vk: document.getElementById('socialVk').value,
            telegram: document.getElementById('socialTelegram').value,
            whatsapp: document.getElementById('socialWhatsapp').value
        }
    };
    
    DataManager.saveConfig(config);
    showToast('Контактная информация сохранена', 'success');
}

// Load delivery form
function loadDeliveryForm() {
    const config = DataManager.getConfig();
    const delivery = config.delivery || {};
    
    // Zones
    const zonesContainer = document.getElementById('deliveryZones');
    if (zonesContainer) {
        const zones = delivery.zones || [];
        zonesContainer.innerHTML = zones.map((zone, i) => `
            <div class="zone-row">
                <input type="text" placeholder="Название зоны" value="${zone.name}" class="zone-name">
                <input type="number" placeholder="Макс. км" value="${zone.maxDistance}" class="zone-max">
                <input type="number" placeholder="₽/км" value="${zone.pricePerKm}" class="zone-price">
                <input type="number" placeholder="Базовая цена" value="${zone.basePrice}" class="zone-base">
                <button type="button" class="btn-icon btn-delete" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Floor prices
    const fp = delivery.floorPrices || {};
    document.getElementById('elevatorPrice') && (document.getElementById('elevatorPrice').value = fp.withElevator || 0);
    document.getElementById('floorPricePerFloor') && (document.getElementById('floorPricePerFloor').value = fp.withoutElevator?.perFloor || 200);
    document.getElementById('baseFloor') && (document.getElementById('baseFloor').value = fp.withoutElevator?.baseFloor || 3);
    
    // Assembly prices
    const ap = delivery.assembly || {};
    document.getElementById('assemblyRefrigerator') && (document.getElementById('assemblyRefrigerator').value = ap.refrigerator || 1500);
    document.getElementById('assemblyWashing') && (document.getElementById('assemblyWashing').value = ap.washingMachine || 2000);
    document.getElementById('assemblyDishwasher') && (document.getElementById('assemblyDishwasher').value = ap.dishwasher || 2000);
    document.getElementById('assemblyOven') && (document.getElementById('assemblyOven').value = ap.oven || 1500);
    document.getElementById('assemblyMicrowave') && (document.getElementById('assemblyMicrowave').value = ap.microwave || 500);
    document.getElementById('assemblyVacuum') && (document.getElementById('assemblyVacuum').value = ap.vacuumCleaner || 0);
    
    // Form submit
    const form = document.getElementById('deliveryForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveDelivery();
        });
    }
}

// Save delivery settings
function saveDelivery() {
    const config = DataManager.getConfig();
    
    // Collect zones
    const zones = [];
    document.querySelectorAll('.zone-row').forEach(row => {
        zones.push({
            name: row.querySelector('.zone-name').value,
            maxDistance: parseInt(row.querySelector('.zone-max').value) || 0,
            pricePerKm: parseInt(row.querySelector('.zone-price').value) || 0,
            basePrice: parseInt(row.querySelector('.zone-base').value) || 0
        });
    });
    
    config.delivery = {
        zones: zones,
        floorPrices: {
            withElevator: parseInt(document.getElementById('elevatorPrice').value) || 0,
            withoutElevator: {
                perFloor: parseInt(document.getElementById('floorPricePerFloor').value) || 200,
                baseFloor: parseInt(document.getElementById('baseFloor').value) || 3
            }
        },
        assembly: {
            refrigerator: parseInt(document.getElementById('assemblyRefrigerator').value) || 0,
            washingMachine: parseInt(document.getElementById('assemblyWashing').value) || 0,
            dishwasher: parseInt(document.getElementById('assemblyDishwasher').value) || 0,
            oven: parseInt(document.getElementById('assemblyOven').value) || 0,
            microwave: parseInt(document.getElementById('assemblyMicrowave').value) || 0,
            vacuumCleaner: parseInt(document.getElementById('assemblyVacuum').value) || 0
        }
    };
    
    DataManager.saveConfig(config);
    showToast('Настройки доставки сохранены', 'success');
}

// Product form
function initProductForm() {
    // Add product button
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editingProductId = null;
            document.getElementById('productModalTitle').textContent = 'Добавить товар';
            document.getElementById('productForm').reset();
            document.getElementById('productSpecs').innerHTML = '';
            loadCategorySelect();
            openModal('productModal');
        });
    }
    
    // Add spec button
    const addSpecBtn = document.getElementById('addSpecBtn');
    if (addSpecBtn) {
        addSpecBtn.addEventListener('click', () => {
            const container = document.getElementById('productSpecs');
            const row = document.createElement('div');
            row.className = 'spec-row';
            row.innerHTML = `
                <input type="text" placeholder="Название" class="spec-key">
                <input type="text" placeholder="Значение" class="spec-value">
                <button type="button" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(row);
        });
    }
    
    // Form submit
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProduct();
        });
    }
}

// Load category select
function loadCategorySelect() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    const categories = DataManager.getCategories();
    select.innerHTML = categories.map(cat => `
        <option value="${cat.id}">${cat.name}</option>
    `).join('');
}

// Edit product
function editProduct(id) {
    editingProductId = id;
    const product = DataManager.getProductById(id);
    if (!product) return;
    
    document.getElementById('productModalTitle').textContent = 'Редактировать товар';
    loadCategorySelect();
    
    // Fill form
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productOldPrice').value = product.oldPrice || '';
    document.getElementById('productBrand').value = product.brand || '';
    document.getElementById('productYear').value = product.year || '';
    document.getElementById('productCondition').value = product.condition || 'Хорошее';
    document.getElementById('productPopular').checked = product.popular || false;
    document.getElementById('productAvailable').checked = product.available !== false;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.images?.[0] || '';
    
    // Fill specs
    const specsContainer = document.getElementById('productSpecs');
    specsContainer.innerHTML = '';
    if (product.specs) {
        Object.entries(product.specs).forEach(([key, value]) => {
            const row = document.createElement('div');
            row.className = 'spec-row';
            row.innerHTML = `
                <input type="text" placeholder="Название" value="${key}" class="spec-key">
                <input type="text" placeholder="Значение" value="${value}" class="spec-value">
                <button type="button" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            specsContainer.appendChild(row);
        });
    }
    
    openModal('productModal');
}

// Save product
function saveProduct() {
    // Collect specs
    const specs = {};
    document.querySelectorAll('.spec-row').forEach(row => {
        const key = row.querySelector('.spec-key').value;
        const value = row.querySelector('.spec-value').value;
        if (key && value) {
            specs[key] = value;
        }
    });
    
    const product = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        oldPrice: parseInt(document.getElementById('productOldPrice').value) || null,
        brand: document.getElementById('productBrand').value,
        year: parseInt(document.getElementById('productYear').value) || null,
        condition: document.getElementById('productCondition').value,
        popular: document.getElementById('productPopular').checked,
        available: document.getElementById('productAvailable').checked,
        description: document.getElementById('productDescription').value,
        images: document.getElementById('productImage').value ? 
            [document.getElementById('productImage').value] : 
            ['https://via.placeholder.com/400x400?text=No+Image'],
        specs: specs
    };
    
    if (editingProductId) {
        DataManager.updateProduct(editingProductId, product);
        showToast('Товар обновлен', 'success');
    } else {
        DataManager.addProduct(product);
        showToast('Товар добавлен', 'success');
    }
    
    closeModal('productModal');
    loadProducts();
}

// Delete product
function deleteProduct(id) {
    if (confirm('Удалить этот товар?')) {
        DataManager.deleteProduct(id);
        loadProducts();
        showToast('Товар удален', 'success');
    }
}

// Category form
function initCategoryForm() {
    const addBtn = document.getElementById('addCategoryBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editingCategoryId = null;
            document.getElementById('categoryModalTitle').textContent = 'Добавить категорию';
            document.getElementById('categoryForm').reset();
            openModal('categoryModal');
        });
    }
    
    const form = document.getElementById('categoryForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveCategory();
        });
    }
}

// Edit category
function editCategory(id) {
    editingCategoryId = id;
    const category = DataManager.getCategoryById(id);
    if (!category) return;
    
    document.getElementById('categoryModalTitle').textContent = 'Редактировать категорию';
    document.getElementById('categoryIdInput').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon || '';
    document.getElementById('categoryDescription').value = category.description || '';
    
    openModal('categoryModal');
}

// Save category
function saveCategory() {
    const category = {
        id: document.getElementById('categoryIdInput').value,
        name: document.getElementById('categoryName').value,
        icon: document.getElementById('categoryIcon').value,
        description: document.getElementById('categoryDescription').value
    };
    
    if (editingCategoryId) {
        DataManager.updateCategory(editingCategoryId, category);
        showToast('Категория обновлена', 'success');
    } else {
        DataManager.addCategory(category);
        showToast('Категория добавлена', 'success');
    }
    
    closeModal('categoryModal');
    loadCategories();
}

// Delete category
function deleteCategory(id) {
    const products = DataManager.getProducts().filter(p => p.category === id);
    if (products.length > 0) {
        alert('Нельзя удалить категорию, содержащую товары');
        return;
    }
    
    if (confirm('Удалить эту категорию?')) {
        DataManager.deleteCategory(id);
        loadCategories();
        showToast('Категория удалена', 'success');
    }
}

// Export/Import
function initExportImport() {
    // Export
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = DataManager.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `technobazar-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Данные экспортированы', 'success');
        });
    }
    
    // Import
    const importFile = document.getElementById('importFile');
    const importBtn = document.getElementById('importDataBtn');
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('Импорт заменит все текущие данные. Продолжить?')) {
                        DataManager.importAllData(data);
                        showToast('Данные импортированы', 'success');
                        setTimeout(() => location.reload(), 1000);
                    }
                } catch (err) {
                    showToast('Ошибка импорта: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        });
    }
    
    // JSON Editor
    const jsonEditor = document.getElementById('jsonEditor');
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    
    if (jsonEditor) {
        jsonEditor.value = JSON.stringify(DataManager.exportAllData(), null, 2);
    }
    
    if (saveJsonBtn && jsonEditor) {
        saveJsonBtn.addEventListener('click', () => {
            try {
                const data = JSON.parse(jsonEditor.value);
                DataManager.importAllData(data);
                showToast('Данные сохранены', 'success');
                setTimeout(() => location.reload(), 1000);
            } catch (err) {
                showToast('Ошибка JSON: ' + err.message, 'error');
            }
        });
    }
}

// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Helper functions
function getConditionBadge(condition) {
    const map = {
        'Новое': 'success',
        'Отличное': 'success',
        'Хорошее': 'warning',
        'Удовлетворительное': 'danger'
    };
    return map[condition] || 'warning';
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}
