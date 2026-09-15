/* ==========================================================================
   Site settings — put the client's real contact details here.
   Every phone/email on the page (contact section, mobile menu, call button)
   is filled from this file. Address and opening hours are translated, so they
   live in js/i18n.js under 'contact.address' and 'contact.hours'.
   ========================================================================== */
window.HL_SITE = {
  phoneDisplay: '+213 (0) 00 00 00 00',   // how the number is shown, e.g. '+213 (0) 21 00 00 00'
  phoneLink: '+213000000000',             // digits only for tap-to-call, e.g. '+21321000000'
  email: 'contact@hyperlink.example',
};

(() => {
  const site = window.HL_SITE;
  document.querySelectorAll('[data-contact="phone"]').forEach(a => { a.textContent = site.phoneDisplay; a.href = `tel:${site.phoneLink}`; });
  document.querySelectorAll('[data-contact="phone-link"]').forEach(a => { a.href = `tel:${site.phoneLink}`; });
  document.querySelectorAll('[data-contact="email"]').forEach(a => { a.textContent = site.email; a.href = `mailto:${site.email}`; });
})();
