import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Lenis smooth scroll — desktop only. Mobile keeps native touch scrolling
 * (already excellent on its own and required for the horizontal galleries'
 * native-scroll fallback to feel right). Disabled entirely under
 * prefers-reduced-motion. Driven by GSAP's ticker so there's a single RAF
 * loop, and kept in sync with ScrollTrigger per the smooth-scroll skill.
 */
export function initSmoothScroll() {
  const isDesktop = window.matchMedia('(min-width: 900px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isDesktop || reduceMotion) return;

  const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // A URL loaded with a #section hash (a shared or bookmarked link) gets the
  // browser's native jump-to-anchor before Lenis takes over scroll handling
  // — Lenis then has no memory of that position and later re-syncs to 0,
  // silently landing the visitor back at the top. Re-issuing the scroll
  // through Lenis once it's ready fixes that without affecting normal
  // same-page nav-link clicks, which already go through Lenis correctly.
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) requestAnimationFrame(() => lenis.scrollTo(target, { immediate: true }));
  }
}
