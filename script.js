/* Sebastian Parolini — interazioni sito */
(function () {
  'use strict';

  /* Fail-safe: reveals stay hidden only when JS is running */
  document.documentElement.classList.add('has-js');

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  /* ---- Header scrolled state ---- */
  const isPage = header && header.classList.contains('page-header');
  const syncHeader = () => {
    if (header && !isPage) header.classList.toggle('scrolled', window.scrollY > 36);
  };
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  /* ---- Mobile menu ---- */
  menuToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('menu-active');
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      header?.classList.remove('menu-active');
      document.body.classList.remove('menu-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Reveal on scroll (scroll-based, screenshot-safe) ---- */
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  let ticking = false;
  const showInView = () => {
    const trigger = window.innerHeight * 0.92;
    for (let i = reveals.length - 1; i >= 0; i--) {
      const el = reveals[i];
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add('in');
        reveals.splice(i, 1);
      }
    }
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(showInView); }
  };
  showInView();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', showInView);

  /* ---- Count-up stats ---- */
  const counters = document.querySelectorAll('[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach((c) => io.observe(c));
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---- Sticky mobile CTA ---- */
  const sticky = document.querySelector('[data-sticky-cta]');
  if (sticky) {
    const toggleSticky = () => sticky.classList.toggle('show', window.scrollY > 540);
    toggleSticky();
    window.addEventListener('scroll', toggleSticky, { passive: true });
  }

  /* ---- FAQ: single open at a time ---- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach((o) => { if (o !== item) o.open = false; });
    });
  });

  /* ---- WhatsApp form ---- */
  document.querySelectorAll('[data-whatsapp-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const phone = form.dataset.whatsappPhone;
      if (!phone) return;
      const data = new FormData(form);
      const lines = [form.dataset.whatsappLabel || 'Richiesta dal sito'];
      data.forEach((value, key) => {
        const text = String(value).trim();
        if (text) lines.push(`${key}: ${text}`);
      });
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
    });
  });

  /* ---- Year ---- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
