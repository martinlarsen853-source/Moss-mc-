/* ============================================================
   MOSS MC — Main JS
   ============================================================ */

'use strict';

/* --- NAVIGATION SCROLL STATE ------------------------------ */
const nav = document.getElementById('nav');

function updateNav() {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* --- HAMBURGER MENU --------------------------------------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* --- HERO BACKGROUND ANIMATION ---------------------------- */
const heroBg = document.querySelector('.hero__bg');
if (heroBg) {
  requestAnimationFrame(() => {
    heroBg.classList.add('loaded');
  });
}

/* --- SCROLL REVEAL ---------------------------------------- */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealElements.forEach(el => revealObserver.observe(el));

/* --- SMOOTH SCROLL POLYFILL ------------------------------- */
// Handles anchor links for browsers without native smooth scroll support
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = nav.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* --- CONTACT FORM ----------------------------------------- */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    // Simple email validation
    const emailField = form.querySelector('#epost');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    // Simulate successful submission (replace with actual endpoint)
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled  = true;
    submitBtn.textContent = 'Sender...';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send melding';
      formSuccess.classList.add('visible');

      setTimeout(() => {
        formSuccess.classList.remove('visible');
      }, 5000);
    }, 800);
  });

  // Remove error state on input
  form.querySelectorAll('.form__input').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });
}

/* --- PARALLAX HERO ---------------------------------------- */
function parallaxHero() {
  if (window.innerWidth < 768) return;
  const scrollY = window.scrollY;
  if (heroBg) {
    heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.25}px)`;
  }
}

window.addEventListener('scroll', parallaxHero, { passive: true });
