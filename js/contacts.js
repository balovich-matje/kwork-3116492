/**
 * Contacts Module
 * Handles contacts page
 */

document.addEventListener('DOMContentLoaded', () => {
    loadContactInfo();
    initContactForm();
});

// Load contact info from config
function loadContactInfo() {
    const config = DataManager.getConfig();
    const shop = config.shop || {};
    
    // Phone
    const phoneEl = document.getElementById('contactPhone');
    if (phoneEl && shop.phone) {
        phoneEl.textContent = shop.phone;
        phoneEl.href = `tel:${shop.phone.replace(/\s/g, '')}`;
    }
    
    // Phone 2
    const phone2El = document.getElementById('contactPhone2');
    if (phone2El && shop.phone2) {
        phone2El.textContent = shop.phone2;
        phone2El.href = `tel:${shop.phone2.replace(/\s/g, '')}`;
    }
    
    // Email
    const emailEl = document.getElementById('contactEmail');
    if (emailEl && shop.email) {
        emailEl.textContent = shop.email;
        emailEl.href = `mailto:${shop.email}`;
    }
    
    // Address
    const addressEl = document.getElementById('contactAddress');
    if (addressEl && shop.address) {
        addressEl.textContent = shop.address;
    }
    
    // Working hours
    const whEl = document.getElementById('workingHours');
    if (whEl && shop.workingHours) {
        const wh = shop.workingHours;
        whEl.innerHTML = `
            <li><span>Пн-Пт:</span> ${wh.monday || '09:00 - 20:00'}</li>
            <li><span>Сб:</span> ${wh.saturday || '10:00 - 18:00'}</li>
            <li><span>Вс:</span> ${wh.sunday || '10:00 - 16:00'}</li>
        `;
    }
    
    // Social links
    if (shop.social) {
        const vkEl = document.getElementById('socialVk');
        if (vkEl && shop.social.vk) {
            vkEl.href = shop.social.vk;
        }
        
        const tgEl = document.getElementById('socialTelegram');
        if (tgEl && shop.social.telegram) {
            tgEl.href = shop.social.telegram;
        }
        
        const waEl = document.getElementById('socialWhatsapp');
        if (waEl && shop.social.whatsapp) {
            waEl.href = shop.social.whatsapp;
        }
    }
    
    // Update map if coordinates available
    if (shop.mapCoordinates) {
        const mapFrame = document.getElementById('googleMap');
        if (mapFrame) {
            const { lat, lng } = shop.mapCoordinates;
            mapFrame.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDAwJzAwLjAiTiAzNMKwMDAnMDAuMCJF!5e0!3m2!1sru!2sru!4v1`;
        }
    }
}

// Initialize contact form
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        phone: document.getElementById('contactPhoneInput').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        date: new Date().toISOString()
    };
    
    // In a real app, send this to a server
    console.log('Contact form submitted:', formData);
    
    // Show success modal
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Reset form
    e.target.reset();
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal on background click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('contactModal');
    if (e.target === modal) {
        closeModal();
    }
});
