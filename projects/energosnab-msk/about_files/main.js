/* =========================================
   ENERGOSNAB v12 — MAIN JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNav();
    initReveal();
    initCounters();
    initCatalogDrag();
    initPhoneMask();
    initCookie();
    initMagnetic();
    initParallax();
});

/* ===================== CUSTOM CURSOR ===================== */
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower || window.innerWidth < 769) return;

    let cx = 0, cy = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
        cx = e.clientX;
        cy = e.clientY;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
    });

    function followLoop() {
        fx += (cx - fx) * 0.12;
        fy += (cy - fy) * 0.12;
        follower.style.left = fx + 'px';
        follower.style.top = fy + 'px';
        requestAnimationFrame(followLoop);
    }
    followLoop();

    // Hover effects
    const hovers = document.querySelectorAll('a, button, .cat-item, .proj-slide, .sol-card');
    hovers.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}

/* ===================== MAGNETIC BUTTONS ===================== */
function initMagnetic() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

/* ===================== PARALLAX ===================== */
function initParallax() {
    if (window.innerWidth < 769) return;
    const items = document.querySelectorAll('.parallax-img');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        items.forEach(item => {
            const speed = item.dataset.speed || 1;
            const y = scrollY * speed * 0.03;
            item.style.transform = `translateY(${y}px)`;
        });
    }, { passive: true });
}

/* ===================== NAVBAR ===================== */
function initNav() {
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            closeNav();
            const top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

function toggleNav() {
    document.getElementById('navLinks').classList.toggle('open');
    document.getElementById('burger').classList.toggle('active');
}
function closeNav() {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('burger').classList.remove('active');
}

/* ===================== SCROLL REVEAL ===================== */
function initReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.appear, .curtain-reveal').forEach(el => observer.observe(el));
}

/* ===================== COUNTER ANIMATION ===================== */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const to = parseInt(el.dataset.to);
            const format = el.dataset.format;
            animateCounter(el, to, format);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el, to, format) {
    const duration = 2800;
    const start = performance.now();

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic — ровный набор без резкого финала
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * to);

        if (format === 'short') {
            if (current >= 1000000) {
                el.textContent = (current / 1000000).toFixed(1) + ' млн';
            } else if (current >= 1000) {
                el.textContent = Math.round(current / 1000) + ' тыс';
            } else {
                el.textContent = current;
            }
        } else {
            el.textContent = current.toLocaleString('ru-RU');
        }

        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

/* ===================== CATALOG DRAG SCROLL ===================== */
function initCatalogDrag() {
    const track = document.getElementById('catalogTrack');
    if (!track) return;

    let isDown = false, startX, scrollLeft;

    track.parentElement.addEventListener('mousedown', e => {
        isDown = true;
        startX = e.pageX - track.parentElement.offsetLeft;
        scrollLeft = track.parentElement.scrollLeft;
        track.parentElement.style.cursor = 'grabbing';
    });
    track.parentElement.addEventListener('mouseleave', () => {
        isDown = false;
        track.parentElement.style.cursor = '';
    });
    track.parentElement.addEventListener('mouseup', () => {
        isDown = false;
        track.parentElement.style.cursor = '';
    });
    track.parentElement.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.parentElement.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.parentElement.scrollLeft = scrollLeft - walk;
    });
}

/* ===================== PHONE MASK ===================== */
function initPhoneMask() {
    document.querySelectorAll('.phone-mask').forEach(input => {
        input.addEventListener('input', function () {
            let val = this.value.replace(/\D/g, '');
            if (!val.length) { this.value = ''; return; }
            if (val[0] === '8') val = '7' + val.slice(1);
            if (val[0] !== '7') val = '7' + val;
            let f = '+7';
            if (val.length > 1) f += ' (' + val.slice(1, 4);
            if (val.length > 4) f += ') ' + val.slice(4, 7);
            if (val.length > 7) f += '-' + val.slice(7, 9);
            if (val.length > 9) f += '-' + val.slice(9, 11);
            this.value = f;
        });
        input.addEventListener('focus', function () {
            if (!this.value) this.value = '+7';
        });
        input.addEventListener('blur', function () {
            if (this.value === '+7') this.value = '';
        });
    });
}

/* ===================== MODAL ===================== */
function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.remove('open');
        document.body.style.overflow = '';
        const form = m.querySelector('form');
        const ok = m.querySelector('.modal-ok');
        if (form) { form.style.display = ''; form.reset(); }
        if (ok) ok.classList.remove('show');
    }
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-wrap.open').forEach(m => closeModal(m.id));
    }
});

/* ===================== FORM SUBMIT ===================== */
function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const fd = new FormData(form);
    fd.append('form_type', 'request');

    fetch('api/handler.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) showFormOk(form);
            else alert(data.message || 'Ошибка');
        })
        .catch(() => showFormOk(form));
}

function showFormOk(form) {
    form.style.display = 'none';
    const ok = form.parentElement.querySelector('.modal-ok');
    if (ok) ok.classList.add('show');
}

/* ===================== COOKIE ===================== */
function initCookie() {
    if (!localStorage.getItem('cookieOk')) {
        setTimeout(() => {
            const c = document.getElementById('cookie');
            if (c) c.classList.add('show');
        }, 2500);
    }
}
function acceptCookie() {
    localStorage.setItem('cookieOk', '1');
    const c = document.getElementById('cookie');
    if (c) c.classList.remove('show');
}
