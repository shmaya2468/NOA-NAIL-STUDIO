import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initNav } from './modules/nav.js';
import { initRevealObserver } from './modules/reveal.js';
import { initScrollReveals } from './modules/scrollReveals.js';
import { initHero } from './modules/hero.js';
import { initGalleries } from './modules/galleries.js';
import { initFaq } from './modules/faq.js';
import { initTestimonials } from './modules/testimonials.js';
import { initTilt } from './modules/tilt.js';
import { initContactForm } from './modules/contactForm.js';
import { initSmoothScroll } from './modules/smoothScroll.js';

gsap.registerPlugin(ScrollTrigger);

// Flag JS as active so CSS can safely hide/animate content that must stay
// visible and readable if a script fails to load (see .js .reveal in style.css).
document.documentElement.classList.add('js');

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

initNav();
initHero();
initRevealObserver();
initScrollReveals();
initGalleries();
initFaq();
initTestimonials();
initTilt('.testi-card', { maxTilt: 5, liftY: -8, scale: 1.02 });
initTilt('.shape-card', { maxTilt: 8, liftY: -6, scale: 1.04 });
initContactForm();
initSmoothScroll();

// Recalculate pinned/scrubbed ScrollTrigger positions once everything
// (fonts, images) has actually finished loading, per GSAP best practice.
window.addEventListener('load', () => ScrollTrigger.refresh());
