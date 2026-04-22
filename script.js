document.addEventListener('DOMContentLoaded', () => {
    // --- CMS Integration (Load Data from Mock DB) ---
    const defaultSettings = {
        heroTitle: 'BASKET',
        heroHighlight: 'XA',
        heroSubtitle: 'الأناقة الإيطالية تلتقي بالجرأة. تصميم عصري يجمع بين الأناقة والراحة المطلقة.',
        oldPrice: '3600 د.ج',
        newPrice: '2800 د.ج'
    };

    const defaultProducts = [
        { id: 'prod_1', name: 'أسود وأصفر', colorHex: '#ffd700', img: 'assets/shoe_yellow_black.png' },
        { id: 'prod_2', name: 'أسود وأحمر', colorHex: '#ff0000', img: 'assets/shoe_red_black.png' },
        { id: 'prod_3', name: 'رمادي وأزرق', colorHex: '#4169e1', img: 'assets/shoe_grey_blue.png' }
    ];

    // Read or set defaults
    const settings = JSON.parse(localStorage.getItem('xa_settings')) || defaultSettings;
    const products = JSON.parse(localStorage.getItem('xa_products')) || defaultProducts;

    // 1. Inject Settings into Text Elements
    if (document.getElementById('dyn-hero-title')) {
        document.getElementById('dyn-hero-title').textContent = settings.heroTitle;
        document.getElementById('dyn-hero-highlight').textContent = settings.heroHighlight;
        document.getElementById('dyn-hero-subtitle').textContent = settings.heroSubtitle;
        document.getElementById('dyn-old-price').textContent = settings.oldPrice;
        document.getElementById('dyn-new-price').textContent = settings.newPrice;
        document.getElementById('dyn-summary-price').textContent = settings.newPrice;
        document.getElementById('dyn-total-price').textContent = settings.newPrice + ' + سعر التوصيل';
    }

    // 2. Inject Products into Grid
    const productsGrid = document.getElementById('dyn-products-grid');
    const colorSelector = document.getElementById('dyn-color-selector');
    
    if (productsGrid && colorSelector) {
        productsGrid.innerHTML = '';
        colorSelector.innerHTML = '';

        products.forEach((prod, index) => {
            // Build Product Card
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${prod.img}" alt="${prod.name}" class="product-img" onerror="this.src='https://via.placeholder.com/250'">
                <h3 class="product-name">${prod.name}</h3>
            `;
            productsGrid.appendChild(card);

            // Build Color Radio Option
            const label = document.createElement('label');
            label.className = 'color-option';
            label.innerHTML = `
                <input type="radio" name="color" value="${prod.id}" ${index === 0 ? 'checked' : ''}>
                <span class="color-label">
                    <span class="color-dot" style="background-color: ${prod.colorHex}; border: 1px solid #ccc;"></span>
                    ${prod.name}
                </span>
            `;
            colorSelector.appendChild(label);
        });
    }
    // --- End CMS Integration ---

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Size selector logic
    const sizeBtns = document.querySelectorAll('.size-btn');
    const selectedSizeInput = document.getElementById('selected-size');

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            sizeBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update hidden input value
            selectedSizeInput.value = this.getAttribute('data-size');
        });
    });

    // Form submission
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const province = document.getElementById('province').value;
        const address = document.getElementById('address').value;
        const size = selectedSizeInput.value;
        const color = document.querySelector('input[name="color"]:checked').value;
        const delivery = document.querySelector('input[name="delivery"]:checked').value;
        
        if (fullName && phone && province && address) {
            
            // --- Save to Mock Database (LocalStorage) ---
            const newOrder = {
                id: Math.random().toString(36).substring(2, 10), // Generate random ID
                fullName: fullName,
                phone: phone,
                province: province,
                address: address,
                size: size,
                color: color,
                delivery: delivery,
                date: new Date().toISOString(),
                status: 'pending' // Default status
            };

            let orders = JSON.parse(localStorage.getItem('xa_orders') || '[]');
            orders.push(newOrder);
            localStorage.setItem('xa_orders', JSON.stringify(orders));
            // -------------------------------------------

            alert('تم تأكيد طلبك بنجاح! سنتصل بك قريباً.');
            this.reset();
            // Reset custom selectors
            sizeBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('.size-btn[data-size="41"]').classList.add('active');
            selectedSizeInput.value = '41';
        } else {
            alert('الرجاء ملء جميع الحقول المطلوبة.');
        }
    });
});
