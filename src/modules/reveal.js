/**
 * Generic scroll-reveal for the many static `.reveal` blocks across the page
 * (section heads, cards, copy blocks). Deliberately IntersectionObserver-only
 * rather than GSAP/ScrollTrigger — per the scroll-animations skill, simple
 * fade+rise entrances don't need a heavier scroll-linked engine.
 */
export function initRevealObserver() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el, i) => {
    // Gentle stagger for elements that reveal together in the same row/grid.
    const localDelay = (i % 4) * 0.08;
    el.style.setProperty('--reveal-delay', `${localDelay}s`);
    io.observe(el);
  });
}
