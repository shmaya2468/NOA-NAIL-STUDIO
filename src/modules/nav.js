/**
 * Sticky nav background-on-scroll + the full-screen mobile nav overlay.
 * The overlay itself is a progressive enhancement: on mobile the nav links
 * are still reachable via the visible booking CTA and WhatsApp float button
 * even before this module runs.
 */
export function initNav() {
  const nav = document.getElementById('siteNav');
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('mobileNav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !panel) return;

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
  };
  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    document.documentElement.classList.add('no-scroll');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  panel.querySelectorAll('[data-nav-close]').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close automatically if the viewport grows past the mobile breakpoint.
  const mq = window.matchMedia('(min-width: 980px)');
  mq.addEventListener('change', (e) => { if (e.matches) closeMenu(); });
}
