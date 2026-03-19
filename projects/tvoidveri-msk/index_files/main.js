/**
 * Tvoi Dveri - Main JavaScript
 * Premium door company website
 */

// ======================
// INITIALIZE ON LOAD
// ======================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    }

    // Initialize phone masks
    initPhoneMasks();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize header scroll effect
    initHeaderScroll();

    // Initialize smooth scroll for anchor links
    initSmoothScroll();

    // Initialize form validation
    initFormValidation();
});

// ======================
// PHONE MASK
// ======================
function initPhoneMasks() {
    if (typeof Inputmask !== 'undefined') {
        const phoneMask = new Inputmask('+7 (999) 999-99-99');
        const phoneInputs = document.querySelectorAll('.phone-mask');
        phoneInputs.forEach(input => {
            phoneMask.mask(input);
        });
    }
}

// ======================
// MOBILE MENU
// ======================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');

            // Animate icon
            const icon = menuBtn.querySelector('svg');
            if (mobileMenu.classList.contains('hidden')) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
            } else {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
            }
        });

        // Close menu when clicking on a link
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                const icon = menuBtn.querySelector('svg');
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
            });
        });
    }
}

// ======================
// HEADER SCROLL EFFECT
// ======================
function initHeaderScroll() {
    const header = document.getElementById('header');

    if (header) {
        let lastScroll = 0;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }
}

// ======================
// SMOOTH SCROLL
// ======================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ======================
// MODAL FUNCTIONS
// ======================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Re-initialize AOS for modal content
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                AOS.refresh();
            }, 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// ======================
// FORM VALIDATION
// ======================
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', function() {
                validateInput(this);
            });

            // Remove error on input
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const errorMsg = this.parentElement.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    input.classList.remove('error');
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Check if required and empty
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Это поле обязательно для заполнения';
    }

    // Validate phone
    if (input.type === 'tel' && value) {
        const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        if (!phonePattern.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный номер телефона';
        }
    }

    // Validate email
    if (input.type === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный email';
        }
    }

    // Validate name (only letters)
    if (input.name === 'name' && value) {
        const namePattern = /^[а-яА-ЯёЁa-zA-Z\s-]+$/;
        if (!namePattern.test(value)) {
            isValid = false;
            errorMessage = 'Имя может содержать только буквы';
        }
    }

    if (!isValid) {
        input.classList.add('error');
        input.style.borderColor = '#ef4444';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = errorMessage;
        input.parentElement.appendChild(errorDiv);
    }

    return isValid;
}

// ======================
// FORM SUBMISSION
// ======================
function submitForm(event, formType) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validate all inputs
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        return false;
    }

    // Disable submit button
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><span class="spinner"></span> Отправка...</span>';

    // Collect form data
    const formData = new FormData(form);
    formData.append('formType', formType);

    // Send to PHP handler
    fetch('send.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        if (data.success) {
            // Close current modal
            const currentModal = form.closest('.modal');
            if (currentModal) {
                closeModal(currentModal.id);
            }

            // Show success modal
            setTimeout(() => {
                openModal('successModal');
            }, 300);

            // Reset form
            form.reset();

            // Send analytics event (if needed)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'Form',
                    'event_label': formType
                });
            }
        } else {
            // Show error
            alert(data.message || 'Произошла ошибка. Попробуйте позже или позвоните нам.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        alert('Произошла ошибка при отправке формы. Пожалуйста, позвоните нам по телефону +7 (926) 568-86-82');
    });

    return false;
}

// ======================
// COUNTER ANIMATION
// ======================
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60; // 60 frames
    const duration = 2000; // 2 seconds
    const frameTime = duration / 60;

    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, frameTime);
}

// Trigger counter animation when in viewport
const observerOptions = {
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const target = parseInt(entry.target.dataset.count);
            animateCounter(entry.target, target);
        }
    });
}, observerOptions);

// Initialize counters
document.querySelectorAll('[data-count]').forEach(counter => {
    counterObserver.observe(counter);
});

// ======================
// LAZY LOAD IMAGES
// ======================
function initLazyLoad() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy load
initLazyLoad();

// ======================
// PARALLAX EFFECT
// ======================
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// Initialize parallax
initParallax();

// ======================
// VIEWPORT HEIGHT FIX (Mobile)
// ======================
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);

// ======================
// PRELOADER (Optional)
// ======================
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
            }, 300);
        }, 500);
    }
});

// ======================
// UTILITIES
// ======================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ======================
// CONSOLE MESSAGE
// ======================
console.log('%cТвои Двери', 'font-size: 24px; font-weight: bold; color: #1a3c34;');
console.log('%cСайт разработан с использованием современных технологий', 'font-size: 14px; color: #666;');
console.log('%cПо вопросам разработки: tvoidveri@mail.ru', 'font-size: 12px; color: #999;');

// ======================
// EXPORT FUNCTIONS (for global use)
// ======================
window.openModal = openModal;
window.closeModal = closeModal;
window.submitForm = submitForm;