import { initCoverFlow } from './coverFlow.js';

/**
 * Portfolio galleries (hands / feet): every real photo in each asset folder
 * is rendered as a cover-flow slide (see coverFlow.js for the interaction).
 * Each gallery is built and initialized independently.
 */
const hands = import.meta.glob('/src/assets/img/hands/*.webp', { eager: true, query: '?url', import: 'default' });
const feet = import.meta.glob('/src/assets/img/feet/*.webp', { eager: true, query: '?url', import: 'default' });

function sortedUrls(globResult) {
  return Object.keys(globResult).sort().map((key) => globResult[key]);
}

function buildSlides(scrollerEl, urls, altLabel) {
  const frag = document.createDocumentFragment();
  urls.forEach((url, i) => {
    const li = document.createElement('li');
    li.className = 'cover-flow__slide';
    li.setAttribute('data-cover-flow-slide', '');
    li.setAttribute('aria-current', 'false');

    const frame = document.createElement('div');
    frame.className = 'cover-flow__frame';
    frame.setAttribute('data-cover-flow-frame', '');

    const img = document.createElement('img');
    img.src = url;
    img.alt = `${altLabel} — עבודה ${i + 1} מתוך ${urls.length}, NOA NAIL STUDIO`;
    img.loading = i < 2 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.draggable = false;

    frame.appendChild(img);
    li.appendChild(frame);
    frag.appendChild(li);
  });
  scrollerEl.appendChild(frag);
}

export function initGalleries() {
  const handsScroller = document.querySelector('#handsCoverFlow [data-cover-flow-scroller]');
  const feetScroller = document.querySelector('#feetCoverFlow [data-cover-flow-scroller]');

  if (handsScroller) buildSlides(handsScroller, sortedUrls(hands), 'עבודת לק ג׳ל לידיים');
  if (feetScroller) buildSlides(feetScroller, sortedUrls(feet), 'עבודת פדיקור ולק ג׳ל לרגליים');

  document.querySelectorAll('[data-cover-flow]').forEach((root) => initCoverFlow(root));
}
