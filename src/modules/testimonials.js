/**
 * Testimonials strip: native scroll-snap + touch scrolling handles mobile
 * for free. On top of that we add mouse/pen drag-to-scroll (pointerType
 * check keeps touch on native handling, since the two shouldn't compete).
 */
export function initTestimonials() {
  const scroller = document.getElementById('testiScroller');
  if (!scroller) return;

  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    isDown = true;
    startX = e.clientX;
    startScroll = scroller.scrollLeft;
    scroller.classList.add('is-dragging');
    scroller.setPointerCapture(e.pointerId);
  });

  scroller.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    // Reads and writes scrollLeft on the same element with the same sign
    // convention, so this is correct under any of the (now-standardized,
    // negative-range) RTL scrollLeft behaviors in current evergreen
    // Chrome/Firefox/Safari/Edge — this project's supported browser set.
    scroller.scrollLeft = startScroll - (e.clientX - startX);
  });

  const release = () => { isDown = false; scroller.classList.remove('is-dragging'); };
  scroller.addEventListener('pointerup', release);
  scroller.addEventListener('pointercancel', release);
  scroller.addEventListener('pointerleave', release);
}
