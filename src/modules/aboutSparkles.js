/**
 * Ambient sparkle band for the About section only — a soft champagne
 * "sparkle rain" of small dots (warm gold, plus a silver/diamond-white
 * accent minority) that continuously fall, twinkle, and fade within the
 * top ~62% of the section, then loop. Pure CSS transform/opacity animation
 * (cheap, compositor-only) on a fixed set of generated <span> elements;
 * this module only computes layout (the section's real pixel height, since
 * a CSS percentage height can't resolve against this auto-height section)
 * and toggles the animation on/off near the viewport.
 *
 * Decorative and JS-only by design: with no JS, or under
 * prefers-reduced-motion (which also short-circuits below), the section
 * simply has no sparkle layer — nothing to remove, nothing left half-built.
 */
export function initAboutSparkles() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const section = document.querySelector('.about');
  if (!section || !('ResizeObserver' in window)) return;

  const layer = document.createElement('div');
  layer.className = 'about-sparkles';
  layer.setAttribute('aria-hidden', 'true');
  section.prepend(layer);

  // Fewer, dimmer particles below the desktop two-column breakpoint — matches
  // the section's own existing mobile/desktop split. Travel distance itself
  // stays the same proportion of the section on both (~62%, see below);
  // only count and brightness (--sparkle-mult in CSS) are toned down here.
  const isMobile = window.matchMedia('(max-width: 979px)').matches;
  const count = isMobile ? 52 : 90;
  // Gold stays the dominant tone; silver/diamond dots are a minority accent
  // mixed in, not a replacement.
  const silverChance = 0.35;

  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('span');
    dot.className = Math.random() < silverChance ? 'about-sparkle about-sparkle--silver' : 'about-sparkle';
    dot.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
    dot.style.setProperty('--size', `${(4 + Math.random() * 4.5).toFixed(1)}px`);
    dot.style.setProperty('--peak', (0.65 + Math.random() * 0.32).toFixed(2));
    dot.style.setProperty('--dur', `${(7 + Math.random() * 6).toFixed(1)}s`);
    // Negative delays start each dot mid-cycle so the very first frame
    // already looks like an ongoing, continuous fall rather than a
    // synchronized burst from a blank section.
    dot.style.setProperty('--delay', `-${(Math.random() * 12).toFixed(1)}s`);
    layer.appendChild(dot);
  }

  // The fall distance must track the section's real rendered height (~62%
  // of it), which only ResizeObserver can give reliably — it re-fires for
  // late content/image-driven height changes too, not just window resize.
  // Read offsetHeight (full border-box, padding included) rather than the
  // observer entry's own contentRect, which excludes this section's large
  // block padding and would otherwise undermeasure it substantially.
  const ro = new ResizeObserver(() => {
    const bandHeight = Math.round(section.offsetHeight * 0.62);
    layer.style.setProperty('--about-sparkle-band', `${bandHeight}px`);
    layer.style.setProperty('--about-sparkle-fall', `${bandHeight}px`);
  });
  ro.observe(section);

  // Pause the (already cheap, compositor-only) animation while the section
  // is far off-screen, per the brief's "avoid unnecessary work" guidance.
  const io = new IntersectionObserver(
    ([entry]) => layer.classList.toggle('is-active', entry.isIntersecting),
    { rootMargin: '200px 0px' }
  );
  io.observe(section);
}
