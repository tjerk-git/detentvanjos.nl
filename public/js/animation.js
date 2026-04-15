document.addEventListener('DOMContentLoaded', () => {
    const words = [
        'huwelijk',
        'teamuitje',
        'festival',
        'familiedag',
        'buurtfeestje',
        'kerkdienst'
    ];

    const changingText = document.getElementById('changing-text');
    let currentIndex = 0;

    // Function to split text into spans
    const splitText = (element) => {
        const text = element.innerText;
        element.innerHTML = text
            .split('')
            .map(char => `<span style="display:inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');
        return element.querySelectorAll('span');
    };

    // Initial split
    let chars = splitText(changingText);

    const animateText = () => {
        const tl = gsap.timeline();

        // Animate out
        tl.to(chars, {
            duration: 0.5,
            y: -20,
            opacity: 0,
            stagger: 0.05,
            ease: "power2.in",
            onComplete: () => {
                // Change text
                currentIndex = (currentIndex + 1) % words.length;
                changingText.innerText = words[currentIndex];

                // Re-split new text
                chars = splitText(changingText);

                // Set initial state for animation in
                gsap.set(chars, { y: 20, opacity: 0 });

                // Animate in
                gsap.to(chars, {
                    duration: 0.5,
                    y: 0,
                    opacity: 1,
                    stagger: 0.05,
                    ease: "back.out(1.7)"
                });
            }
        });
    };

    // Start animation loop every 3 seconds
    setInterval(animateText, 3000);

    // Carousel Logic
    const container = document.querySelector('.polaroid-container');
    const prevBtn = document.querySelector('.nav-button.prev');
    const nextBtn = document.querySelector('.nav-button.next');

    if (container && prevBtn && nextBtn) {
        const getScrollAmount = () => {
            const firstPolaroid = container.querySelector('.polaroid');
            if (firstPolaroid) {
                const width = firstPolaroid.offsetWidth;
                const style = window.getComputedStyle(container);
                const gap = parseInt(style.columnGap) || parseInt(style.gap) || 0;
                return width + gap;
            }
            return 350; // Fallback
        };

        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });
    }

    // Modal Logic
    const triggers = document.querySelectorAll('[data-micromodal-trigger]');
    const buildModal = (trigger) => {
        const modalId = trigger.getAttribute('data-micromodal-trigger');
        const modal = document.getElementById(modalId);

        if (!modal) return;

        const closeButtons = modal.querySelectorAll('[data-micromodal-close]');

        const openModal = () => {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
        };

        const closeModal = () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        };

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });

        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal__overlay')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });
    };

    triggers.forEach(trigger => buildModal(trigger));

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxCaption = lightbox.querySelector('.lightbox__caption');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const lightboxClose = lightbox.querySelector('.lightbox__close');
    const lightboxPrev = lightbox.querySelector('.lightbox__prev');
    const lightboxNext = lightbox.querySelector('.lightbox__next');
    const polaroids = document.querySelectorAll('.polaroid');
    
    let currentImageIndex = 0;
    const images = Array.from(polaroids).map(polaroid => {
        const img = polaroid.querySelector('img');
        const caption = polaroid.querySelector('figcaption');
        return {
            src: img.getAttribute('data-large') || img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            caption: caption ? caption.textContent : ''
        };
    });

    const openLightbox = (index) => {
        currentImageIndex = index;
        updateLightboxContent();
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const updateLightboxContent = () => {
        const image = images[currentImageIndex];
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = image.caption;
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    };

    const showNextImage = () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxContent();
    };

    const showPrevImage = () => {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxContent();
    };

    // Add click handlers to polaroids
    polaroids.forEach((polaroid, index) => {
        polaroid.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(index);
        });
        
        // Add keyboard accessibility
        polaroid.setAttribute('tabindex', '0');
        polaroid.setAttribute('role', 'button');
        polaroid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    // Lightbox event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevImage);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }

    // Close on overlay click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox.querySelector('.lightbox__overlay')) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });
});
