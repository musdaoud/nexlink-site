"""
Validation messages returned to the website, in the visitor's language.

Each error also carries a `code` that matches a key of the website's js/i18n.js,
so the front-end can re-translate it if the visitor switches language afterwards.
"""

MESSAGES = {
    "fr": {
        "form.errName": "Merci d’indiquer votre nom.",
        "form.errPhone": "Numéro algérien attendu, ex. 05 55 12 34 56 ou +213 21 12 34 56.",
        "form.errEmail": "Cette adresse e-mail ne semble pas valide.",
        "form.errConsent": "Merci de confirmer votre accord pour être recontacté.",
        "form.errFile": "Fichier non accepté : PDF, Word, Excel, JPG ou PNG, 10 Mo maximum.",
        "form.errInvalid": "Cette valeur n’est pas valide.",
        "form.errTooLong": "Ce texte est trop long.",
        "form.errRate": "Trop de demandes envoyées. Réessayez dans quelques minutes ou appelez-nous.",
        "form.errCaptcha": "La vérification anti-spam a échoué. Rechargez la page puis réessayez.",
        "form.errTooLarge": "La demande est trop volumineuse (10 Mo maximum pour la pièce jointe).",
    },
    "en": {
        "form.errName": "Please enter your name.",
        "form.errPhone": "Enter an Algerian number, e.g. 05 55 12 34 56 or +213 21 12 34 56.",
        "form.errEmail": "This email address doesn’t look valid.",
        "form.errConsent": "Please confirm you agree to be contacted.",
        "form.errFile": "File not accepted: PDF, Word, Excel, JPG or PNG, 10 MB max.",
        "form.errInvalid": "This value isn’t valid.",
        "form.errTooLong": "This text is too long.",
        "form.errRate": "Too many requests. Please try again in a few minutes or call us.",
        "form.errCaptcha": "The anti-spam check failed. Please reload the page and try again.",
        "form.errTooLarge": "The request is too large (10 MB max for the attachment).",
    },
}


def msg(lang, code):
    return MESSAGES.get(lang, MESSAGES["fr"]).get(code) or MESSAGES["fr"][code]
