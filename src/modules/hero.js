import gsap from 'gsap';

/**
 * Hero entrance: a masked, blur-to-sharp, word-by-word reveal for the title
 * with a light-sweep pass, then the CTAs/trust row — followed by a very
 * subtle ambient shimmer + breathing glow that continues for as long as the
 * hero is on screen. The background video is native autoplay/muted/loop
 * (see index.html); this module only pauses it for reduced-motion users.
 */
export function initHero() {
  animateTitle();
  guardVideoMotion();
}

function animateTitle() {
  const title = document.getElementById('heroTitle');
  const words = title?.querySelectorAll('.hero-title-word');
  if (!title || !words?.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    revealHeroCopy(true);
    return;
  }

  gsap.set(words, { yPercent: 115, opacity: 0, filter: 'blur(14px)' });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(words, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.05, stagger: 0.14 })
    .to(words, { backgroundPosition: '-55% 0', duration: 1.5, ease: 'power2.inOut' }, '-=0.35')
    .add(() => revealHeroCopy(false), '-=0.95')
    .call(() => startAmbientShimmer(title, words));
}

function startAmbientShimmer(title, words) {
  gsap.set(words, { backgroundPosition: '200% 0' });
  gsap.to(words, {
    backgroundPosition: '-55% 0',
    duration: 1.8,
    ease: 'power2.inOut',
    repeat: -1,
    repeatDelay: 4.2,
    onRepeat() { gsap.set(words, { backgroundPosition: '200% 0' }); },
  });
  title.classList.add('is-glowing');
}

function revealHeroCopy(instant) {
  const actions = document.getElementById('heroActions');
  const trust = document.getElementById('heroTrust');
  const items = [actions, trust].filter(Boolean);
  if (!items.length) return;

  if (instant) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }
  gsap.to(items, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' });
  items.forEach((el) => el.classList.add('in-view'));
}

function guardVideoMotion() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    video.pause();
    video.removeAttribute('autoplay');
    return;
  }

  // Autoplay can still be silently blocked by the browser in rare cases —
  // the gradient fallback underneath stays visible either way, so the hero
  // is always legible even if this retry never fires.
  const tryPlay = () => video.play().catch(() => {});
  if (video.readyState >= 2) tryPlay();
  else video.addEventListener('canplay', tryPlay, { once: true });
}
