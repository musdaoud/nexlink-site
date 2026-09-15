/* ==========================================================================
   i18n — French / English
   Markup uses:
     data-i18n="key"          → textContent
     data-i18n-html="key"     → innerHTML (for <br> / gradient spans)
     data-i18n-ph="key"       → placeholder
     data-i18n-aria="key"     → aria-label
     data-i18n-label="key"    → label (select <optgroup>)
     data-i18n-content="key"  → content (meta tags)
   To edit copy, change the strings below — both languages share the same keys.
   Sub-services (infra.* / iso.*) are drafts until the client sends his final list.
   ========================================================================== */
(() => {
  'use strict';

  const DICT = {
    en: {
      'meta.title': 'HyperLink — Infrastructure & Low-Voltage Services, ISO Consulting & Certification',
      'meta.description': 'HyperLink designs, installs and maintains IT and low-voltage infrastructure, and guides companies in Algeria to ISO certification.',
      'lang.label': 'Language',
      'brand.tagline': 'Integrated IT solutions',

      'nav.main': 'Main',
      'nav.menu': 'Open menu',
      'nav.solutions': 'Services',
      'nav.process': 'Process',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'cta.contact': 'Contact us',
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
      'hero.lead': 'We design, install and maintain your IT and low-voltage infrastructure — networks, cabling, CCTV, security systems — and guide you all the way to ISO certification.',
      'hero.cta1': 'Explore our services',
      'hero.cta2': 'Our projects',
      'hero.spec1': 'Cabling',
      'hero.spec2': 'Certification',
      'hero.spec3': 'Support',
      'hero.c1': 'Connector',
      'hero.c2': 'Pinout',
      'hero.c3': 'Standard',
      'hero.scroll': 'Scroll to pull the cable',

      'band.1': 'Networks',
      'band.2': 'Cabling & fiber',
      'band.3': 'Video surveillance',
      'band.4': 'Access control',
      'band.5': 'Fire detection',
      'band.6': 'ISO certification',
      'band.standards': 'Standards and technologies',

      'services.title': 'Two areas of expertise,<br><span class="grad">one single team.</span>',
      'services.lead': 'Reliable IT and low-voltage infrastructure, and ISO support all the way to certification — with a single point of contact.',
      'pillar.label': 'Practice',
      'pillar.count': 'services',

      'pInfra.title': 'Infrastructure & Low-Voltage Services',
      'pInfra.text': 'Design, installation and maintenance of your networks and low-voltage systems — from offices to industrial sites.',
      'infra.1.title': 'IT networks',
      'infra.1.text': 'Professional LAN, WAN and Wi‑Fi — fast and secure.',
      'infra.2.title': 'Structured cabling & fiber',
      'infra.2.text': 'CAT6A copper, fiber optics and patch racks — tested and documented.',
      'infra.3.title': 'Video surveillance (CCTV)',
      'infra.3.text': 'IP cameras, recording and remote monitoring for all your sites.',
      'infra.4.title': 'Access control & time tracking',
      'infra.4.text': 'Badges, biometrics and zone-based access management.',
      'infra.5.title': 'Fire detection & alarm',
      'infra.5.text': 'Detectors, control panels and alarms that meet the standards.',
      'infra.6.title': 'Intrusion alarm',
      'infra.6.text': 'Alarms, sensors and real-time alerts.',
      'infra.7.title': 'IP telephony & intercom',
      'infra.7.text': 'IP PBX, handsets and intercoms for seamless communication.',
      'infra.8.title': 'Server rooms & power',
      'infra.8.text': 'Racks, UPS and cooling for uninterrupted service.',

      'pIso.title': 'ISO Consulting & Certification',
      'pIso.text': 'From the initial assessment to the certification audit, we build management systems that fit the way you work.',
      'iso.1.title': 'Quality management',
      'iso.1.text': 'Structure your processes and raise customer satisfaction.',
      'iso.2.title': 'Information security',
      'iso.2.text': 'Protect your data and control your digital risks.',
      'iso.3.title': 'Environmental management',
      'iso.3.text': 'Reduce your impact and meet regulatory requirements.',
      'iso.4.title': 'Occupational health & safety',
      'iso.4.text': 'Prevent risks and protect your teams.',
      'iso.5.title': 'Assessment & gap analysis',
      'iso.5.text': 'A clear baseline and an action plan toward certification.',
      'iso.6.title': 'Internal audits & training',
      'iso.6.text': 'Mock audits, team training and final-audit preparation.',

      'stats.1': 'Projects delivered',
      'stats.2': 'Network uptime',
      'stats.3': 'Cable deployed',
      'stats.4': 'Avg. response time',

      'process.title': 'From audit to uptime,<br><span class="grad">one clean run.</span>',
      'process.lead': 'A clear method with no loose ends — you always know what happens next.',
      'process.step': 'Step',
      'p1.title': 'Audit',
      'p1.text': 'We assess your sites, existing systems, risks and needs.',
      'p2.title': 'Design',
      'p2.text': 'Technical solution and a detailed implementation plan.',
      'p3.title': 'Deploy',
      'p3.text': 'Installation, configuration and testing — or implementation of your ISO system.',
      'p4.title': 'Follow-up & Support',
      'p4.text': 'Maintenance, monitoring and certification follow-up by a team that answers.',

      'projects.title': 'Built, cabled,<br><span class="grad">and certified.</span>',
      'projects.lead': 'A selection of recent projects.',
      'pr1.tag': 'Infrastructure · 2026',
      'pr1.title': 'Head-office cabling & server room',
      'pr2.tag': 'Low-voltage · 2025',
      'pr2.title': 'Multi-site CCTV & access control',
      'pr3.title': 'ISO 9001 certification support',

      'contact.title': 'Ready to<br><span class="grad">plug in?</span>',
      'contact.lead': 'Tell us about your project — our team will get back to you as soon as possible.',
      'contact.email': 'Email',
      'contact.phone': 'Phone',
      'contact.office': 'Address',
      'contact.address': 'To be confirmed — Algeria',
      'contact.hoursLabel': 'Hours',
      'contact.hours': 'Sun – Thu · 8:30 am – 5:00 pm',
      'sw.latency': 'Latency',
      'sw.throughput': 'Throughput',
      'sw.packets': 'Packets',

      'form.name': 'Full name',
      'form.namePh': 'First and last name',
      'form.emailPh': 'you@company.dz',
      'form.company': 'Company',
      'form.companyPh': 'Company name',
      'form.wilaya': 'Wilaya',
      'form.wilayaPh': 'Select your wilaya…',
      'form.abroad': 'Outside Algeria',
      'form.need': 'Service needed',
      'form.otherInfra': 'Several needs / other (infrastructure)',
      'form.otherIso': 'Several needs / other (ISO)',
      'form.iso9001': 'ISO 9001 — Quality',
      'form.iso27001': 'ISO/IEC 27001 — Information security',
      'form.iso14001': 'ISO 14001 — Environment',
      'form.iso45001': 'ISO 45001 — Health & safety',
      'form.project': 'Your project',
      'form.projectPh': 'Site, scope, timeline…',
      'form.send': 'Send request',
      'form.note': '* Required fields',
      'form.sent': 'Request sent ✓ (demo — connect this form to a mailbox or backend)',
      'form.errName': 'Please enter your name.',
      'form.errPhone': 'Enter an Algerian number, e.g. 05 55 12 34 56 or +213 21 12 34 56.',
      'form.errEmail': 'This email address doesn’t look valid.',
      'form.consent': 'I agree that HyperLink may use this information to contact me about my request.',
      'form.errConsent': 'Please confirm you agree to be contacted.',
      'form.sending': 'Sending…',
      'form.sentReal': 'Thank you! Your request has been sent — we’ll get back to you as soon as possible.',
      'form.errServer': 'The request couldn’t be sent right now. Please call us or email us directly:',

      'footer.tagline': 'Infrastructure & low-voltage services, ISO consulting & certification — built to keep your business connected.',
      'footer.infra': 'Infrastructure',
      'footer.lowvoltage': 'Low-voltage systems',
      'footer.iso': 'ISO consulting',
      'footer.certification': 'Certification',
      'footer.company': 'Company',
      'footer.careers': 'Careers',
      'footer.social': 'Social',
      'footer.rights': 'All rights reserved.',

      'hud.cable': 'Cable',
      'hud.link': 'Link',
    },

    fr: {
      'meta.title': 'HyperLink — Services d’infrastructures & courant faible, Consulting & certification ISO',
      'meta.description': 'HyperLink conçoit, installe et maintient vos infrastructures IT et courant faible, et accompagne les entreprises en Algérie vers la certification ISO.',
      'lang.label': 'Langue',
      'brand.tagline': 'Solutions IT intégrées',

      'nav.main': 'Navigation principale',
      'nav.menu': 'Ouvrir le menu',
      'nav.solutions': 'Services',
      'nav.process': 'Méthode',
      'nav.projects': 'Réalisations',
      'nav.contact': 'Contact',
      'cta.contact': 'Nous contacter',
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
      'hero.lead': 'Nous concevons, installons et maintenons vos infrastructures IT et courant faible — réseaux, câblage, vidéosurveillance, sécurité — et vous accompagnons jusqu’à la certification ISO.',
      'hero.cta1': 'Découvrir nos services',
      'hero.cta2': 'Nos réalisations',
      'hero.spec1': 'Câblage',
      'hero.spec2': 'Certification',
      'hero.spec3': 'Support',
      'hero.c1': 'Connecteur',
      'hero.c2': 'Brochage',
      'hero.c3': 'Norme',
      'hero.scroll': 'Faites défiler pour tirer le câble',

      'band.1': 'Réseaux',
      'band.2': 'Câblage & fibre',
      'band.3': 'Vidéosurveillance',
      'band.4': 'Contrôle d’accès',
      'band.5': 'Détection incendie',
      'band.6': 'Certification ISO',
      'band.standards': 'Normes et technologies',

      'services.title': 'Deux expertises,<br><span class="grad">une seule équipe.</span>',
      'services.lead': 'Des infrastructures IT et courant faible fiables, et un accompagnement ISO jusqu’à la certification — avec un interlocuteur unique.',
      'pillar.label': 'Pôle',
      'pillar.count': 'services',

      'pInfra.title': 'Services d’infrastructures & courant faible',
      'pInfra.text': 'Étude, installation et maintenance de vos réseaux et systèmes courant faible — des bureaux aux sites industriels.',
      'infra.1.title': 'Réseaux informatiques',
      'infra.1.text': 'LAN, WAN et Wi‑Fi professionnels, performants et sécurisés.',
      'infra.2.title': 'Câblage structuré & fibre optique',
      'infra.2.text': 'Cuivre CAT6A, fibre optique et baies de brassage — testés et documentés.',
      'infra.3.title': 'Vidéosurveillance',
      'infra.3.text': 'Caméras IP, enregistrement et supervision à distance de vos sites.',
      'infra.4.title': 'Contrôle d’accès & pointage',
      'infra.4.text': 'Badges, biométrie et gestion des accès par zone.',
      'infra.5.title': 'Détection & alarme incendie',
      'infra.5.text': 'Détecteurs, centrales et alarmes conformes aux normes.',
      'infra.6.title': 'Anti‑intrusion',
      'infra.6.text': 'Alarmes, capteurs et alertes en temps réel.',
      'infra.7.title': 'Téléphonie IP & interphonie',
      'infra.7.text': 'Standards IP, postes et interphones pour une communication fluide.',
      'infra.8.title': 'Salles serveurs & énergie',
      'infra.8.text': 'Baies, onduleurs et climatisation pour une continuité de service.',

      'pIso.title': 'Consulting & certification ISO',
      'pIso.text': 'Du diagnostic initial à l’audit de certification, nous mettons en place des systèmes de management adaptés à votre activité.',
      'iso.1.title': 'Management de la qualité',
      'iso.1.text': 'Structurez vos processus et améliorez la satisfaction client.',
      'iso.2.title': 'Sécurité de l’information',
      'iso.2.text': 'Protégez vos données et maîtrisez vos risques numériques.',
      'iso.3.title': 'Management environnemental',
      'iso.3.text': 'Réduisez votre impact et répondez aux exigences réglementaires.',
      'iso.4.title': 'Santé & sécurité au travail',
      'iso.4.text': 'Prévenez les risques et protégez vos équipes.',
      'iso.5.title': 'Diagnostic & analyse d’écarts',
      'iso.5.text': 'Un état des lieux précis et un plan d’action vers la certification.',
      'iso.6.title': 'Audits internes & formation',
      'iso.6.text': 'Audits à blanc, formation des équipes et préparation à l’audit final.',

      'stats.1': 'Projets livrés',
      'stats.2': 'Disponibilité réseau',
      'stats.3': 'Câble déployé',
      'stats.4': 'Temps de réponse moyen',

      'process.title': 'De l’audit à la mise en service,<br><span class="grad">sans fil qui dépasse.</span>',
      'process.lead': 'Une méthode claire, sans zone d’ombre — vous savez toujours quelle est la prochaine étape.',
      'process.step': 'Étape',
      'p1.title': 'Audit',
      'p1.text': 'Nous étudions vos sites, vos installations existantes, vos risques et vos besoins.',
      'p2.title': 'Conception',
      'p2.text': 'Solution technique et plan de mise en œuvre détaillé.',
      'p3.title': 'Déploiement',
      'p3.text': 'Installation, configuration et tests — ou mise en place de votre système ISO.',
      'p4.title': 'Suivi & Support',
      'p4.text': 'Maintenance, supervision et suivi de certification par une équipe qui répond.',

      'projects.title': 'Conçu, câblé,<br><span class="grad">et certifié.</span>',
      'projects.lead': 'Une sélection de projets récents.',
      'pr1.tag': 'Infrastructure · 2026',
      'pr1.title': 'Câblage & salle serveurs d’un siège',
      'pr2.tag': 'Courant faible · 2025',
      'pr2.title': 'Vidéosurveillance & contrôle d’accès multi-sites',
      'pr3.title': 'Accompagnement à la certification ISO 9001',

      'contact.title': 'Prêt à vous<br><span class="grad">connecter ?</span>',
      'contact.lead': 'Parlez-nous de votre projet : notre équipe vous recontacte dans les meilleurs délais.',
      'contact.email': 'E-mail',
      'contact.phone': 'Téléphone',
      'contact.office': 'Adresse',
      'contact.address': 'À confirmer — Algérie',
      'contact.hoursLabel': 'Horaires',
      'contact.hours': 'Dim – Jeu · 08h30 – 17h00',
      'sw.latency': 'Latence',
      'sw.throughput': 'Débit',
      'sw.packets': 'Paquets',

      'form.name': 'Nom complet',
      'form.namePh': 'Nom et prénom',
      'form.emailPh': 'vous@entreprise.dz',
      'form.company': 'Entreprise',
      'form.companyPh': 'Nom de l’entreprise',
      'form.wilaya': 'Wilaya',
      'form.wilayaPh': 'Sélectionnez votre wilaya…',
      'form.abroad': 'Hors Algérie',
      'form.need': 'Service souhaité',
      'form.otherInfra': 'Plusieurs besoins / autre (infrastructures)',
      'form.otherIso': 'Plusieurs besoins / autre (ISO)',
      'form.iso9001': 'ISO 9001 — Qualité',
      'form.iso27001': 'ISO/IEC 27001 — Sécurité de l’information',
      'form.iso14001': 'ISO 14001 — Environnement',
      'form.iso45001': 'ISO 45001 — Santé & sécurité',
      'form.project': 'Votre projet',
      'form.projectPh': 'Site, périmètre, délais…',
      'form.send': 'Envoyer la demande',
      'form.note': '* Champs obligatoires',
      'form.sent': 'Demande envoyée ✓ (démo — à relier à une boîte mail ou un serveur)',
      'form.errName': 'Merci d’indiquer votre nom.',
      'form.errPhone': 'Numéro algérien attendu, ex. 05 55 12 34 56 ou +213 21 12 34 56.',
      'form.errEmail': 'Cette adresse e-mail ne semble pas valide.',
      'form.consent': 'J’accepte que HyperLink utilise ces informations pour me recontacter au sujet de ma demande.',
      'form.errConsent': 'Merci de confirmer votre accord pour être recontacté.',
      'form.sending': 'Envoi en cours…',
      'form.sentReal': 'Merci ! Votre demande a bien été envoyée — nous vous recontactons dans les meilleurs délais.',
      'form.errServer': 'L’envoi est impossible pour le moment. Appelez-nous ou écrivez-nous directement :',

      'footer.tagline': 'Services d’infrastructures & courant faible, consulting & certification ISO — pour que votre entreprise reste connectée.',
      'footer.infra': 'Infrastructures',
      'footer.lowvoltage': 'Courant faible',
      'footer.iso': 'Consulting ISO',
      'footer.certification': 'Certification',
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

  // French typography: narrow no-break space before : ; ? ! so they never start a line
  Object.keys(DICT.fr).forEach(k => { DICT.fr[k] = DICT.fr[k].replace(/ ([:;?!])/g, '\u202F$1'); });

  const t = key => (DICT[lang] && DICT[lang][key]) ?? DICT.en[key] ?? key;

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-label]').forEach(el => { el.label = t(el.dataset.i18nLabel); });
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

  // wilaya list must exist before the first translation pass (its last option is translated)
  const WILAYAS = ['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
    'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
    'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M’Sila', 'Mascara', 'Ouargla',
    'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
    'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M’Ghair', 'El Meniaa'];
  document.querySelectorAll('select[data-wilayas]').forEach(sel => {
    WILAYAS.forEach((name, i) => {
      const code = String(i + 1).padStart(2, '0');
      sel.add(new Option(`${code} — ${name}`, code));
    });
    const abroad = new Option('Outside Algeria', 'abroad');
    abroad.dataset.i18n = 'form.abroad';
    sel.add(abroad);
  });

  apply();
  window.HL_I18N = { t, set, get lang() { return lang; } };
})();
