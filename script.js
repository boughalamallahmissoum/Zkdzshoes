document.addEventListener('DOMContentLoaded', () => {
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
        
        if (fullName && phone && province) {
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
