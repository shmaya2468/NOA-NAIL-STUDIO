import { gsap } from 'gsap';

/**
 * Production-safe re-implementation of the Apple-style "cover flow" concept
 * (originally a CSS-only demo built on experimental features — @function,
 * sibling-index(), scroll-driven animation-timeline, ::scroll-marker, etc.
 * — none of which ship in stable evergreen browsers yet).
 *
 * The visual result is recreated with plain, well-supported primitives:
 *   - a native horizontally-scrolling, scroll-snapping list (so touch swipe,
 *     trackpad, keyboard and mouse-drag all work for free, and nothing
 *     hijacks page scroll on mobile)
 *   - a scroll listener (rAF-batched) that measures each slide's distance
 *     from the scroller's center and writes it as a single number
 *   - GSAP quickSetters applying perspective/rotateY/scale/translateX from
 *     that distance, so the active slide faces the viewer at full size while
 *     neighbors rotate, shrink and tuck in behind it
 *
 * Each `[data-cover-flow]` element is initialized independently — no shared
 * module-level state — so multiple instances never interfere with each other.
 */
export function initCoverFlow(root) {
  const scroller = root.querySelector('[data-cover-flow-scroller]');
  const slides = Array.from(root.querySelectorAll('[data-cover-flow-slide]'));
  const prevBtn = root.querySelector('[data-cover-flow-prev]');
  const nextBtn = root.querySelector('[data-cover-flow-next]');
  if (!scroller || !slides.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const frames = slides.map((slide) => slide.querySelector('[data-cover-flow-frame]') || slide);

  // Tunables come from CSS custom properties on the root, so breakpoints
  // (see style.css) can change the feel without touching JS.
  let rotateDeg = 42;
  let stackPx = 46;
  let scaleStep = 0.16;
  let minScale = 0.74;

  const readTunables = () => {
    const cs = getComputedStyle(root);
    rotateDeg = parseFloat(cs.getPropertyValue('--cf-rotate')) || rotateDeg;
    stackPx = parseFloat(cs.getPropertyValue('--cf-stack')) || stackPx;
    scaleStep = parseFloat(cs.getPropertyValue('--cf-scale-step')) || scaleStep;
    minScale = parseFloat(cs.getPropertyValue('--cf-min-scale')) || minScale;
  };

  let activeIndex = 0;
  let ticking = false;

  const update = () => {
    ticking = false;
    const scrollerRect = scroller.getBoundingClientRect();
    const center = scrollerRect.left + scrollerRect.width / 2;

    let nearestIndex = 0;
    let nearestAbs = Infinity;

    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const d = (slideCenter - center) / rect.width; // signed distance in slide-widths
      const ad = Math.min(Math.abs(d), 3);

      if (reduceMotion) {
        gsap.set(frames[i], { x: 0, rotateY: 0, scale: 1 });
      } else {
        const side = d > 0 ? 1 : d < 0 ? -1 : 0;
        const scale = Math.max(minScale, 1 - ad * scaleStep);
        // A single gsap.set() call composes x/rotateY/scale into one
        // transform matrix reliably. Three separate quickSetters on the
        // same element were dropping the scale component entirely when
        // composed with a fast-path per-property cache — set() always
        // resolves the full transform correctly, and at one call per
        // slide per rAF frame the overhead is immaterial here.
        gsap.set(frames[i], {
          x: -d * stackPx,
          rotateY: side * -rotateDeg * Math.min(Math.abs(d), 1),
          scale,
        });
      }

      slide.style.zIndex = String(Math.round(1000 - ad * 10));

      if (ad < nearestAbs) {
        nearestAbs = ad;
        nearestIndex = i;
      }
    });

    if (nearestIndex !== activeIndex) {
      slides[activeIndex]?.classList.remove('is-active');
      activeIndex = nearestIndex;
    }
    slides[activeIndex]?.classList.add('is-active');
    slides.forEach((slide, i) => {
      if (i !== activeIndex) slide.classList.remove('is-active');
      slide.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
    });

    if (prevBtn) prevBtn.disabled = activeIndex === 0;
    if (nextBtn) nextBtn.disabled = activeIndex === slides.length - 1;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  const goTo = (index) => {
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  };

  scroller.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => { readTunables(); requestUpdate(); });

  prevBtn?.addEventListener('click', () => goTo(activeIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(activeIndex + 1));

  // Let a click on any de-focused neighbor slide bring it to center — a nice
  // desktop affordance; harmless on touch since it just fires after the tap.
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (i !== activeIndex) goTo(i);
    });
  });

  readTunables();
  requestUpdate();

  // Re-measure once layout has fully settled (fonts/images), matching the
  // rest of the site's ScrollTrigger.refresh()-on-load convention.
  window.addEventListener('load', requestUpdate);
}

export function initAllCoverFlows() {
  document.querySelectorAll('[data-cover-flow]').forEach((root) => initCoverFlow(root));
}
