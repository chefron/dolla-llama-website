document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    const items = Array.from(carousel.querySelectorAll('.carousel-item'));
    let currentIndex = 0;

    function updateCarousel() {
        items.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next');
            
            if (index === currentIndex) {
                item.classList.add('active');
            } else if (index === (currentIndex - 1 + items.length) % items.length) {
                item.classList.add('prev');
            } else if (index === (currentIndex + 1) % items.length) {
                item.classList.add('next');
            }
        });
    }

    function goToNext() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    }

    function goToPrev() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    }

    // Initial setup
    updateCarousel();

    // Event listeners
    nextBtn.addEventListener('click', goToNext);
    prevBtn.addEventListener('click', goToPrev);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
    });

    // Drag/swipe detection
    let startX, isDragging = false;

    carousel.addEventListener('mousedown', (e) => {
        // Prevent dragging on iframes
        if (e.target.tagName === 'IFRAME') return;
        
        startX = e.pageX;
        isDragging = true;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const diffX = e.pageX - startX;
        if (Math.abs(diffX) > 50) {
            diffX > 0 ? goToPrev() : goToNext();
            isDragging = false;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
});