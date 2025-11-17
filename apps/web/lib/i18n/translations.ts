export type Locale = "fr" | "en";

export const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.projects": "Projets",
    "nav.newProject": "Nouveau Projet",
    "nav.admin": "Admin",
    "nav.login": "Connexion",
    "nav.logout": "Déconnexion",
    "nav.search": "Rechercher...",

    // Projects
    "projects.title": "Projets",
    "projects.empty": "Aucun projet",
    "projects.create": "Créer un projet",
    "projects.addDocuments": "Ajouter des documents",
    "projects.viewGraph": "Voir le graphe",
    "projects.exportHtml": "Exporter HTML",
    "projects.documents": "Documents",
    "projects.entities": "Entités",

    // Documents
    "documents.title": "Titre",
    "documents.type": "Type",
    "documents.status": "Statut",
    "documents.pending": "En attente",
    "documents.processing": "En cours",
    "documents.completed": "Terminé",
    "documents.verified": "Vérifié",
    "documents.ocr": "OCR",
    "documents.extract": "Extraire les entités",
    "documents.delete": "Supprimer",

    // Entities
    "entities.title": "Graphe d'entités",
    "entities.person": "Personne",
    "entities.place": "Lieu",
    "entities.event": "Événement",
    "entities.object": "Objet",
    "entities.concept": "Concept",
    "entities.total": "Total entités",
    "entities.relationships": "Relations",

    // Actions
    "action.save": "Enregistrer",
    "action.cancel": "Annuler",
    "action.confirm": "Confirmer",
    "action.delete": "Supprimer",
    "action.edit": "Modifier",
    "action.back": "Retour",

    // Messages
    "msg.loading": "Chargement...",
    "msg.error": "Erreur",
    "msg.success": "Succès",
    "msg.noResults": "Aucun résultat",
    "msg.confirmDelete": "Êtes-vous sûr de vouloir supprimer",

    // Admin
    "admin.settings": "Paramètres",
    "admin.apiKeys": "Clés API",
    "admin.ocrProvider": "Fournisseur OCR",

    // Auth
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.login": "Se connecter",
    "auth.loginError": "Email ou mot de passe incorrect",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.newProject": "New Project",
    "nav.admin": "Admin",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.search": "Search...",

    // Projects
    "projects.title": "Projects",
    "projects.empty": "No projects",
    "projects.create": "Create project",
    "projects.addDocuments": "Add documents",
    "projects.viewGraph": "View graph",
    "projects.exportHtml": "Export HTML",
    "projects.documents": "Documents",
    "projects.entities": "Entities",

    // Documents
    "documents.title": "Title",
    "documents.type": "Type",
    "documents.status": "Status",
    "documents.pending": "Pending",
    "documents.processing": "Processing",
    "documents.completed": "Completed",
    "documents.verified": "Verified",
    "documents.ocr": "OCR",
    "documents.extract": "Extract entities",
    "documents.delete": "Delete",

    // Entities
    "entities.title": "Entity Graph",
    "entities.person": "Person",
    "entities.place": "Place",
    "entities.event": "Event",
    "entities.object": "Object",
    "entities.concept": "Concept",
    "entities.total": "Total entities",
    "entities.relationships": "Relationships",

    // Actions
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.confirm": "Confirm",
    "action.delete": "Delete",
    "action.edit": "Edit",
    "action.back": "Back",

    // Messages
    "msg.loading": "Loading...",
    "msg.error": "Error",
    "msg.success": "Success",
    "msg.noResults": "No results",
    "msg.confirmDelete": "Are you sure you want to delete",

    // Admin
    "admin.settings": "Settings",
    "admin.apiKeys": "API Keys",
    "admin.ocrProvider": "OCR Provider",

    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.login": "Sign in",
    "auth.loginError": "Invalid email or password",
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;
