document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileWrapper = document.querySelector('.mobile-menu-wrapper');
    
    menuButton.addEventListener('click', function() {
        mobileWrapper.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav')) {
            mobileWrapper.classList.remove('active');
        }
    });
});

