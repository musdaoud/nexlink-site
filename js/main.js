/* ==========================================================================
   UI — nav, reveals, counters, switch link state, form
   ========================================================================== */
(() => {
  'use strict';

  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // safety net: never leave the hero hidden if the cable engine fails
  setTimeout(() => body.classList.add('is-ready'), 3200);

  /* nav */
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    if (hero) hero.style.setProperty('--hp', Math.min(1, y / window.innerHeight).toFixed(3));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.querySelector('.burger');
  burger.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
    body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* reveal on scroll */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      revealIO.unobserve(el);
      // hand transitions back to the component (hover etc.) once revealed
      const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      setTimeout(() => el.classList.remove('reveal', 'is-in'), 1100 + delay * 1000);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  /* counters */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const to = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const dur = reduced ? 1 : 1800;
      let t0 = 0;
      const tick = now => {
        if (!t0) t0 = now;
        const p = Math.min(1, Math.max(0, (now - t0) / dur));
        const v = to * (1 - Math.pow(1 - p, 4));
        el.textContent = v.toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* card spotlight follows the pointer */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* magnetic buttons */
  if (!reduced && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .22;
        const y = (e.clientY - r.top - r.height / 2) * .3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* link state: the plug reached the switch port */
  const t = key => (window.HL_I18N ? window.HL_I18N.t(key) : key);
  const shortTexts = document.querySelectorAll('[data-link-text]');
  const tinyTexts = document.querySelectorAll('[data-link-short]');
  const longText = document.querySelector('[data-link-long]');
  const leds = [...document.querySelectorAll('.sw-leds i')];
  const metrics = {
    lat: document.querySelector('[data-metric="lat"]'),
    thr: document.querySelector('[data-metric="thr"]'),
    pkt: document.querySelector('[data-metric="pkt"]'),
  };
  let ledTimers = [], metricTimer = null, packets = 0, linkUp = false;

  const renderLinkTexts = () => {
    shortTexts.forEach(el => { el.textContent = t(linkUp ? 'link.up' : 'link.down'); });
    tinyTexts.forEach(el => { el.textContent = t(linkUp ? 'link.shortUp' : 'link.shortDown'); });
    if (longText) longText.textContent = t(linkUp ? 'link.established' : 'link.awaiting');
  };
  renderLinkTexts();

  window.addEventListener('cable:link', e => {
    linkUp = e.detail;
    renderLinkTexts();

    ledTimers.forEach(clearTimeout); ledTimers = [];
    clearInterval(metricTimer);

    if (linkUp) {
      leds.forEach((led, i) => {
        ledTimers.push(setTimeout(() => {
          led.classList.add('on');
          if (Math.random() < .18) led.classList.add('amber');
        }, 40 + i * 35));
      });
      metricTimer = setInterval(() => {
        metrics.lat.textContent = (0.3 + Math.random() * .3).toFixed(2) + ' ms';
        metrics.thr.textContent = (9.2 + Math.random() * .7).toFixed(1) + ' Gbps';
        packets += Math.floor(9000 + Math.random() * 6000);
        metrics.pkt.textContent = packets.toLocaleString(document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-US');
        leds.forEach(l => { if (Math.random() < .12) l.classList.toggle('amber'); });
      }, 450);
    } else {
      leds.forEach(l => l.classList.remove('on', 'amber'));
      metrics.lat.textContent = '— ms';
      metrics.thr.textContent = '— Gbps';
    }
  });

  /* demo form */
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');
  let formSent = false;
  form.addEventListener('submit', e => {
    e.preventDefault();
    formSent = true;
    note.textContent = t('form.sent');
    note.classList.add('ok');
    form.reset();
  });

  /* HUD steps aside for the footer */
  const hud = document.querySelector('.hud');
  const footer = document.querySelector('.footer');
  if (hud && footer) {
    new IntersectionObserver(([e]) => hud.classList.toggle('is-hidden', e.isIntersecting)).observe(footer);
  }

  /* mobile action bar: appears after the hero, steps aside for contact/footer and the menu */
  const mCta = document.getElementById('m-cta');
  if (mCta) {
    let blocked = false;
    const blockers = new Set();
    const update = () => {
      const shown = window.scrollY > window.innerHeight * .75 && !blocked && !body.classList.contains('menu-open');
      mCta.classList.toggle('is-shown', shown);
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target));
      blocked = blockers.size > 0;
      update();
    }, { rootMargin: '0px 0px -30% 0px' });
    ['.contact-grid .form', '.footer'].forEach(sel => { const el = document.querySelector(sel); el && io.observe(el); });
    window.addEventListener('scroll', update, { passive: true });
    burger.addEventListener('click', update);
    update();
  }

  /* language switch: i18n.js rewrote the static text — refresh the dynamic bits */
  window.addEventListener('i18n:change', () => {
    renderLinkTexts();
    if (formSent) note.textContent = t('form.sent');
    const burgerOpen = body.classList.contains('menu-open');
    burger.setAttribute('aria-expanded', String(burgerOpen));
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
