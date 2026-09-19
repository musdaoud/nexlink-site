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

  /* references patch panel: each reference is plugged in once the cable reaches the
     section and the tile is on screen; scrolling back up above the section unplugs them */
  const refs = document.querySelector('.references');
  if (refs) {
    const tiles = [...refs.querySelectorAll('.ref')];
    const counter = refs.querySelector('[data-ref-count]');
    // stagger by column so every row plugs in left → right
    const setDelays = () => {
      let rowTop = null, col = 0;
      tiles.forEach(tile => {
        if (tile.offsetTop !== rowTop) { rowTop = tile.offsetTop; col = 0; }
        tile.style.setProperty('--d', `${reduced ? 0 : col * 0.14}s`);
        col++;
      });
    };
    setDelays();
    window.addEventListener('resize', setDelays);

    let shown = 0, countTimer = null;
    const updateCount = () => {
      const target = refs.classList.contains('is-live')
        ? tiles.filter(tile => tile.classList.contains('in-view') && !tile.classList.contains('ref--free')).length
        : 0;
      clearInterval(countTimer);
      const step = () => {
        if (shown === target) return clearInterval(countTimer);
        shown += shown < target ? 1 : -1;
        counter.textContent = String(shown).padStart(2, '0');
      };
      if (reduced) { shown = target; counter.textContent = String(shown).padStart(2, '0'); }
      else countTimer = setInterval(step, 110);
    };
    const tileIO = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); tileIO.unobserve(e.target); } });
      updateCount();
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.4 });
    tiles.forEach(tile => tileIO.observe(tile));
    new MutationObserver(updateCount).observe(refs, { attributes: true, attributeFilter: ['class'] });
  }

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
          if (Math.random() < .1) led.classList.add('red');
        }, 40 + i * 35));
      });
      metricTimer = setInterval(() => {
        metrics.lat.textContent = (0.3 + Math.random() * .3).toFixed(2) + ' ms';
        metrics.thr.textContent = (9.2 + Math.random() * .7).toFixed(1) + ' Gbps';
        packets += Math.floor(9000 + Math.random() * 6000);
        metrics.pkt.textContent = packets.toLocaleString(document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-US');
        leds.forEach(l => {
          l.classList.toggle('idle', Math.random() < .35);          // traffic flicker
          if (Math.random() < .03) l.classList.toggle('red');       // the odd error light
        });
      }, 450);
    } else {
      leds.forEach(l => l.classList.remove('on', 'red', 'idle'));
      metrics.lat.textContent = '— ms';
      metrics.thr.textContent = '— Gbps';
    }
  });

  /* contact form (demo: validates, but isn't connected to a mailbox yet) */
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');

  // Algerian numbers: mobile 05/06/07 + 8 digits, landline 02x/03x/04x + 7 digits; +213 / 00213 / 0 prefixes
  const isAlgerianPhone = v => /^(?:\+213|00213|0)(?:[567]\d{8}|[234]\d{7})$/.test(v.replace(/\(0\)/g, '').replace(/[\s.\-()]/g, ''));
  const FILE_TYPES = /\.(pdf|docx?|xlsx?|jpe?g|png)$/i;
  const FILE_MAX = 10 * 1024 * 1024;
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const rules = {
    name: el => el.value.trim().length >= 2 || 'form.errName',
    // clients who pick "Outside Algeria" may use any international number
    phone: el => (form.elements.wilaya.value === 'abroad'
      ? /^\+?\d{8,15}$/.test(el.value.replace(/[\s.\-()]/g, ''))
      : isAlgerianPhone(el.value)) || 'form.errPhone',
    email: el => !el.value.trim() || isEmail(el.value.trim()) || 'form.errEmail',
    consent: el => el.checked || 'form.errConsent',
    attachment: el => {
      const f = el.files[0];
      if (!f) return true;
      return (FILE_TYPES.test(f.name) && f.size <= FILE_MAX) || 'form.errFile';
    },
  };
  const check = (name, show = true) => {
    const el = form.elements[name];
    const res = rules[name](el);
    const field = el.closest('.field');
    const bad = res !== true;
    if (show) {
      field.classList.toggle('has-error', bad);
      el.setAttribute('aria-invalid', String(bad));
      field.querySelector('.field-err').textContent = bad ? t(res) : '';
      field.dataset.err = bad ? res : '';
    }
    return !bad;
  };
  Object.keys(rules).forEach(name => {
    const el = form.elements[name];
    el.addEventListener('blur', () => { if (!['checkbox', 'file'].includes(el.type) && el.value) check(name); });
    el.addEventListener('input', () => { if (el.closest('.field').classList.contains('has-error')) check(name); });
  });

  // pillar / equipment CTAs open the form with the matching "type of need" selected
  document.querySelectorAll('[data-need]').forEach(btn => btn.addEventListener('click', () => {
    form.elements.need.value = btn.dataset.need;
  }));

  const site = window.HL_SITE || {};
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn.querySelector('[data-i18n]');
  let noteKey = null;
  const setNote = (key, state) => {
    noteKey = key;
    note.classList.toggle('ok', state === 'ok');
    note.classList.toggle('err', state === 'err');
    renderNote();
  };
  const renderNote = () => {
    if (!noteKey) return;
    note.textContent = t(noteKey);
    if (noteKey === 'form.errServer') {
      note.append(' ');
      const a = document.createElement('a'); a.href = `tel:${site.phoneLink}`; a.textContent = site.phoneDisplay;
      const b = document.createElement('a'); b.href = `mailto:${site.email}`; b.textContent = site.email;
      note.append(a, ' · ', b);
    }
  };

  // optional Cloudflare Turnstile (anti-spam) — only loads when a site key is configured
  if (site.turnstileSiteKey) {
    const box = document.getElementById('hl-turnstile');
    box.className += ' cf-turnstile';
    box.dataset.sitekey = site.turnstileSiteKey;
    box.dataset.theme = 'dark';
    const sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    sc.async = true; sc.defer = true;
    document.head.appendChild(sc);
  }

  const fileInput = form.elements.attachment;
  const fileDrop = form.querySelector('.file-drop');
  const fileText = form.querySelector('.file-text');
  const renderFile = () => {
    const f = fileInput.files[0];
    fileDrop.classList.toggle('has-file', !!f);
    fileText.textContent = f ? `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} ${document.documentElement.lang === 'fr' ? 'Mo' : 'MB'}` : t('form.fileHint');
  };
  fileInput.addEventListener('change', () => { renderFile(); check('attachment'); });
  form.addEventListener('reset', () => setTimeout(renderFile));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const results = Object.keys(rules).map(name => check(name));
    if (results.includes(false)) {
      form.querySelector('.has-error input:not([type="file"])')?.focus();
      return;
    }
    const body = new FormData(form);
    if (body.get('website')) return;                // honeypot filled → silently drop (bot)

    if (!site.formEndpoint) {                       // demo mode: nothing is sent
      setNote('form.sent', 'ok');
      form.reset();
      return;
    }

    // multipart so the optional attachment travels with the request
    body.delete('website');
    if (!fileInput.files.length) body.delete('attachment');
    body.set('consent', 'true');
    body.set('lang', document.documentElement.lang);
    body.set('page', location.href);
    body.set('wilayaName', form.elements.wilaya.selectedOptions[0]?.textContent || '');
    body.set('needName', form.elements.need.selectedOptions[0]?.textContent || '');

    form.classList.add('is-sending');
    submitLabel.textContent = t('form.sending');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNote('form.sentReal', 'ok');
      form.reset();
      if (site.turnstileSiteKey && typeof window.turnstile?.reset === 'function') window.turnstile.reset();
    } catch (err) {
      console.warn('[contact form]', err);
      setNote('form.errServer', 'err');
    } finally {
      clearTimeout(timer);
      form.classList.remove('is-sending');
      submitLabel.textContent = t('form.send');
    }
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
    ['#contact', '.footer'].forEach(sel => { const el = document.querySelector(sel); el && io.observe(el); });
    window.addEventListener('scroll', update, { passive: true });
    burger.addEventListener('click', update);
    update();
  }

  /* language switch: i18n.js rewrote the static text — refresh the dynamic bits */
  window.addEventListener('i18n:change', () => {
    renderLinkTexts();
    renderNote();
    renderFile();
    form.querySelectorAll('.field[data-err]').forEach(f => { if (f.dataset.err) f.querySelector('.field-err').textContent = t(f.dataset.err); });
    const burgerOpen = body.classList.contains('menu-open');
    burger.setAttribute('aria-expanded', String(burgerOpen));
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
