document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelectorAll('.nav-links');
    
    menuButton.addEventListener('click', function() {
        navLinks.forEach(nav => nav.classList.toggle('active'));
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav')) {
            navLinks.forEach(nav => nav.classList.remove('active'));
        }
    });
});