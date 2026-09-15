/* ==========================================================================
   i18n — French / English
   Markup uses:
     data-i18n="key"          → textContent
     data-i18n-html="key"     → innerHTML (for <br> / gradient spans)
     data-i18n-ph="key"       → placeholder
     data-i18n-aria="key"     → aria-label
     data-i18n-content="key"  → content (meta tags)
   To edit copy, change the strings below — both languages share the same keys.
   ========================================================================== */
(() => {
  'use strict';

  const DICT = {
    en: {
      'meta.title': 'HyperLink — IT Infrastructure, ISO & Consulting, Integrated Solutions',
      'meta.description': 'HyperLink designs, deploys and runs IT infrastructure, delivers ISO consulting and integrated solutions.',
      'lang.label': 'Language',
      'brand.tagline': 'Integrated IT solutions',

      'nav.main': 'Main',
      'nav.menu': 'Open menu',
      'nav.solutions': 'Solutions',
      'nav.process': 'Process',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'cta.quote': 'Get a quote',
      'cta.call': 'Call us',

      'link.down': 'Link down',
      'link.up': '10G up',
      'link.shortDown': 'Down',
      'link.shortUp': '10G up',
      'link.awaiting': 'Awaiting connection…',
      'link.established': 'Link established',

      'hero.eyebrow': 'IT Infrastructure · ISO & Consulting · Integrated Solutions',
      'hero.t1': 'Your business,',
      'hero.t2': '<em class="grad">hyper&#8209;linked.</em>',
      'hero.lead': 'We design, deploy and run the infrastructure your business runs on — networks, structured cabling, security and cloud — and guide you to ISO certification.',
      'hero.cta1': 'Explore solutions',
      'hero.cta2': 'Talk to an engineer',
      'hero.spec1': 'Cabling',
      'hero.spec2': 'Consulting',
      'hero.spec3': 'Support',
      'hero.c1': 'Connector',
      'hero.c2': 'Pinout',
      'hero.c3': 'Standard',
      'hero.scroll': 'Scroll to pull the cable',

      'band.1': 'Networks',
      'band.2': 'Structured cabling',
      'band.3': 'Cybersecurity',
      'band.4': 'ISO consulting',
      'band.5': 'Datacenter & cloud',
      'band.6': 'Integrated solutions',
      'band.standards': 'Standards and technologies',

      'services.title': 'Everything your IT<br>needs, <span class="grad">end&#8209;to&#8209;end.</span>',
      'services.lead': 'Infrastructure, security, compliance and support — six practices, one team and a single point of contact.',
      's1.title': 'Network & IT Infrastructure',
      's1.text': 'LAN, WAN and Wi‑Fi designed for speed and resilience, sized for where your business is going.',
      's2.title': 'Structured Cabling & Fiber',
      's2.text': 'Copper and fiber cabling, racks and patch panels — certified, labeled and documented.',
      's2.tag': 'Racks',
      's3.title': 'Cybersecurity',
      's3.text': 'Firewalls, endpoint protection, audits and monitoring to keep threats outside your network.',
      's3.tag': 'Firewall',
      's4.title': 'ISO Certification & Consulting',
      's4.text': 'Gap analysis, implementation and audit readiness for ISO 27001, ISO 9001 and more.',
      's5.title': 'Datacenter & Cloud',
      's5.text': 'Servers, storage, virtualization and hybrid cloud built to run without interruption.',
      's5.tag1': 'Servers',
      's5.tag2': 'Hybrid cloud',
      's6.title': 'Integrated Solutions & Support',
      's6.text': 'One partner from design to operations: helpdesk, maintenance and proactive 24/7 monitoring.',

      'stats.1': 'Projects delivered',
      'stats.2': 'Network uptime',
      'stats.3': 'Cable deployed',
      'stats.4': 'Avg. response time',

      'process.title': 'From audit to uptime,<br><span class="grad">one clean run.</span>',
      'process.lead': 'A clear method with no loose ends — you always know what happens next.',
      'process.step': 'Step',
      'p1.title': 'Audit',
      'p1.text': 'We map your existing infrastructure, risks and needs on site.',
      'p2.title': 'Design',
      'p2.text': 'Architecture, bill of materials and a transparent quote.',
      'p3.title': 'Deploy',
      'p3.text': 'Installation, configuration and testing with minimal downtime.',
      'p4.title': 'Monitor & Support',
      'p4.text': 'Continuous monitoring, maintenance and a team that answers.',

      'projects.title': 'Built, cabled,<br><span class="grad">and running.</span>',
      'projects.lead': 'A selection of recent deployments.',
      'pr1.title': 'Datacenter migration',
      'pr2.tag': 'Network · 2025',
      'pr2.title': 'Multi‑site network',
      'pr3.title': 'Security & compliance program',

      'contact.title': 'Ready to<br><span class="grad">plug in?</span>',
      'contact.lead': 'Tell us about your project and an engineer will get back to you within one business day.',
      'contact.email': 'Email',
      'contact.phone': 'Phone',
      'contact.office': 'Office',
      'contact.address': 'Address to be confirmed',
      'sw.latency': 'Latency',
      'sw.throughput': 'Throughput',
      'sw.packets': 'Packets',

      'form.name': 'Name',
      'form.namePh': 'Jane Doe',
      'form.emailPh': 'jane@company.com',
      'form.company': 'Company',
      'form.companyPh': 'Company name',
      'form.need': 'Need',
      'form.project': 'Project',
      'form.projectPh': 'Tell us a bit about your project…',
      'form.send': 'Send signal',
      'form.note': 'Demo form — not connected yet.',
      'form.sent': 'Signal sent ✓ (demo — connect this form to your backend)',

      'footer.tagline': 'IT infrastructure, ISO consulting and integrated solutions — built to keep your business connected.',
      'footer.networks': 'Networks',
      'footer.cabling': 'Cabling',
      'footer.security': 'Security',
      'footer.company': 'Company',
      'footer.careers': 'Careers',
      'footer.social': 'Social',
      'footer.rights': 'All rights reserved.',

      'hud.cable': 'Cable',
      'hud.link': 'Link',
    },

    fr: {
      'meta.title': 'HyperLink — Infrastructure IT, ISO & Conseil, Solutions intégrées',
      'meta.description': 'HyperLink conçoit, déploie et exploite votre infrastructure IT, et vous accompagne en conseil ISO et solutions intégrées.',
      'lang.label': 'Langue',
      'brand.tagline': 'Solutions IT intégrées',

      'nav.main': 'Navigation principale',
      'nav.menu': 'Ouvrir le menu',
      'nav.solutions': 'Solutions',
      'nav.process': 'Méthode',
      'nav.projects': 'Réalisations',
      'nav.contact': 'Contact',
      'cta.quote': 'Demander un devis',
      'cta.call': 'Nous appeler',

      'link.down': 'Lien coupé',
      'link.up': '10G actif',
      'link.shortDown': 'Coupé',
      'link.shortUp': '10G actif',
      'link.awaiting': 'En attente de connexion…',
      'link.established': 'Connexion établie',

      'hero.eyebrow': 'Infrastructure IT · ISO & Conseil · Solutions intégrées',
      'hero.t1': 'Votre entreprise,',
      'hero.t2': '<em class="grad">hyper&#8209;connectée.</em>',
      'hero.lead': 'Nous concevons, déployons et exploitons l’infrastructure qui fait tourner votre entreprise — réseaux, câblage structuré, sécurité et cloud — et vous accompagnons jusqu’à la certification ISO.',
      'hero.cta1': 'Découvrir nos solutions',
      'hero.cta2': 'Parler à un ingénieur',
      'hero.spec1': 'Câblage',
      'hero.spec2': 'Conseil',
      'hero.spec3': 'Support',
      'hero.c1': 'Connecteur',
      'hero.c2': 'Brochage',
      'hero.c3': 'Norme',
      'hero.scroll': 'Faites défiler pour tirer le câble',

      'band.1': 'Réseaux',
      'band.2': 'Câblage structuré',
      'band.3': 'Cybersécurité',
      'band.4': 'Conseil ISO',
      'band.5': 'Datacenter & cloud',
      'band.6': 'Solutions intégrées',
      'band.standards': 'Normes et technologies',

      'services.title': 'Tout ce dont votre IT<br>a besoin, <span class="grad">de bout en bout.</span>',
      'services.lead': 'Infrastructure, sécurité, conformité et support — six expertises, une seule équipe et un interlocuteur unique.',
      's1.title': 'Réseaux & Infrastructure IT',
      's1.text': 'LAN, WAN et Wi‑Fi conçus pour la performance et la résilience, dimensionnés pour votre croissance.',
      's2.title': 'Câblage structuré & Fibre',
      's2.text': 'Câblage cuivre et fibre, baies et panneaux de brassage — certifiés, étiquetés et documentés.',
      's2.tag': 'Baies',
      's3.title': 'Cybersécurité',
      's3.text': 'Pare-feu, protection des postes, audits et supervision pour garder les menaces hors de votre réseau.',
      's3.tag': 'Pare-feu',
      's4.title': 'Certification ISO & Conseil',
      's4.text': 'Analyse d’écarts, mise en œuvre et préparation à l’audit pour ISO 27001, ISO 9001 et plus.',
      's5.title': 'Datacenter & Cloud',
      's5.text': 'Serveurs, stockage, virtualisation et cloud hybride conçus pour fonctionner sans interruption.',
      's5.tag1': 'Serveurs',
      's5.tag2': 'Cloud hybride',
      's6.title': 'Solutions intégrées & Support',
      's6.text': 'Un seul partenaire de la conception à l’exploitation : helpdesk, maintenance et supervision proactive 24/7.',

      'stats.1': 'Projets livrés',
      'stats.2': 'Disponibilité réseau',
      'stats.3': 'Câble déployé',
      'stats.4': 'Temps de réponse moyen',

      'process.title': 'De l’audit à la production,<br><span class="grad">sans fil qui dépasse.</span>',
      'process.lead': 'Une méthode claire, sans zone d’ombre — vous savez toujours quelle est la prochaine étape.',
      'process.step': 'Étape',
      'p1.title': 'Audit',
      'p1.text': 'Nous cartographions sur site votre infrastructure, vos risques et vos besoins.',
      'p2.title': 'Conception',
      'p2.text': 'Architecture, liste du matériel et devis transparent.',
      'p3.title': 'Déploiement',
      'p3.text': 'Installation, configuration et tests avec un minimum d’interruption.',
      'p4.title': 'Supervision & Support',
      'p4.text': 'Supervision continue, maintenance et une équipe qui répond.',

      'projects.title': 'Conçu, câblé,<br><span class="grad">et opérationnel.</span>',
      'projects.lead': 'Une sélection de déploiements récents.',
      'pr1.title': 'Migration de datacenter',
      'pr2.tag': 'Réseau · 2025',
      'pr2.title': 'Réseau multi‑sites',
      'pr3.title': 'Programme sécurité & conformité',

      'contact.title': 'Prêt à vous<br><span class="grad">connecter ?</span>',
      'contact.lead': 'Parlez-nous de votre projet : un ingénieur vous répond sous un jour ouvré.',
      'contact.email': 'E-mail',
      'contact.phone': 'Téléphone',
      'contact.office': 'Bureau',
      'contact.address': 'Adresse à confirmer',
      'sw.latency': 'Latence',
      'sw.throughput': 'Débit',
      'sw.packets': 'Paquets',

      'form.name': 'Nom',
      'form.namePh': 'Nom et prénom',
      'form.emailPh': 'vous@entreprise.com',
      'form.company': 'Entreprise',
      'form.companyPh': 'Nom de l’entreprise',
      'form.need': 'Besoin',
      'form.project': 'Projet',
      'form.projectPh': 'Décrivez-nous votre projet en quelques mots…',
      'form.send': 'Envoyer le signal',
      'form.note': 'Formulaire de démo — pas encore connecté.',
      'form.sent': 'Signal envoyé ✓ (démo — à relier à votre serveur)',

      'footer.tagline': 'Infrastructure IT, conseil ISO et solutions intégrées — pour que votre entreprise reste connectée.',
      'footer.networks': 'Réseaux',
      'footer.cabling': 'Câblage',
      'footer.security': 'Sécurité',
      'footer.company': 'Entreprise',
      'footer.careers': 'Carrières',
      'footer.social': 'Réseaux sociaux',
      'footer.rights': 'Tous droits réservés.',

      'hud.cable': 'Câble',
      'hud.link': 'Lien',
    },
  };

  const root = document.documentElement;
  let lang = DICT[root.lang] ? root.lang : 'fr';

  const t = key => (DICT[lang] && DICT[lang][key]) ?? DICT.en[key] ?? key;

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-content]').forEach(el => { el.setAttribute('content', t(el.dataset.i18nContent)); });
    document.title = t('meta.title');
    root.lang = lang;

    document.querySelectorAll('.lang').forEach(group => {
      group.dataset.active = lang;
      group.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    });
  }

  function set(next) {
    if (!DICT[next] || next === lang) return;
    lang = next;
    try { localStorage.setItem('hl-lang', lang); } catch (e) {}
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) { url.searchParams.set('lang', lang); history.replaceState(null, '', url); }
    apply();
    window.dispatchEvent(new CustomEvent('i18n:change', { detail: lang }));
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('.lang [data-lang]');
    if (b) set(b.dataset.lang);
  });

  apply();
  window.HL_I18N = { t, set, get lang() { return lang; } };
})();
