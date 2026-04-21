document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const tableBody = document.getElementById('orders-table-body');
    const noOrdersMsg = document.getElementById('no-orders-msg');
    
    // Stats Elements
    const totalOrdersCount = document.getElementById('total-orders-count');
    const pendingOrdersCount = document.getElementById('pending-orders-count');
    const shippedOrdersCount = document.getElementById('shipped-orders-count');
    const totalRevenue = document.getElementById('total-revenue');

    // --- Authentication (Mock) ---
    // Check if already logged in
    if (localStorage.getItem('admin_logged_in') === 'true') {
        showDashboard();
    }

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, verify credentials with backend. For now, accept any.
        localStorage.setItem('admin_logged_in', 'true');
        showDashboard();
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('admin_logged_in');
        dashboardScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    });

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        loadOrders();
    }

    // --- Order Management ---
    
    // Color Name Mapping
    const colorNames = {
        'yellow_black': 'أسود وأصفر',
        'red_black': 'أسود وأحمر',
        'grey_blue': 'رمادي وأزرق'
    };

    // Province Name Mapping
    const provinceNames = {
        '1': '16 - الجزائر',
        '2': '09 - البليدة',
        '3': '31 - وهران',
        '4': '25 - قسنطينة',
        '5': '23 - عنابة'
    };

    // Status Badge Classes
    const statusClasses = {
        'pending': 'status-pending',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };

    const statusTranslations = {
        'pending': 'قيد الانتظار',
        'shipped': 'تم الشحن',
        'delivered': 'تم التوصيل',
        'cancelled': 'ملغى'
    };

    function loadOrders() {
        // Fetch from LocalStorage (Mock DB)
        const orders = JSON.parse(localStorage.getItem('xa_orders') || '[]');
        
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            noOrdersMsg.style.display = 'block';
            tableBody.parentElement.style.display = 'none';
        } else {
            noOrdersMsg.style.display = 'none';
            tableBody.parentElement.style.display = 'table';
            
            let total = 0;
            let pending = 0;
            let shipped = 0;
            
            // Sort by newest first
            orders.sort((a, b) => new Date(b.date) - new Date(a.date));

            orders.forEach(order => {
                // Calculate Stats
                if (order.status !== 'cancelled') total += 2800; // Assuming fixed price for now
                if (order.status === 'pending') pending++;
                if (order.status === 'shipped') shipped++;

                const row = document.createElement('tr');
                
                // Format Date
                const dateObj = new Date(order.date);
                const dateStr = `${dateObj.getFullYear()}/${(dateObj.getMonth()+1).toString().padStart(2,'0')}/${dateObj.getDate().toString().padStart(2,'0')}`;
                
                row.innerHTML = `
                    <td>#${order.id.substring(0, 6).toUpperCase()}</td>
                    <td>${order.fullName}</td>
                    <td dir="ltr" style="text-align: right;">${order.phone}</td>
                    <td>${colorNames[order.color] || order.color} / مقاس ${order.size}</td>
                    <td>${provinceNames[order.province] || 'غير محدد'}</td>
                    <td>${dateStr}</td>
                    <td>
                        <span class="status-badge ${statusClasses[order.status] || 'status-pending'}">
                            ${statusTranslations[order.status] || 'قيد الانتظار'}
                        </span>
                    </td>
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

            // Update Stats UI
            totalOrdersCount.textContent = orders.length;
            pendingOrdersCount.textContent = pending;
            shippedOrdersCount.textContent = shipped;
            totalRevenue.textContent = `${total} د.ج`;

            // Add event listeners for status change
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', function() {
                    updateOrderStatus(this.getAttribute('data-id'), this.value);
                });
            });
        }
    }

    function updateOrderStatus(orderId, newStatus) {
        let orders = JSON.parse(localStorage.getItem('xa_orders') || '[]');
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex > -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('xa_orders', JSON.stringify(orders));
            // Reload table to reflect changes and stats
            loadOrders();
        }
    }

    // Refresh Button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        const btn = document.getElementById('refresh-btn');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
        setTimeout(() => {
            loadOrders();
            btn.innerHTML = '<i class="fa-solid fa-rotate"></i> تحديث';
        }, 500);
    });
});
