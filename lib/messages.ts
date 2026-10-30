/**
 * Fichier de messages unique (FR). Tout libellé d'interface vit ici.
 * Ton : clair, professionnel ; erreurs utiles, jamais techniques.
 */
export const m = {
  brand: { name: "MOSALI", tagline: "Les bons talents. Les bons projets.\nUne confiance partagée." },

  common: {
    retry: "Réessayer", cancel: "Annuler", confirm: "Confirmer", save: "Enregistrer", close: "Fermer",
    back: "Retour", loading: "Chargement…", reset: "Réinitialiser", search: "Rechercher", edit: "Modifier",
    delete: "Supprimer", view: "Voir", optional: "facultatif", previous: "Précédent", next: "Suivant",
    openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu", toggleTheme: "Changer de thème",
    themeLight: "Clair", themeDark: "Sombre", saved: "Enregistré", saving: "Enregistrement…",
    page: (p: number, total: number) => `Page ${p} sur ${total}`,
    skipToContent: "Aller au contenu",
  },

  nav: {
    home: "Accueil", findMission: "Trouver une mission", howItWorks: "Comment ça marche",
    publish: "Publier une offre", login: "Connexion", register: "Créer un compte", logout: "Se déconnecter",
    offers: "Offres de mission", myOffers: "Mes offres", profile: "Profil", verification: "Vérification",
    account: "Compte",
  },

  landing: {
    kicker: "Talents vérifiés · Projets sérieux",
    title: "Le talent qu’il faut.",
    titleAccent: "Le projet qui compte.",
    lead: "MOSALI connecte les entreprises d’Afrique francophone aux meilleurs indépendants, dans un cadre simple et fiable.",
    search: {
      query: "Que recherchez-vous ?", queryPlaceholder: "Métier, compétence ou mot-clé",
      domain: "Domaine", allDomains: "Tous les domaines",
      mode: "Mode de travail", allModes: "Tous les modes", remote: "À distance", onsite: "Sur site",
      cta: "Explorer les missions", verified: "Les profils et projets sont vérifiés par notre équipe.",
    },
    trust: {
      title: "Un réseau construit sur la confiance.", lead: "Des collaborations plus simples, du premier contact au contrat.",
      stats: [
        { value: "120+", label: "talents vérifiés" },
        { value: "48", label: "missions publiées" },
        { value: "6", label: "domaines d’expertise" },
      ],
    },
    offers: {
      kicker: "OPPORTUNITÉS RÉCENTES", title: "Des projets à votre mesure",
      lead: "Des missions claires, publiées par des organisations vérifiées.", seeAll: "Voir toutes les offres",
    },
    how: {
      kicker: "SIMPLE PAR CONCEPTION", title: "Une collaboration qui va à l’essentiel",
      lead: "Trois étapes pour passer d’un besoin à une mission concrète.",
      steps: [
        { title: "Explorez", text: "Filtrez les missions par expertise, budget et mode de travail." },
        { title: "Échangez", text: "Présentez votre profil et validez les attentes avec le porteur." },
        { title: "Collaborez", text: "Formalisez la mission dans un cadre clair, suivi et sécurisé." },
      ],
    },
    cta: {
      kicker: "POUR LES PORTEURS DE PROJET", title: "Votre prochain talent est déjà ici.",
      lead: "Présentez votre besoin et recevez des profils adaptés à votre mission.",
    },
    footer: {
      platform: "Plateforme", resources: "Ressources", help: "Centre d’aide", trust: "Confiance & sécurité",
      contact: "Nous contacter", availableTitle: "Disponible au Congo",
      availableText: "Brazzaville · Pointe-Noire\net partout à distance.",
      rights: "© 2026 MOSALI. Tous droits réservés.", privacy: "Confidentialité", terms: "Conditions",
    },
    heroAlt: "Professionnels africains réunis autour d’un ordinateur portable",
  },

  auth: {
    login: {
      title: "Heureux de vous revoir", lead: "Accédez à votre espace MOSALI.", submit: "Se connecter",
      noAccount: "Pas encore de compte ?", forgot: "Mot de passe oublié ?",
    },
    register: {
      title: "Créer votre compte", lead: "Rejoignez MOSALI en quelques instants.", submit: "Créer mon compte",
      hasAccount: "Déjà inscrit ?", iAm: "Je suis…",
      freelance: "Freelance", freelanceHint: "Je cherche des missions",
      porteur: "Porteur de projet", porteurHint: "Je publie des missions",
      terms: "En créant un compte, vous acceptez nos conditions d’utilisation.",
    },
    verifyEmail: {
      title: "Vérifiez votre boîte mail",
      lead: (email: string) => `Nous avons envoyé un lien d’activation à ${email}. Cliquez dessus pour activer votre compte.`,
      leadNoEmail: "Nous venons de vous envoyer un lien d’activation. Cliquez dessus pour activer votre compte.",
      hint: "Pensez à vérifier vos courriers indésirables.", backToLogin: "Retour à la connexion",
    },
    forgot: {
      title: "Mot de passe oublié", lead: "Saisissez votre e-mail, nous vous envoyons un lien de réinitialisation.",
      submit: "Envoyer le lien", sent: "Si un compte existe pour cette adresse, un e-mail vient d’être envoyé.",
    },
    reset: {
      title: "Nouveau mot de passe", lead: "Choisissez un mot de passe d’au moins 8 caractères.",
      submit: "Mettre à jour", done: "Mot de passe mis à jour.",
    },
    fields: {
      fullName: "Nom complet", fullNamePlaceholder: "Ex. Grâce Mabiala", email: "Adresse e-mail",
      emailPlaceholder: "vous@entreprise.com", password: "Mot de passe", passwordPlaceholder: "8 caractères minimum",
      confirmPassword: "Confirmer le mot de passe", showPassword: "Afficher le mot de passe", hidePassword: "Masquer le mot de passe",
    },
    blocked: "Ce compte est suspendu. Contactez le support pour en savoir plus.",
    linkInvalid: "Ce lien est invalide ou a expiré. Demandez-en un nouveau.",
    loggedOut: "Vous êtes déconnecté.",
  },

  offerStatus: {
    draft: "Brouillon", active: "Active", filled: "Pourvue", cancelled: "Annulée", expired: "Expirée",
  },
  identityStatus: { none: "Non vérifiée", pending: "En cours", approved: "Vérifiée", rejected: "Refusée" },
  contract: { forfait: "Forfait", regie: "Régie", temps_partiel: "Temps partiel" },
  casquette: { freelance: "Freelance", porteur: "Porteur de projet", porteurShort: "Porteur", switchTo: "Basculer en", active: "Casquette active" },

  verifiedLabel: "Vérifiée",
  verifiedOrg: "Organisation vérifiée",
  remote: "À distance",

  offers: {
    pageTitle: "Offres de mission", pageLead: "Missions actives publiées par des organisations vérifiées.",
    resultCount: (n: number) => `${n} mission${n > 1 ? "s" : ""} trouvée${n > 1 ? "s" : ""}`,
    filters: {
      q: "Mot-clé", qPlaceholder: "Métier, compétence…", category: "Domaine", allCategories: "Tous les domaines",
      contract: "Type de contrat", allContracts: "Tous les types", budgetMin: "Budget min", budgetMax: "Budget max",
      location: "Lieu", locationPlaceholder: "Ville", remoteOnly: "Télétravail uniquement",
      apply: "Appliquer", negativeBudget: "Le budget ne peut pas être négatif.", invalidRange: "Le budget minimum dépasse le maximum.",
    },
    empty: { title: "Aucune mission trouvée", text: "Essayez un autre mot-clé ou élargissez vos critères." },
    emptyDefault: { title: "Aucune offre active pour le moment", text: "Revenez bientôt : de nouvelles missions sont publiées régulièrement." },
    error: { title: "Impossible de charger les missions", text: "Vérifiez votre connexion puis réessayez." },
    card: { viewMission: "Voir la mission", applications: (n: number) => `${n} candidature${n > 1 ? "s" : ""}`, deadline: "Date limite" },
    detail: {
      description: "Description", skills: "Compétences", budget: "Budget", duration: "Durée", contract: "Contrat",
      location: "Lieu", deadline: "Date limite", published: "Publiée le", category: "Domaine", apply: "Postuler",
      applySoon: "Bientôt disponible", applyHint: "Les candidatures ouvriront prochainement.",
      loginToApply: "Connectez-vous pour suivre cette mission", share: "Lien partageable",
      notFound: "Cette offre n’est plus disponible.", backToList: "Retour aux offres", by: "Publiée par",
    },
    mine: {
      pageTitle: "Mes offres", pageLead: "Créez, publiez et suivez vos offres de mission.", create: "Nouvelle offre",
      empty: { title: "Aucune offre pour l’instant", text: "Créez un brouillon, complétez-le puis publiez-le." },
      columns: { title: "Offre", status: "Statut", budget: "Budget", deadline: "Date limite", updated: "Mise à jour", actions: "Actions" },
      needPorteur: { title: "Casquette porteur requise", text: "Passez en casquette porteur de projet pour gérer des offres." },
      verifyBanner: "Votre identité n’est pas encore vérifiée : vous pourrez rédiger vos offres, mais pas les publier.",
      verifyCta: "Vérifier mon identité",
    },
    actions: {
      publish: "Publier", close: "Clôturer", cancel: "Annuler l’offre", extend: "Prolonger", delete: "Supprimer",
      edit: "Modifier", view: "Voir",
    },
    form: {
      createTitle: "Nouvelle offre", editTitle: "Modifier l’offre",
      createLead: "Commencez par un titre ; vous complétez le reste ensuite, tout est enregistré automatiquement.",
      editLead: "Vos modifications sont enregistrées automatiquement tant que l’offre est un brouillon.",
      lockedContract: "Le type de contrat ne peut plus être modifié une fois l’offre publiée.",
      lockedDeadline: "Utilisez « Prolonger » pour repousser la date limite.",
      createSubmit: "Créer le brouillon", saveActive: "Enregistrer les modifications",
      autosave: { idle: "Brouillon", saving: "Enregistrement…", saved: "Brouillon enregistré", error: "Échec de l’enregistrement" },
      fields: {
        title: "Titre de la mission", titlePlaceholder: "Ex. Développeur React confirmé",
        description: "Description", descriptionPlaceholder: "Contexte, livrables attendus, déroulé, profil recherché…",
        descriptionHint: "30 caractères minimum pour publier.",
        category: "Domaine", categoryPlaceholder: "Sélectionnez un domaine",
        skills: "Compétences requises", skillsHint: "Sélectionnez au moins une compétence.",
        budgetMin: "Budget minimum (FCFA)", budgetMax: "Budget maximum (FCFA)",
        duration: "Durée (jours)", contract: "Type de contrat", contractPlaceholder: "Choisir",
        location: "Lieu", locationPlaceholder: "Ex. Brazzaville", remote: "Télétravail possible",
        deadline: "Date limite de candidature", deadlineHint: "Au plus 90 jours à partir d’aujourd’hui.",
      },
    },
    publishDialog: {
      title: "Publier cette offre ?", lead: "Vérifiez le récapitulatif. Une fois publiée, l’offre est visible par tous les freelances.",
      confirm: "Publier maintenant", summary: "Récapitulatif",
    },
    closeDialog: {
      title: "Clôturer l’offre — mission pourvue", confirm: "Clôturer définitivement",
      body: (pending: number) =>
        `Cette action est irréversible. ${pending} candidature${pending > 1 ? "s" : ""} en attente ${pending > 1 ? "seront fermées" : "sera fermée"}.`,
    },
    cancelDialog: {
      title: "Annuler cette offre ?", body: "L’offre ne sera plus visible. Cette action est irréversible.",
      reasonLabel: "Motif (facultatif)", confirm: "Annuler l’offre",
    },
    deleteDialog: { title: "Supprimer ce brouillon ?", body: "Le brouillon sera supprimé définitivement.", confirm: "Supprimer" },
    extendDialog: { title: "Prolonger la date limite", label: "Nouvelle date limite", confirm: "Prolonger" },
    toasts: {
      created: "Brouillon créé.", saved: "Modifications enregistrées.", published: "Offre publiée.", closed: "Offre clôturée.",
      cancelled: "Offre annulée.", deleted: "Brouillon supprimé.", extended: "Date limite prolongée.",
      removed: "Offre retirée de la plateforme.", restored: "Offre rétablie.", flagged: "Offre signalée.",
    },
    moderation: {
      title: "Modération", remove: "Retirer l’offre", restore: "Rétablir l’offre", flag: "Signaler sans retirer",
      removeTitle: "Retirer cette offre ?", removeBody: "Le porteur sera notifié du motif.",
      reasonLabel: "Motif (obligatoire)", flagTitle: "Signaler cette offre", flagLabel: "Note interne",
      restoreTitle: "Rétablir cette offre ?", restoreLabel: "Justification (obligatoire)", moderatedBadge: "Retirée par la modération",
    },
  },

  verification: { title: "Vérification d’identité", lead: "Cette étape arrive très bientôt.", soon: "Bientôt disponible" },

  states: {
    errorTitle: "Un problème est survenu", errorText: "Une erreur inattendue s’est produite. Réessayez dans un instant.",
    notFoundTitle: "Page introuvable", notFoundText: "Cette page n’existe pas ou a été déplacée.",
    goHome: "Retour à l’accueil",
  },

  errors: {
    VALIDATION: "Certaines informations sont invalides. Corrigez-les puis réessayez.",
    UNAUTHENTICATED: "Votre session a expiré. Reconnectez-vous pour continuer.",
    ACCOUNT_BLOCKED: "Ce compte est suspendu. Contactez le support.",
    FORBIDDEN: "Vous n’avez pas l’autorisation d’effectuer cette action.",
    OFFER_NOT_FOUND: "Cette offre est introuvable.",
    INVALID_STATUS: "Cette action n’est pas possible dans l’état actuel de l’offre.",
    INVALID_TRANSITION: "Ce changement d’état n’est pas autorisé.",
    OFFER_LOCKED: "Cette offre est terminée et ne peut plus être modifiée.",
    CONTRACT_TYPE_LOCKED: "Le type de contrat ne peut plus être modifié.",
    USE_EXTEND_DEADLINE: "Utilisez « Prolonger » pour modifier la date limite d’une offre publiée.",
    CASQUETTE_REQUIRED: "Passez en casquette porteur de projet pour publier une offre.",
    IDENTITY_REQUIRED: "Votre identité doit être vérifiée avant de publier une offre.",
    MISSING_FIELDS: "Complétez les champs en surbrillance avant de publier.",
    INVALID_DEADLINE: "La date limite doit être future et au plus 90 jours après aujourd’hui.",
    REASON_REQUIRED: "Un motif d’au moins 5 caractères est obligatoire.",
    INVALID_CREDENTIALS: "E-mail ou mot de passe incorrect.",
    EMAIL_NOT_CONFIRMED: "Activez votre compte via le lien reçu par e-mail avant de vous connecter.",
    EMAIL_TAKEN: "Un compte existe déjà avec cette adresse e-mail.",
    WEAK_PASSWORD: "Ce mot de passe est trop faible. Utilisez au moins 8 caractères variés.",
    RATE_LIMITED: "Trop de tentatives. Patientez quelques minutes puis réessayez.",
    NETWORK: "Connexion instable. Vérifiez votre réseau puis réessayez.",
    UNKNOWN: "Une erreur est survenue. Réessayez dans un instant.",
    requiredField: "Ce champ est obligatoire.",
  },

  validation: {
    required: "Ce champ est obligatoire.", email: "Adresse e-mail invalide.",
    passwordMin: "8 caractères minimum.", passwordMatch: "Les mots de passe ne correspondent pas.",
    nameMin: "Saisissez votre nom complet.", titleMin: "3 caractères minimum.", titleMax: "120 caractères maximum.",
    descriptionMax: "5 000 caractères maximum.", budgetNegative: "Le budget ne peut pas être négatif.",
    budgetRange: "Le maximum doit être supérieur ou égal au minimum.", durationRange: "Entre 1 et 730 jours.",
    deadlineFuture: "La date doit être dans le futur.", deadlineMax: "Au plus 90 jours à partir d’aujourd’hui.",
    number: "Saisissez un nombre valide.", reasonMin: "5 caractères minimum.",
  },
} as const;
