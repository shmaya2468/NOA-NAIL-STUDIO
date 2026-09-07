import gsap from 'gsap';

/**
 * Subtle pointer-follow 3D tilt for premium hover cards (testimonials, nail
 * shape selector). Desktop mouse only — touch devices get the plain CSS
 * :active/:focus-visible states defined in style.css instead, so nothing
 * here depends on hover to be usable.
 */
export function initTilt(selector, { maxTilt = 6, liftY = -8, scale = 1.02 } = {}) {
  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  cards.forEach((card) => {
    // Marks this card as JS-driven so the CSS :hover transform fallback
    // (for no-JS / coarse-pointer-with-hover devices) steps aside — GSAP
    // and a CSS `transition: transform` fighting over the same property on
    // every frame would otherwise stutter badly.
    card.classList.add('has-tilt');

    const quickX = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power3.out' });
    const quickY = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power3.out' });
    const quickLift = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'power3.out' });
    const quickScale = gsap.quickTo(card, 'scale', { duration: 0.4, ease: 'power3.out' });

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(px * maxTilt * 2);
      quickY(py * -maxTilt * 2);
    };

    const onEnter = () => { quickLift(liftY); quickScale(scale); };
    const onLeave = () => { quickX(0); quickY(0); quickLift(0); quickScale(1); };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
  });
}
