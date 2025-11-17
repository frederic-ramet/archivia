# Guide Utilisateur Archivia

Bienvenue dans Archivia, votre plateforme de préservation et valorisation du patrimoine culturel. Ce guide vous accompagne dans l'utilisation de l'application.

---

## Table des Matières

1. [Démarrage Rapide](#démarrage-rapide)
2. [Page d'Accueil](#page-daccueil)
3. [Gestion des Projets](#gestion-des-projets)
4. [Upload de Documents](#upload-de-documents)
5. [Galerie de Documents](#galerie-de-documents)
6. [Fonctionnalités Avancées](#fonctionnalités-avancées)
7. [FAQ](#faq)

---

## Démarrage Rapide

### Accéder à l'Application

1. Ouvrez votre navigateur web (Chrome, Firefox, Safari recommandés)
2. Rendez-vous sur l'adresse de votre instance Archivia
3. Vous arrivez sur la page d'accueil

### Premier Projet

1. Cliquez sur **"Nouveau Projet"** dans la navigation
2. Remplissez le nom de votre projet
3. Sélectionnez les fonctionnalités souhaitées
4. Cliquez sur **"Créer le projet"**

---

## Page d'Accueil

La page d'accueil présente Archivia et ses fonctionnalités principales.

### Navigation

- **Logo Archivia** : Retour à l'accueil
- **Accueil** : Page de présentation
- **Projets** : Liste de vos projets
- **Nouveau Projet** : Créer un nouveau projet

### Sections

1. **Section Hero** : Présentation d'Archivia
2. **Fonctionnalités** : Les capacités de la plateforme
3. **Appel à l'Action** : Commencer votre premier projet

---

## Gestion des Projets

### Créer un Projet

Un projet représente une collection patrimoniale complète (journal, album photo, correspondance, etc.).

#### Étape 1 : Informations Générales

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Nom** | Titre de votre projet | Journal de Guerre 1918 |
| **Identifiant (slug)** | URL unique (auto-généré) | journal-de-guerre-1918 |
| **Description** | Présentation détaillée | "Journal intime d'un soldat..." |
| **Public** | Accessible à tous | Coché = visible publiquement |

#### Étape 2 : Métadonnées

Informations contextuelles sur votre collection :

- **Institution** : Archives, musée, famille...
- **Conservateur** : Personne responsable
- **Période de début** : Date de début (ex: 1914)
- **Période de fin** : Date de fin (ex: 1918)
- **Thèmes** : Mots-clés séparés par virgules

Exemple de thèmes :
```
Première Guerre Mondiale, Correspondance, Vie quotidienne, Spiritualité
```

#### Étape 3 : Fonctionnalités

Activez les modules selon vos besoins :

| Fonctionnalité | Description |
|----------------|-------------|
| **OCR (Transcription)** | Reconnaissance automatique du texte manuscrit |
| **Annotations** | Ajout de notes et commentaires |
| **Points d'intérêt** | Zones cliquables sur les documents |
| **Récits narratifs** | Création d'histoires guidées |
| **Frise chronologique** | Visualisation temporelle |
| **Carte géographique** | Localisation des événements |
| **Ontologie progressive** | Construction du graphe de connaissances |
| **Génération IA** | Création automatique de contenus |

### Liste des Projets

La page `/projects` affiche tous vos projets avec :

- **Vignettes** : Aperçu de chaque projet
- **Statut** : Draft (brouillon), Active (actif), Archived (archivé)
- **Visibilité** : Public ou Privé
- **Date de modification** : Dernière mise à jour
- **Pagination** : Navigation entre les pages

#### Filtres et Recherche

Utilisez la pagination pour naviguer dans vos projets. Les filtres avancés seront disponibles dans les prochaines versions.

### Détails d'un Projet

Cliquez sur un projet pour voir :

1. **Informations générales** : Nom, description, statut
2. **Métadonnées** : Institution, conservateur, période
3. **Thèmes** : Tags colorés
4. **Fonctionnalités actives** : Modules activés
5. **Galerie de documents** : Tous les fichiers du projet

---

## Upload de Documents

### Ajouter des Documents

1. Allez sur la page de votre projet
2. Cliquez sur **"Ajouter des documents"**
3. Une fenêtre modale s'ouvre

### Méthodes d'Upload

#### Drag & Drop (Glisser-Déposer)

1. Ouvrez l'explorateur de fichiers de votre ordinateur
2. Sélectionnez vos fichiers
3. Glissez-les dans la zone indiquée
4. Relâchez pour ajouter

#### Parcourir

1. Cliquez sur **"Parcourir les fichiers"**
2. Naviguez dans vos dossiers
3. Sélectionnez un ou plusieurs fichiers
4. Cliquez sur "Ouvrir"

### Formats Acceptés

| Format | Extension | Description |
|--------|-----------|-------------|
| JPEG | .jpg, .jpeg | Photos standard |
| PNG | .png | Images avec transparence |
| TIFF | .tiff, .tif | Scans haute qualité |
| WebP | .webp | Format moderne optimisé |
| PDF | .pdf | Documents multi-pages |

**Limite de taille** : 50 MB par fichier

### Métadonnées des Documents

Pour chaque fichier, vous pouvez renseigner :

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Titre** | Nom descriptif | "Lettre du 15 août 1918" |
| **Catégorie** | Type de document | Correspondance, Photo, Carte |
| **Période** | Date ou période | "Août 1918" |
| **Tags** | Mots-clés (virgules) | famille, amour, espoir |

### Processus d'Upload

1. **Sélection** : Choisissez vos fichiers
2. **Édition** : Modifiez les métadonnées
3. **Prévisualisation** : Vérifiez les aperçus
4. **Confirmation** : Cliquez sur "Uploader"
5. **Progression** : Barre de progression visible
6. **Terminé** : La galerie se rafraîchit automatiquement

---

## Galerie de Documents

### Affichage

Les documents s'affichent en grille avec :

- **Vignette** : Aperçu de l'image
- **Titre** : Nom du document
- **Type** : Image, Manuscrit, Imprimé
- **Statut de transcription** :
  - `pending` : En attente
  - `processing` : En cours
  - `completed` : Terminé
  - `verified` : Vérifié

### Navigation

- La galerie affiche jusqu'à 50 documents
- Pagination pour les collections plus grandes
- Tri par date de création (plus récent en premier)

### Actions sur les Documents

*(Fonctionnalités à venir)*

- Cliquer pour agrandir
- Modifier les métadonnées
- Ajouter des annotations
- Lancer la transcription OCR
- Créer des points d'intérêt

---

## Fonctionnalités Avancées

### OCR et Transcription

L'OCR (Optical Character Recognition) permet de :

1. Reconnaître le texte manuscrit ou imprimé
2. Générer une transcription éditable
3. Vérifier et corriger les erreurs
4. Améliorer la recherche dans vos archives

**Statuts de transcription :**
- 🔘 **Pending** : Pas encore lancé
- 🔄 **Processing** : En cours de traitement
- ✅ **Completed** : Transcription automatique terminée
- ✔️ **Verified** : Relecture humaine effectuée

### Ontologie Progressive

Le système construit automatiquement :

- **Personnes** mentionnées dans les documents
- **Lieux** géographiques référencés
- **Événements** historiques
- **Concepts** et thèmes récurrents
- **Relations** entre ces entités

Cela permet une recherche sémantique avancée et la découverte de connexions cachées.

### Récits Narratifs

Créez des parcours guidés :

1. Sélectionnez des documents clés
2. Définissez un ordre de présentation
3. Ajoutez des transitions et points de focus
4. Rédigez des questions pour guider la réflexion
5. Publiez votre récit

### Génération IA

L'intelligence artificielle peut :

- Résumer automatiquement les documents
- Générer des questions pédagogiques
- Suggérer des connexions thématiques
- Créer des chronologies narratives

---

## Bonnes Pratiques

### Organisation de vos Archives

1. **Nommez clairement** vos fichiers avant l'upload
2. **Catégorisez** systématiquement vos documents
3. **Datez** précisément chaque élément
4. **Taguez** avec des mots-clés pertinents
5. **Documentez** le contexte historique

### Qualité des Scans

Pour de meilleurs résultats OCR :

- **Résolution** : Minimum 300 DPI
- **Format** : TIFF ou PNG (sans compression)
- **Éclairage** : Uniforme, sans reflets
- **Cadrage** : Document entier visible
- **Netteté** : Image non floue

### Sauvegarde

- Conservez toujours vos originaux numériques
- Exportez régulièrement vos projets
- Utilisez la fonction d'export statique pour archiver

---

## FAQ

### Questions Fréquentes

**Q : Combien de projets puis-je créer ?**
R : Il n'y a pas de limite. Créez autant de projets que nécessaire.

**Q : Puis-je modifier un projet après sa création ?**
R : Oui, tous les paramètres sont modifiables à tout moment.

**Q : Mes documents sont-ils sécurisés ?**
R : Les documents sont stockés localement sur votre serveur. Configurez un projet en "Privé" pour restreindre l'accès.

**Q : Quels formats de sortie sont disponibles ?**
R : Actuellement, les données sont accessibles via l'interface web. L'export HTML statique sera disponible prochainement.

**Q : L'OCR fonctionne-t-il sur les manuscrits anciens ?**
R : Oui, grâce à des modèles spécialisés. La qualité dépend de la lisibilité du document original.

**Q : Puis-je collaborer avec d'autres utilisateurs ?**
R : La fonctionnalité de collaboration est prévue dans les prochaines versions.

---

## Support

### Obtenir de l'Aide

- **Documentation** : Ce guide et le README technique
- **Issues GitHub** : Signaler des bugs ou demander des fonctionnalités
- **Email** : Contact de l'administrateur

### Signaler un Bug

Incluez dans votre rapport :
1. Description du problème
2. Étapes pour reproduire
3. Comportement attendu vs observé
4. Navigateur et système utilisés
5. Captures d'écran si pertinent

---

## Mises à Jour à Venir

### Version 0.2 (Prochaine)

- [ ] Visualiseur de documents en plein écran
- [ ] Édition des métadonnées inline
- [ ] Suppression de documents
- [ ] Filtres avancés dans la galerie

### Version 0.3

- [ ] Intégration OCR avec Tesseract/Claude
- [ ] Annotations sur les images
- [ ] Points d'intérêt interactifs
- [ ] Vérification collaborative

### Version 0.4

- [ ] Ontologie automatique
- [ ] Recherche sémantique
- [ ] Graphe de connaissances
- [ ] Export des données

### Version 1.0

- [ ] Génération de récits IA
- [ ] Export HTML statique
- [ ] PWA (Progressive Web App)
- [ ] Multi-utilisateurs et permissions

---

*Merci d'utiliser Archivia pour préserver et valoriser votre patrimoine culturel !*

**Version** : 0.1.0
**Dernière mise à jour** : Novembre 2025
