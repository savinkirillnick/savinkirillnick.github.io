document.addEventListener('DOMContentLoaded', function () {

    // === Hero Carousel ===
    var carImages = [
        'img/cars/dargo_x.webp',
        'img/cars/m6.webp',
        'img/cars/jolion.webp'
    ];
    var el1 = document.getElementById('car-left');
    var el2 = document.getElementById('car-center');
    var el3 = document.getElementById('car-right');
    if (el1 && el2 && el3) {
        el1.src = carImages[0];
        el2.src = carImages[1];
        el3.src = carImages[2];
        var pos = [el1, el2, el3];

        function cycleCarousel() {
            var leftEl = pos[0];
            var centerEl = pos[1];
            var rightEl = pos[2];

            leftEl.className = 'car-slot car-center';
            centerEl.className = 'car-slot car-right';
            rightEl.className = 'car-slot car-off-right';

            setTimeout(function () {
                rightEl.className = 'car-slot car-off-left';
                void rightEl.offsetWidth;
                rightEl.className = 'car-slot car-left';
                pos = [rightEl, leftEl, centerEl];
            }, 900);
        }

        setInterval(cycleCarousel, 4000);
    }

    // === Parallax ===
    var parallaxLayers = document.querySelectorAll('.parallax-layer');
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                var hero = document.querySelector('.hero-section');
                if (!hero) { ticking = false; return; }
                var st = window.scrollY;
                var rect = hero.getBoundingClientRect();
                var heroTop = rect.top + st;
                var heroH = hero.offsetHeight;
                var winH = window.innerHeight;
                var progress = Math.max(-0.3, Math.min(1.3, (st - heroTop + winH) / (heroH + winH)));
                parallaxLayers.forEach(function (layer) {
                    var speed = parseFloat(layer.getAttribute('data-speed')) || 1;
                    var dir = layer.classList.contains('parallax-edge') ? 1 : -1;
                    var offset = (progress - 0.5) * 300 * (speed - 1) * dir;
                    layer.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // === Burger Menu ===
    var burgerBtn = document.getElementById('burger-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    var menuClose = document.getElementById('menu-close');

    function closeMenu() {
        mobileMenu.classList.remove('open');
        burgerBtn.classList.remove('open');
    }
    function toggleMenu() {
        mobileMenu.classList.toggle('open');
        burgerBtn.classList.toggle('open');
    }

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', toggleMenu);
        if (menuClose) menuClose.addEventListener('click', closeMenu);
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    }

    // === Models Dropdown ===
    var dropdownBtn = document.getElementById('models-dropdown-btn');
    var dropdownMenu = document.getElementById('models-dropdown-menu');
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
            dropdownBtn.querySelector('i').style.transform =
                dropdownMenu.classList.contains('hidden') ? '' : 'rotate(180deg)';
        });
        document.addEventListener('click', function () {
            dropdownMenu.classList.add('hidden');
            dropdownBtn.querySelector('i').style.transform = '';
        });
        dropdownMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                dropdownMenu.classList.add('hidden');
                dropdownBtn.querySelector('i').style.transform = '';
            });
        });
    }

    // === Card Swipers + Color Dots ===
    document.querySelectorAll('.card-swiper').forEach(function (swiperEl) {
        var targetId = swiperEl.getAttribute('data-target');
        var group = document.querySelector('.color-group[data-target="' + targetId + '"]');
        var dots = group ? group.querySelectorAll('.color-dot') : [];

        var swiper = new Swiper(swiperEl, {
            loop: false,
            slidesPerView: 1,
            speed: 400,
            on: {
                slideChange: function () {
                    dots.forEach(function (d) { d.classList.remove('active'); });
                    if (dots[this.realIndex]) dots[this.realIndex].classList.add('active');
                }
            }
        });

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                swiper.slideTo(i);
            });
        });
    });
});
