
# Write the JavaScript file with proper state management, 8 states, no banned patterns
js_v2 = '''/* ============================================
   PULSE v2 — Kimi Design System
   Catalogue page shape. Clean state management.
   ============================================ */

(function() {
    'use strict';

    // ---- State ----
    const state = {
        menuOpen: false,
        modalOpen: null,
        countdownEnd: null,
        navScrolled: false,
        waVisible: false,
    };

    // ---- DOM refs ----
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // ---- Init ----
    document.addEventListener('DOMContentLoaded', () => {
        initCountdown();
        initIncomeSlider();
        initScrollEffects();
        initNavScroll();
        initStatsCounter();
        initFormStates();
        initFAQStates();
        initAccessibility();
    });

    /* ============================================
       COUNTDOWN TIMER
       ============================================ */
    function initCountdown() {
        const hoursEl = $('#hours');
        const minutesEl = $('#minutes');
        const secondsEl = $('#seconds');
        if (!hoursEl || !minutesEl || !secondsEl) return;

        // Set end time to 4h 37m 52s from now
        state.countdownEnd = Date.now() + ((4 * 3600) + (37 * 60) + 52) * 1000;

        function tick() {
            const remaining = Math.max(0, state.countdownEnd - Date.now());
            const h = Math.floor(remaining / 3600000);
            const m = Math.floor((remaining % 3600000) / 60000);
            const s = Math.floor((remaining % 60000) / 1000);

            hoursEl.textContent = String(h).padStart(2, '0');
            minutesEl.textContent = String(m).padStart(2, '0');
            secondsEl.textContent = String(s).padStart(2, '0');

            if (remaining <= 0) {
                state.countdownEnd = Date.now() + ((4 * 3600) + (37 * 60) + 52) * 1000;
            }
        }

        tick();
        setInterval(tick, 1000);
    }

    /* ============================================
       INCOME SLIDER
       ============================================ */
    function initIncomeSlider() {
        const slider = $('#incomeSlider');
        if (!slider) return;

        function update() {
            const sales = parseInt(slider.value, 10);
            const commission = 17;
            const daily = sales * commission;
            const monthly = daily * 30;
            const yearly = monthly * 12;

            const countEl = $('#referralCount');
            const dailyEl = $('#dailyIncome');
            const monthlyEl = $('#monthlyIncome');
            const yearlyEl = $('#yearlyIncome');

            if (countEl) countEl.textContent = sales;
            if (dailyEl) dailyEl.textContent = '₵' + daily.toLocaleString();
            if (monthlyEl) monthlyEl.textContent = '₵' + monthly.toLocaleString();
            if (yearlyEl) yearlyEl.textContent = '₵' + yearly.toLocaleString();
        }

        slider.addEventListener('input', update);
        update();
    }

    // Global for inline oninput
    window.updateIncome = function() {
        const slider = $('#incomeSlider');
        if (!slider) return;
        const sales = parseInt(slider.value, 10);
        const commission = 17;
        const daily = sales * commission;
        const monthly = daily * 30;
        const yearly = monthly * 12;

        const countEl = $('#referralCount');
        const dailyEl = $('#dailyIncome');
        const monthlyEl = $('#monthlyIncome');
        const yearlyEl = $('#yearlyIncome');

        if (countEl) countEl.textContent = sales;
        if (dailyEl) dailyEl.textContent = '₵' + daily.toLocaleString();
        if (monthlyEl) monthlyEl.textContent = '₵' + monthly.toLocaleString();
        if (yearlyEl) yearlyEl.textContent = '₵' + yearly.toLocaleString();
    };

    /* ============================================
       SCROLL EFFECTS
       ============================================ */
    function initScrollEffects() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        $$('.bundle-card, .partner-card, .testimonial, .step, .faq-item, .choice').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
            observer.observe(el);
        });

        // Add visible styles
        const style = document.createElement('style');
        style.textContent = '.is-visible { opacity: 1 !important; transform: translateY(0) !important; }';
        document.head.appendChild(style);
    }

    /* ============================================
       NAV SCROLL
       ============================================ */
    function initNavScroll() {
        const nav = $('#nav');
        if (!nav) return;

        function onScroll() {
            const scrolled = window.scrollY > 60;
            if (scrolled !== state.navScrolled) {
                state.navScrolled = scrolled;
                nav.classList.toggle('nav--scrolled', scrolled);
            }

            // Sticky WA visibility
            const wa = $('#stickyWa');
            if (wa) {
                const waVisible = window.scrollY > 400;
                if (waVisible !== state.waVisible) {
                    state.waVisible = waVisible;
                    wa.classList.toggle('sticky-wa--visible', waVisible);
                }
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ============================================
       STATS COUNTER
       ============================================ */
    function initStatsCounter() {
        const stats = $$('.stat-value[data-count]');
        if (!stats.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    const prefix = el.dataset.prefix || '';
                    const suffix = el.dataset.suffix || '';
                    const duration = 1500;
                    const start = performance.now();

                    function tick(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                        const current = Math.floor(eased * target);
                        el.textContent = prefix + current.toLocaleString() + suffix;
                        if (progress < 1) requestAnimationFrame(tick);
                    }

                    requestAnimationFrame(tick);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(s => observer.observe(s));
    }

    /* ============================================
       FORM STATES
       ============================================ */
    function initFormStates() {
        $$('.modal__form').forEach(form => {
            form.addEventListener('submit', handleFormSubmit);
        });
    }

    window.handleFormSubmit = function(event, form) {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;

        const originalText = btn.textContent;
        const originalWidth = btn.offsetWidth;
        btn.style.width = originalWidth + 'px';

        // State: loading
        btn.setAttribute('data-loading', 'true');
        btn.disabled = true;

        setTimeout(() => {
            // State: success
            btn.removeAttribute('data-loading');
            btn.setAttribute('data-state', 'success');
            btn.textContent = '✓ Submitted';

            setTimeout(() => {
                // Reset
                btn.removeAttribute('data-state');
                btn.textContent = originalText;
                btn.style.width = '';
                btn.disabled = false;
                form.reset();

                // Close modal
                const modal = form.closest('.modal');
                if (modal) closeModal(modal.id);
            }, 1800);
        }, 1200);
    };

    /* ============================================
       FAQ STATES (native <details> enhancement)
       ============================================ */
    function initFAQStates() {
        $$('.faq-item').forEach(item => {
            const summary = item.querySelector('summary');
            if (!summary) return;

            summary.addEventListener('click', (e) => {
                const isOpen = item.open;
                // Close siblings for accordion behavior
                if (!isOpen) {
                    $$('.faq-item[open]').forEach(openItem => {
                        if (openItem !== item) {
                            openItem.open = false;
                        }
                    });
                }
            });
        });
    }

    /* ============================================
       MOBILE MENU
       ============================================ */
    window.toggleMenu = function() {
        const menu = $('#mobileMenu');
        const btn = $('.nav-menu-btn');
        if (!menu) return;

        state.menuOpen = !state.menuOpen;
        menu.classList.toggle('active', state.menuOpen);
        if (btn) btn.setAttribute('aria-expanded', String(state.menuOpen));

        // Lock body scroll when menu open
        document.body.style.overflow = state.menuOpen ? 'hidden' : '';
    };

    /* ============================================
       MODALS
       ============================================ */
    window.openBuyModal = function(bundleName, price) {
        const modal = $('#buyModal');
        const nameEl = $('#modalBundleName');
        const priceEl = $('#modalPrice');
        const btnPriceEl = $('#modalBtnPrice');

        if (nameEl) nameEl.textContent = bundleName;
        if (priceEl) priceEl.textContent = price;
        if (btnPriceEl) btnPriceEl.textContent = price;

        openModal('buyModal');
    };

    window.openPartnerModal = function(event) {
        if (event) event.preventDefault();
        openModal('partnerModal');
    };

    window.closeModal = function(modalId) {
        const modal = $(typeof modalId === 'string' ? '#' + modalId : modalId);
        if (!modal) return;

        modal.classList.remove('modal--open');
        state.modalOpen = null;
        document.body.style.overflow = '';
    };

    function openModal(modalId) {
        const modal = $('#' + modalId);
        if (!modal) return;

        // Close any open modal first
        if (state.modalOpen) {
            closeModal(state.modalOpen);
        }

        modal.classList.add('modal--open');
        state.modalOpen = modalId;
        document.body.style.overflow = 'hidden';

        // Focus trap: focus first input or close button
        const focusable = modal.querySelector('input, select, textarea, button:not([disabled])');
        if (focusable) focusable.focus();
    }

    // Close on overlay click
    $$('.modal__overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            const modal = overlay.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.modalOpen) {
            closeModal(state.modalOpen);
        }
        // Close menu on Escape
        if (e.key === 'Escape' && state.menuOpen) {
            toggleMenu();
        }
    });

    /* ============================================
       ACCESSIBILITY
       ============================================ */
    function initAccessibility() {
        // Smooth scroll for anchor links
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                const target = $(href);
                if (target) {
                    e.preventDefault();
                    const navHeight = $('#nav')?.offsetHeight || 56;
                    const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });

        // Reduced motion respect
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--t-fast', '0ms');
            document.documentElement.style.setProperty('--t-normal', '0ms');
            document.documentElement.style.setProperty('--t-slow', '0ms');
        }
    }

    /* ============================================
       CONSOLE SIGNATURE
       ============================================ */
    console.log('%cPulse', 'font-size: 28px; font-weight: 700; color: #0ea5e9; letter-spacing: -0.02em;');
    console.log('%cSmart data optimization for Ghanaians.', 'font-size: 12px; color: #94a3b8;');

})();
'''

with open('/mnt/agents/output/script.js', 'w', encoding='utf-8') as f:
    f.write(js_v2)

print(f"JS saved: {len(js_v2)} chars")
