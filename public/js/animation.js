document.addEventListener('DOMContentLoaded', () => {
    const words = [
        'huwelijk,',
        'teamuitje,',
        'festival,',
        'familiedag,',
        'liefdesceremonie,',
        'buurtfeestje,',
        'kerkdienst,'
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
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -350, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: 350, behavior: 'smooth' });
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
});
