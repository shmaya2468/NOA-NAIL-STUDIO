/**
 * Netlify Forms submit via fetch so the page doesn't hard-reload. Falls
 * back to a normal POST (Netlify's own handling) if fetch fails for any
 * reason — the form works either way since it's plain server-rendered HTML.
 */
export function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  const encode = (data) =>
    Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (status) { status.textContent = 'שולחת...'; status.dataset.state = ''; }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({ 'form-name': 'contact', ...data }),
    })
      .then(() => {
        if (status) { status.textContent = 'תודה! קיבלנו את הפרטים ונחזור אלייך בהקדם.'; status.dataset.state = 'success'; }
        form.reset();
      })
      .catch(() => {
        if (status) { status.textContent = 'משהו השתבש — אפשר לנסות שוב או לכתוב לנו בוואטסאפ.'; status.dataset.state = 'error'; }
        form.submit();
      });
  });
}
