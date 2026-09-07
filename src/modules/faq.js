/**
 * Progressive enhancement on top of native <details name="faq"> accordion
 * items: without this module the FAQ already works (native exclusive
 * open/close, keyboard, no layout jank). With it, open/close gets a smooth
 * height transition instead of the native instant snap.
 */
export function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // native <details> behaviour is already instant and accessible

  items.forEach((item) => {
    const summary = item.querySelector('summary');
    const wrap = item.querySelector('.faq-a-wrap');
    if (!summary || !wrap) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (item.open) {
        closeItem(item, wrap);
      } else {
        // Native `name="faq"` grouping only closes siblings on a real
        // toggle, which we're intercepting — so close any open sibling
        // ourselves before animating this one open.
        items.forEach((other) => {
          if (other !== item && other.open) {
            closeItem(other, other.querySelector('.faq-a-wrap'));
          }
        });
        openItem(item, wrap);
      }
    });
  });
}

function openItem(item, wrap) {
  item.open = true;
  const target = wrap.scrollHeight;
  wrap.style.height = '0px';
  requestAnimationFrame(() => {
    wrap.style.transition = 'height 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    wrap.style.height = `${target}px`;
  });
  wrap.addEventListener(
    'transitionend',
    () => { wrap.style.height = 'auto'; },
    { once: true }
  );
}

function closeItem(item, wrap) {
  const current = wrap.scrollHeight;
  wrap.style.height = `${current}px`;
  requestAnimationFrame(() => {
    wrap.style.transition = 'height 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
    wrap.style.height = '0px';
  });
  wrap.addEventListener(
    'transitionend',
    () => { item.open = false; wrap.style.transition = ''; },
    { once: true }
  );
}
