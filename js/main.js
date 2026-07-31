'use strict';

const GALLERY_DATA = {
    venue: [
        {
            src: 'img/venue/entrance-daytime.jpg',
            alt: 'Sereno Park entrance garden archway during the day'
        },
        {
            src: 'img/venue/decorated-tables.jpg',
            alt: 'Decorated tables at the venue'
        },
        {
            src: 'img/venue/venue-corner-view.jpg',
            alt: 'Corner view of the venue'
        }
    ],
    pool: [
        {
            src: 'img/pool/pool-light-1.jpg',
            alt: 'Sereno Park pool sparkling in the sunlight'
        },
        {
            src: 'img/pool/jacuzzi-light-inside-1.jpg',
            alt: 'Jacuzzi at Sereno Park'
        },
        {
            src: 'img/pool/pool-dark-corner-1.jpg',
            alt: 'Corner view of Sereno Park pool at night'
        },
        {
            src: 'img/pool/waterfall-dark-1.jpg',
            alt: 'Waterfall view at Sereno Park'
        }
    ],
    park: [
        { src: 'img/park/cafe-entrance.jpg', alt: 'Café entrance archway' },
        {
            src: 'img/park/garden-and-fountain.jpg',
            alt: 'Garden fountain area'
        },
        {
            src: 'img/park/garden-and-pool.jpg',
            alt: 'Sereno Park next to a beautiful garden'
        },
        { src: 'img/park/spring.jpg', alt: 'Spring plants and flowers' },
        {
            src: 'img/park/tables-near-the-river.jpg',
            alt: 'Park tables set near the Hasbani river'
        },
        {
            src: 'img/park/tables-under-walnut-trees.jpg',
            alt: 'Park tables under the walnut trees'
        }
    ]
};

let isSmoothScrolling = false;
let smoothScrollTimer = null;

const setActiveNav = (id) => {
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${id}`);
    });
};

const initDynamicGalleries = () => {
    const containers = document.querySelectorAll(
        '.gallery-container[data-gallery]'
    );

    containers.forEach((container) => {
        const key = container.getAttribute('data-gallery');
        const items = GALLERY_DATA[key];

        if (!items || !items.length) return;

        container.innerHTML = `
      <div class="gallery-wrapper">
        <button class="gallery-nav-btn gallery-nav-btn--prev" aria-label="Scroll left">
          <svg aria-hidden="true"><use href="#icon-chevron-left"></use></svg>
        </button>
        <section class="gallery-track" aria-label="${key} photo gallery">
          ${items
              .map(
                  (item) => `
            <div class="gallery-card">
              <div class="gallery-card__image">
                <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
              </div>
            </div>
          `
              )
              .join('')}
        </section>
        <button class="gallery-nav-btn gallery-nav-btn--next" aria-label="Scroll right">
          <svg aria-hidden="true"><use href="#icon-chevron-right"></use></svg>
        </button>
      </div>
    `;

        const track = container.querySelector('.gallery-track');
        const prevBtn = container.querySelector('.gallery-nav-btn--prev');
        const nextBtn = container.querySelector('.gallery-nav-btn--next');

        if (!track) return;

        const scrollAmount = 340;

        prevBtn?.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn?.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        let isPointerDown = false;
        let startX = 0;
        let scrollLeft = 0;

        track.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            isPointerDown = true;
            track.setPointerCapture(e.pointerId);
            track.classList.add('is-dragging');
            startX = e.clientX;
            scrollLeft = track.scrollLeft;
        });

        const stopDrag = (e) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            try {
                track.releasePointerCapture(e.pointerId);
            } catch (_) {}
            track.classList.remove('is-dragging');
        };

        track.addEventListener('pointerup', stopDrag);
        track.addEventListener('pointercancel', stopDrag);

        track.addEventListener('pointermove', (e) => {
            if (!isPointerDown) return;
            const x = e.clientX;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });
    });
};

const initScrollReveal = () => {
    const revealElements = document.querySelectorAll(
        '.reveal, .reveal-left, .reveal-right'
    );

    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach((el) => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
};

const initScrollEffects = () => {
    const nav = document.getElementById('nav');
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero__bg img');

    let ticking = false;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;

                if (nav) {
                    nav.classList.toggle('scrolled', scrolled > 60);
                }

                if (heroBg) {
                    const heroHeight = hero?.offsetHeight ?? 0;
                    if (scrolled <= heroHeight) {
                        heroBg.style.transform = `scale(1.08) translateY(${scrolled * 0.3}px)`;
                    }
                }

                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
};

const initActiveNavTracking = () => {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (!sections.length || !document.querySelector('.nav__link')) return;

    const updateActiveNav = () => {
        if (isSmoothScrolling) return;

        const nav = document.getElementById('nav');
        const navHeight = nav ? nav.offsetHeight : 70;

        if (
            window.innerHeight + Math.ceil(window.scrollY) >=
            document.documentElement.scrollHeight - 20
        ) {
            const lastId = sections[sections.length - 1].getAttribute('id');
            if (lastId) setActiveNav(lastId);
            return;
        }

        let currentId = sections[0].getAttribute('id');
        for (const section of sections) {
            const top = section.getBoundingClientRect().top;
            if (top <= navHeight + 80) {
                currentId = section.getAttribute('id');
            } else {
                break;
            }
        }

        if (currentId) {
            setActiveNav(currentId);
        }
    };

    let ticking = false;
    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveNav();
                    ticking = false;
                });
                ticking = true;
            }
        },
        { passive: true }
    );

    const cancelSmoothScrollLock = () => {
        if (isSmoothScrolling) {
            isSmoothScrolling = false;
            clearTimeout(smoothScrollTimer);
        }
    };

    window.addEventListener('wheel', cancelSmoothScrollLock, { passive: true });
    window.addEventListener('touchmove', cancelSmoothScrollLock, {
        passive: true
    });

    updateActiveNav();
};

const initMobileNav = () => {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    const nav = document.getElementById('nav');

    if (!toggle || !links) return;

    const closeMenu = () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
        nav?.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
        const isOpen = toggle.classList.toggle('open');
        links.classList.toggle('open');
        nav?.classList.toggle('menu-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.querySelectorAll('.nav__link').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggle.classList.contains('open')) {
            closeMenu();
        }
    });
};

const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();

            const cleanId = targetId.replace('#', '');
            if (anchor.classList.contains('nav__link')) {
                setActiveNav(cleanId);
            }

            isSmoothScrolling = true;
            clearTimeout(smoothScrollTimer);
            smoothScrollTimer = setTimeout(() => {
                isSmoothScrolling = false;
            }, 800);

            const navHeight = document.getElementById('nav')?.offsetHeight ?? 0;
            const targetPosition =
                targetEl.getBoundingClientRect().top +
                window.scrollY -
                navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
};

const initFaqAccordion = () => {
    const faqItems = document.querySelectorAll('.faq__item');

    if (!faqItems.length) return;

    faqItems.forEach((item) => {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');
        const answerInner = item.querySelector('.faq__answer-inner');

        if (!question || !answer || !answerInner) return;

        if (item.classList.contains('open')) {
            answer.style.maxHeight = 'none';
            question.setAttribute('aria-expanded', 'true');
        }

        answer.addEventListener('transitionend', (e) => {
            if (
                e.propertyName === 'max-height' &&
                item.classList.contains('open')
            ) {
                answer.style.maxHeight = 'none';
            }
        });

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            faqItems.forEach((otherItem) => {
                if (otherItem === item || !otherItem.classList.contains('open'))
                    return;
                otherItem.classList.remove('open');
                const otherAnswer = otherItem.querySelector('.faq__answer');
                const otherQuestion = otherItem.querySelector('.faq__question');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = `${otherAnswer.scrollHeight}px`;
                    void otherAnswer.offsetHeight;
                    otherAnswer.style.maxHeight = '0';
                }
                if (otherQuestion)
                    otherQuestion.setAttribute('aria-expanded', 'false');
            });

            if (isOpen) {
                item.classList.remove('open');
                answer.style.maxHeight = `${answerInner.scrollHeight}px`;
                void answer.offsetHeight;
                answer.style.maxHeight = '0';
                question.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('open');
                answer.style.maxHeight = `${answerInner.scrollHeight}px`;
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initDynamicGalleries();
    initScrollReveal();
    initScrollEffects();
    initActiveNavTracking();
    initMobileNav();
    initSmoothScroll();
    initFaqAccordion();
});
