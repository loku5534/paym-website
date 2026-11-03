(() => {
  // Mobile navigation
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Services page: highlight the section in view
  const indexLinks = document.querySelectorAll('.service-index a');
  if (indexLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map([...indexLinks].map((a) => [a.hash.slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        indexLinks.forEach((l) => l.classList.remove('is-active'));
        const link = byId.get(entry.target.id);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
  }

  // Contact form
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const EMAIL = 'hello@paymtechnology.com';

  const rules = {
    name: (v) => v.trim().length >= 2 || 'Enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter an email address like name@company.com.',
    phone: (v) => !v.trim() || v.replace(/\D/g, '').length >= 10 || 'Enter a 10-digit phone number, or leave this blank.',
    service: (v) => Boolean(v) || 'Choose the service you are most interested in.',
    message: (v) => v.trim().length >= 20 || 'Add a little more detail (at least 20 characters).'
  };

  const validate = (field) => {
    const rule = rules[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    const err = document.getElementById(`${field.name}-error`);
    if (result === true) {
      field.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
      return true;
    }
    field.setAttribute('aria-invalid', 'true');
    if (err) err.textContent = result;
    return false;
  };

  const showStatus = (type, message) => {
    status.className = `form-status is-${type}`;
    status.textContent = message;
    status.focus();
  };

  form.addEventListener('blur', (e) => { if (e.target.name in rules && e.target.value) validate(e.target); }, true);
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') validate(e.target); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const invalid = [...form.elements].filter((el) => el.name in rules && !validate(el));
    if (invalid.length) { invalid[0].focus(); return; }

    // Spam trap: real visitors never fill this hidden field
    if (form.elements._gotcha && form.elements._gotcha.value) return;

    const endpoint = form.getAttribute('action') || '';
    if (endpoint.includes('YOUR_FORM_ID')) {
      showStatus('error', `This form is not connected yet. Email ${EMAIL} and we will reply within one business day.`);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      showStatus('success', 'Message sent. We will reply within one business day.');
    } catch (err) {
      showStatus('error', `Your message did not send. Check your connection and try again, or email ${EMAIL}.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
})();
