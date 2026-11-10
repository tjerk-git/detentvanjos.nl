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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let currentIndex = 0;

    const splitText = (text) => {
        changingText.textContent = '';
        return Array.from(text).map(char => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.textContent = char === ' ' ? '\u00a0' : char;
            changingText.appendChild(span);
            return span;
        });
    };

    const animateChars = (chars, keyframes, options) =>
        Promise.all(chars.map((el, i) =>
            el.animate(keyframes, { ...options, delay: i * 50, fill: 'both' }).finished
        ));

    const swapWord = async () => {
        if (reduceMotion.matches || document.hidden) return;
        const out = Array.from(changingText.children);
        await animateChars(out, [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-20px)', opacity: 0 }
        ], { duration: 500, easing: 'ease-in' });

        currentIndex = (currentIndex + 1) % words.length;
        changingText.setAttribute('aria-label', words[currentIndex]);
        const chars = splitText(words[currentIndex]);
        await animateChars(chars, [
            { transform: 'translateY(20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
    };

    splitText(changingText.textContent);
    setInterval(swapWord, 3000);

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
            document.body.style.overflow = 'hidden';
            const closeBtn = modal.querySelector('.modal__close');
            if (closeBtn) closeBtn.focus();
        };

        const closeModal = () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            trigger.focus();
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
