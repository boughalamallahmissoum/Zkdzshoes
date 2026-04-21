document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Data Setup ---
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

    if (!localStorage.getItem('xa_settings')) {
        localStorage.setItem('xa_settings', JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem('xa_products')) {
        localStorage.setItem('xa_products', JSON.stringify(defaultProducts));
    }

    // --- UI Elements ---
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const pageTitle = document.getElementById('page-title');

    // Authentication (Mock)
    if (localStorage.getItem('admin_logged_in') === 'true') {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('admin_logged_in', 'true');
        showDashboard();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('admin_logged_in');
        dashboardScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    });

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        loadOrders();
        loadSettings();
        loadProducts();
    }

    // --- Tab Switching ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabViews = document.querySelectorAll('.tab-view');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            
            // Update active link
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');

            // Update page title
            pageTitle.textContent = this.textContent.trim();

            // Show target view
            tabViews.forEach(view => {
                view.style.display = view.id === targetId ? 'block' : 'none';
            });
        });
    });


    // --- Order Management ---
    const tableBody = document.getElementById('orders-table-body');
    const noOrdersMsg = document.getElementById('no-orders-msg');
    const totalOrdersCount = document.getElementById('total-orders-count');
    const pendingOrdersCount = document.getElementById('pending-orders-count');
    const shippedOrdersCount = document.getElementById('shipped-orders-count');
    const totalRevenue = document.getElementById('total-revenue');

    const provinceNames = {
        '1': '16 - الجزائر', '2': '09 - البليدة', '3': '31 - وهران',
        '4': '25 - قسنطينة', '5': '23 - عنابة'
    };

    const statusClasses = { 'pending': 'status-pending', 'shipped': 'status-shipped', 'delivered': 'status-delivered', 'cancelled': 'status-cancelled' };
    const statusTranslations = { 'pending': 'قيد الانتظار', 'shipped': 'تم الشحن', 'delivered': 'تم التوصيل', 'cancelled': 'ملغى' };

    function loadOrders() {
        const orders = JSON.parse(localStorage.getItem('xa_orders') || '[]');
        const products = JSON.parse(localStorage.getItem('xa_products') || '[]');
        
        // Build color name mapping from current products
        const colorNames = {};
        products.forEach(p => colorNames[p.id] = p.name);

        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            noOrdersMsg.style.display = 'block';
            tableBody.parentElement.style.display = 'none';
        } else {
            noOrdersMsg.style.display = 'none';
            tableBody.parentElement.style.display = 'table';
            
            let total = 0, pending = 0, shipped = 0;
            orders.sort((a, b) => new Date(b.date) - new Date(a.date));

            orders.forEach(order => {
                // Determine price from settings
                const settings = JSON.parse(localStorage.getItem('xa_settings'));
                const priceValue = parseInt(settings.newPrice.replace(/[^0-9]/g, '')) || 2800;

                if (order.status !== 'cancelled') total += priceValue;
                if (order.status === 'pending') pending++;
                if (order.status === 'shipped') shipped++;

                const row = document.createElement('tr');
                const dateObj = new Date(order.date);
                const dateStr = `${dateObj.getFullYear()}/${(dateObj.getMonth()+1).toString().padStart(2,'0')}/${dateObj.getDate().toString().padStart(2,'0')}`;
                
                row.innerHTML = `
                    <td>#${order.id.substring(0, 6).toUpperCase()}</td>
                    <td>${order.fullName}</td>
                    <td dir="ltr" style="text-align: right;">${order.phone}</td>
                    <td>${colorNames[order.color] || order.color} / مقاس ${order.size}</td>
                    <td>${provinceNames[order.province] || 'غير محدد'}</td>
                    <td>${dateStr}</td>
                    <td><span class="status-badge ${statusClasses[order.status]}">${statusTranslations[order.status]}</span></td>
                    <td>
                        <select class="status-select" data-id="${order.id}">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التوصيل</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>إلغاء الطلب</option>
                        </select>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            totalOrdersCount.textContent = orders.length;
            pendingOrdersCount.textContent = pending;
            shippedOrdersCount.textContent = shipped;
            totalRevenue.textContent = `${total} د.ج`;

            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', function() {
                    let ordersData = JSON.parse(localStorage.getItem('xa_orders') || '[]');
                    const orderIndex = ordersData.findIndex(o => o.id === this.getAttribute('data-id'));
                    if (orderIndex > -1) {
                        ordersData[orderIndex].status = this.value;
                        localStorage.setItem('xa_orders', JSON.stringify(ordersData));
                        loadOrders();
                    }
                });
            });
        }
    }

    document.getElementById('refresh-orders-btn').addEventListener('click', () => loadOrders());


    // --- CMS: Settings ---
    const settingsForm = document.getElementById('settings-form');
    
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('xa_settings'));
        document.getElementById('set-hero-title').value = settings.heroTitle;
        document.getElementById('set-hero-highlight').value = settings.heroHighlight;
        document.getElementById('set-hero-subtitle').value = settings.heroSubtitle;
        document.getElementById('set-old-price').value = settings.oldPrice;
        document.getElementById('set-new-price').value = settings.newPrice;
    }

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSettings = {
            heroTitle: document.getElementById('set-hero-title').value,
            heroHighlight: document.getElementById('set-hero-highlight').value,
            heroSubtitle: document.getElementById('set-hero-subtitle').value,
            oldPrice: document.getElementById('set-old-price').value,
            newPrice: document.getElementById('set-new-price').value
        };
        localStorage.setItem('xa_settings', JSON.stringify(newSettings));
        alert('تم حفظ الإعدادات بنجاح!');
        loadOrders(); // Refresh revenue calculation
    });


    // --- CMS: Products ---
    const productsTableBody = document.getElementById('products-table-body');
    const noProductsMsg = document.getElementById('no-products-msg');
    const addProductForm = document.getElementById('add-product-form');

    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('xa_products'));
        productsTableBody.innerHTML = '';

        if (products.length === 0) {
            noProductsMsg.style.display = 'block';
            productsTableBody.parentElement.style.display = 'none';
        } else {
            noProductsMsg.style.display = 'none';
            productsTableBody.parentElement.style.display = 'table';

            products.forEach(prod => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${prod.img}" class="prod-preview-img" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td>${prod.name}</td>
                    <td><span class="color-circle" style="background-color: ${prod.colorHex};"></span> ${prod.colorHex}</td>
                    <td><button class="btn btn-outline btn-sm delete-prod-btn" data-id="${prod.id}" style="color: var(--status-cancelled); border-color: var(--status-cancelled);"><i class="fa-solid fa-trash"></i></button></td>
                `;
                productsTableBody.appendChild(row);
            });

            // Delete logic
            document.querySelectorAll('.delete-prod-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (confirm('هل أنت متأكد من حذف هذا اللون؟')) {
                        const idToDelete = this.getAttribute('data-id');
                        let currentProducts = JSON.parse(localStorage.getItem('xa_products'));
                        currentProducts = currentProducts.filter(p => p.id !== idToDelete);
                        localStorage.setItem('xa_products', JSON.stringify(currentProducts));
                        loadProducts();
                    }
                });
            });
        }
    }

    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProd = {
            id: 'prod_' + Math.random().toString(36).substring(2, 9),
            name: document.getElementById('prod-name').value,
            colorHex: document.getElementById('prod-color').value,
            img: document.getElementById('prod-img').value
        };
        
        const products = JSON.parse(localStorage.getItem('xa_products') || '[]');
        products.push(newProd);
        localStorage.setItem('xa_products', JSON.stringify(products));
        
        addProductForm.reset();
        loadProducts();
    });

});
