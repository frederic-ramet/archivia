# Guide Utilisateur Archivia

Bienvenue dans Archivia, votre plateforme de préservation et valorisation du patrimoine culturel. Ce guide vous accompagne dans l'utilisation de l'application.

---

## Table des Matières

1. [Démarrage Rapide](#démarrage-rapide)
2. [Connexion & Authentification](#connexion--authentification)
3. [Page d'Accueil](#page-daccueil)
4. [Gestion des Projets](#gestion-des-projets)
5. [Upload de Documents](#upload-de-documents)
6. [Galerie de Documents](#galerie-de-documents)
7. [OCR & Transcription](#ocr--transcription)
8. [Extraction d'Entités](#extraction-dentités)
9. [Graphe de Connaissances](#graphe-de-connaissances)
10. [Exploitation Sémantique & Ontologie](#exploitation-sémantique--ontologie-émergente)
11. [Génération d'Histoires](#génération-dhistoires)
12. [Gestion des Membres](#gestion-des-membres)
13. [Recherche Sémantique](#recherche-sémantique)
14. [Export HTML](#export-html)
15. [PWA & Mode Hors-ligne](#pwa--mode-hors-ligne)
16. [Multilingue (i18n)](#multilingue-i18n)
17. [Administration](#administration)
18. [FAQ](#faq)

---

## Démarrage Rapide

### Accéder à l'Application

1. Ouvrez votre navigateur web (Chrome, Firefox, Safari recommandés)
2. Rendez-vous sur l'adresse de votre instance Archivia
3. Vous arrivez sur la page d'accueil

### Premier Projet

1. Connectez-vous avec vos identifiants
2. Cliquez sur **"Nouveau Projet"** dans la navigation
3. Remplissez le nom de votre projet
4. Sélectionnez les fonctionnalités souhaitées
5. Cliquez sur **"Créer le projet"**

---

## Connexion & Authentification

### Se connecter

1. Cliquez sur **"Connexion"** dans la navigation
2. Entrez votre email et mot de passe
3. Cliquez sur **"Se connecter"**

### Compte par défaut

Après installation avec seed :
- **Email** : admin@archivia.fr
- **Mot de passe** : admin123
- **Rôle** : Administrateur

### Rôles Utilisateurs

| Rôle | Permissions |
|------|------------|
| **admin** | Accès complet, analytics, gestion globale |
| **curator** | Création projets, gestion documents, curation |
| **viewer** | Lecture seule des projets publics |

### Déconnexion

Cliquez sur **"Déconnexion"** dans la navigation pour vous déconnecter en toute sécurité.

---

## Page d'Accueil

La page d'accueil présente Archivia et ses fonctionnalités principales.

### Navigation

- **Logo Archivia** : Retour à l'accueil
- **Barre de recherche** : Recherche rapide documents/entités
- **Accueil** : Page de présentation
- **Projets** : Liste de vos projets
- **Admin** (si admin) : Accès au dashboard d'administration
- **Nouveau Projet** : Créer un nouveau projet
- **Connexion/Déconnexion** : Gestion de session
- **Sélecteur de langue** : FR/EN

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

Au survol d'un document, des boutons apparaissent :

- **Icône bleue** (coin supérieur gauche) : Lancer l'OCR
- **Icône verte** (coin inférieur gauche) : Extraire les entités (si OCR terminé)
- **Icône rouge** (coin supérieur droit) : Supprimer le document

---

## OCR & Transcription

L'OCR utilise l'API Vision de Claude pour transcrire vos documents.

### Lancer l'OCR

1. Survolez un document avec le statut **pending**
2. Cliquez sur l'**icône bleue** (document)
3. Attendez le traitement (quelques secondes)
4. Une alerte confirme le nombre de caractères extraits

### Prérequis

- **ANTHROPIC_API_KEY** configurée dans .env.local
- Document de type image (JPG, PNG, etc.)
- Statut de transcription = pending

### Résultats

- Le texte transcrit est stocké dans la base de données
- Le statut passe à **completed**
- Le contenu est disponible pour la recherche et l'extraction d'entités

**Statuts de transcription :**
- 🔘 **Pending** : Pas encore lancé
- 🔄 **Processing** : En cours de traitement
- ✅ **Completed** : Transcription automatique terminée
- ✔️ **Verified** : Relecture humaine effectuée

---

## Extraction d'Entités

Après l'OCR, extrayez automatiquement les entités du texte.

### Lancer l'extraction

1. Document avec statut **completed** (OCR terminé)
2. Survolez le document
3. Cliquez sur l'**icône verte** (tag)
4. Attendez l'analyse IA (10-30 secondes)
5. Alerte avec le nombre d'entités et relations trouvées

### Types d'entités détectées

| Type | Description | Exemples |
|------|-------------|----------|
| **Person** | Personnes mentionnées | Jean Dupont, Général Leclerc |
| **Place** | Lieux géographiques | Paris, Verdun, Maison familiale |
| **Event** | Événements historiques | Bataille de la Somme, Armistice |
| **Object** | Objets physiques | Lettre, Médaille, Fusil |
| **Concept** | Idées abstraites | Courage, Patrie, Espoir |

### Relations automatiques

Le système détecte les relations entre entités :
- *Jean Dupont* **participé_à** *Bataille de la Somme*
- *Verdun* **lieu_de** *Bataille de Verdun*
- *Médaille* **appartient_à** *Jean Dupont*

---

## Graphe de Connaissances

Visualisez les connexions entre entités du projet.

### Accéder au graphe

1. Ouvrez la page d'un projet
2. Cliquez sur **"Voir le graphe"** (bouton violet)
3. Le graphe interactif s'affiche

### Fonctionnalités

- **Visualisation force-directed** : Les entités se positionnent automatiquement
- **Codes couleurs** : Chaque type d'entité a une couleur distincte
  - 🔵 Bleu : Personnes
  - 🟢 Vert : Lieux
  - 🟡 Jaune : Événements
  - 🟠 Orange : Objets
  - 🟣 Violet : Concepts
- **Relations** : Lignes connectant les entités liées
- **Statistiques** : Compteurs par type d'entité

### Interprétation

Le graphe révèle :
- Les personnages centraux (nombreuses connexions)
- Les lieux récurrents
- Les thèmes dominants
- Les relations cachées entre documents

---

## Exploitation Sémantique & Ontologie Émergente

Archivia ne se contente pas de stocker vos documents : il **fait émerger une ontologie** structurée que les intelligences artificielles peuvent exploiter.

### Qu'est-ce que l'émergence ontologique ?

Quand vous importez des entretiens, archives ou témoignages dans Archivia :

1. **L'OCR transcrit** les textes
2. **L'IA extrait** automatiquement les entités (personnes, lieux, événements)
3. **Les relations se construisent** entre ces entités
4. **Une ontologie émerge** : un graphe de connaissances structuré

Cette ontologie n'est pas prédéfinie : elle **naît de vos données**.

### Exploitation par l'Intelligence Artificielle

L'ontologie générée permet aux LLMs (comme Claude) de :

**Raisonner sur vos données**
- Identifier des acteurs centraux
- Détecter des patterns récurrents
- Inférer des relations implicites
- Contextualiser des événements

**Répondre à des questions complexes**
- "Quels lieux sont mentionnés par plusieurs témoins ?"
- "Quelles personnes ont participé aux mêmes événements ?"
- "Quels thèmes émergent de cette collection ?"

**Générer du contenu enrichi**
- Récits narratifs cohérents
- Analyses croisées de témoignages
- Synthèses thématiques

### Cas d'usage concrets

#### Entretiens Oraux

Vous collectez 10 témoignages sur un événement historique :
- Archivia extrait automatiquement les personnes, lieux, dates mentionnés
- Le graphe révèle les convergences et divergences entre récits
- L'IA peut générer une synthèse qui croise les témoignages

#### Archives Familiales

Vous numérisez des lettres de correspondance :
- Les personnes mentionnées forment un réseau social implicite
- Les lieux dessinent des trajectoires de vie
- L'IA reconstruit l'arbre des relations familiales et sociales

#### Collections Documentaires

Vous constituez un fonds sur un thème (guerre, migration, métier...) :
- Les concepts abstraits émergent des documents
- Les événements se structurent chronologiquement
- L'IA génère des parcours thématiques cohérents

### Visualiser l'ontologie

Le graphe de connaissances (section précédente) est la **représentation visuelle de l'ontologie émergente**. Plus vous ajoutez de documents, plus le graphe s'enrichit et révèle la structure profonde de votre collection.

### Bonnes pratiques pour l'émergence

1. **Variété des sources** : mélangez types de documents pour enrichir l'ontologie
2. **Contexte historique** : renseignez les métadonnées pour améliorer l'extraction
3. **Volume critique** : plus de documents = ontologie plus riche
4. **Thématique cohérente** : restez dans un domaine pour des relations pertinentes

---

## Génération d'Histoires

Créez automatiquement des récits narratifs à partir de vos données.

### Générer une histoire

1. Ouvrez la page du projet
2. Cliquez sur **"Générer histoire"** (bouton rose)
3. Attendez la génération (30-60 secondes)
4. L'histoire s'affiche avec titre et contenu

### Styles disponibles

| Style | Description |
|-------|-------------|
| **Narrative** | Histoire fluide et immersive |
| **Documentary** | Approche factuelle et chronologique |
| **Educational** | Format pédagogique avec explications |

### Contenu généré

L'histoire intègre :
- Les entités extraites (personnes, lieux, événements)
- Les relations détectées
- Les transcriptions des documents
- Le contexte du projet (période, thèmes)

### Personnalisation

Les options de longueur :
- **Court** : ~200 mots
- **Moyen** : ~500 mots (par défaut)
- **Long** : ~1000 mots

---

## Gestion des Membres

Partagez vos projets avec d'autres utilisateurs.

### Voir les membres

En bas de la page projet, la section **"Membres du projet"** liste tous les membres avec leur rôle.

### Ajouter un membre (Owner/Admin uniquement)

1. Cliquez sur **"Ajouter un membre"**
2. Entrez l'**email** de l'utilisateur
3. Sélectionnez son **rôle** :
   - **Lecteur** : Peut voir le projet
   - **Éditeur** : Peut modifier les documents
4. Cliquez sur **"Ajouter"**

### Retirer un membre

1. Trouvez le membre dans la liste
2. Cliquez sur l'**icône poubelle** rouge
3. Confirmez la suppression

**Note** : Le propriétaire (owner) ne peut pas être retiré.

### Rôles du projet

| Rôle | Permissions |
|------|-------------|
| **Owner** | Propriété totale, gestion des membres |
| **Editor** | Modification des documents |
| **Viewer** | Lecture seule |

---

## Recherche Sémantique

Trouvez rapidement documents et entités.

### Utiliser la recherche

1. Cliquez sur la **barre de recherche** dans la navigation
2. Tapez votre requête (minimum 2 caractères)
3. Les résultats apparaissent en temps réel (délai 300ms)

### Types de résultats

- **Documents** : Badge vert, titre, extrait pertinent
- **Entités** : Badge violet, type (person, place, etc.)

### Calcul de pertinence

Le système calcule un score basé sur :
- Correspondance dans le titre : +10 points
- Correspondance dans le contenu : +5 points
- Position du terme trouvé

### Navigation

Cliquez sur un résultat pour naviguer vers :
- La page du projet contenant le document
- Le détail de l'entité

---

## Export HTML

Créez des sites statiques autonomes de vos projets.

### Exporter un projet

1. Ouvrez la page du projet
2. Cliquez sur **"Exporter HTML"** (bouton ambre)
3. Attendez la génération du ZIP
4. Le téléchargement démarre automatiquement

### Contenu de l'archive

Le fichier ZIP contient :
- `index.html` : Page d'accueil avec liste des documents
- `documents/` : Une page HTML par document
- `images/` : Toutes les images et miniatures
- Styles CSS intégrés (responsive)

### Utilisation

1. Décompressez l'archive
2. Ouvrez `index.html` dans un navigateur
3. Naviguez sans connexion internet
4. Partagez le dossier ou hébergez-le

### Cas d'usage

- Archives locales permanentes
- Partage avec des personnes sans accès à l'application
- Sauvegarde de sécurité
- Publication sur sites statiques

---

## PWA & Mode Hors-ligne

Archivia est une Progressive Web App installable.

### Installer l'application

Sur Chrome/Edge :
1. Visitez Archivia
2. Cliquez sur l'icône "Installer" dans la barre d'adresse
3. L'application s'installe comme une app native

Sur mobile :
1. Ouvrez Archivia dans le navigateur
2. Menu > "Ajouter à l'écran d'accueil"

### Fonctionnalités PWA

- **Icône sur le bureau** : Accès rapide
- **Mode plein écran** : Interface sans barre de navigateur
- **Cache intelligent** : Chargement plus rapide
- **Mode hors-ligne** : Pages déjà visitées disponibles sans internet

### Service Worker

Le service worker met en cache :
- Les pages visitées
- Les ressources statiques (CSS, JS, images)
- Les données API (stratégie network-first)

---

## Multilingue (i18n)

Archivia est disponible en Français et Anglais.

### Changer de langue

1. Cliquez sur le **sélecteur de langue** (FR/EN) dans la navigation
2. Sélectionnez votre langue
3. L'interface se met à jour instantanément

### Persistance

Votre choix de langue est :
- Sauvegardé dans localStorage
- Restauré automatiquement à chaque visite
- Appliqué à toute l'interface

### Détection automatique

Au premier chargement, Archivia :
1. Vérifie localStorage (préférence sauvegardée)
2. Sinon, détecte la langue du navigateur
3. Par défaut : Français

---

## Administration

Section réservée aux administrateurs.

### Accéder à l'admin

1. Connectez-vous avec un compte admin
2. Cliquez sur **"Admin"** dans la navigation

### Dashboard Analytics

Visualisez les statistiques globales :

- **Cartes récapitulatives** : Nombre de projets, documents, entités, relations
- **Répartition par statut** : Graphiques pour projets et documents
- **Types d'entités** : Distribution des entités détectées
- **Statistiques de traitement** : OCR complétés, miniatures générées
- **Activité récente** : Liste des derniers documents ajoutés

### Paramètres

Configurez l'application :
- Clés API (Claude/Anthropic)
- Fournisseur OCR
- Paramètres système

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
R : Vous pouvez exporter vos projets en HTML statique (ZIP téléchargeable). Les données sont également accessibles via l'API REST.

**Q : L'OCR fonctionne-t-il sur les manuscrits anciens ?**
R : Oui, l'API Vision de Claude est très performante sur les manuscrits. La qualité dépend de la lisibilité et de la résolution du scan.

**Q : Puis-je collaborer avec d'autres utilisateurs ?**
R : Oui ! Ajoutez des membres à vos projets avec différents rôles (lecteur, éditeur). Seuls les propriétaires et admins peuvent gérer les membres.

**Q : Comment fonctionne la génération d'histoires ?**
R : L'IA Claude analyse les entités, relations et transcriptions du projet pour créer un récit cohérent. Vous pouvez choisir le style et la longueur.

**Q : L'application fonctionne-t-elle hors-ligne ?**
R : Partiellement. En tant que PWA, les pages déjà visitées sont mises en cache et accessibles hors-ligne. Les nouvelles opérations nécessitent une connexion.

**Q : Comment changer la langue ?**
R : Utilisez le sélecteur FR/EN dans la navigation. Votre choix est sauvegardé automatiquement.

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

## Mises à Jour & Changelog

### Version 1.0 (Actuelle)

- [x] **Authentification** : NextAuth avec rôles admin/user
- [x] **Suppression de documents** : Nettoyage complet fichiers + miniatures
- [x] **OCR Vision API** : Transcription avec Claude API
- [x] **Extraction d'entités** : Détection automatique personnes, lieux, événements
- [x] **Graphe de connaissances** : Visualisation force-directed interactive
- [x] **Suite de tests** : 60+ tests automatisés Vitest
- [x] **Export HTML statique** : Génération de sites autonomes (ZIP)
- [x] **Recherche sémantique** : Full-text dans documents et entités
- [x] **PWA** : Installation mobile, cache hors-ligne
- [x] **Internationalisation** : Support FR/EN avec persistance
- [x] **Génération d'histoires** : Récits narratifs IA (3 styles)
- [x] **Multi-utilisateurs** : Permissions owner/editor/viewer par projet
- [x] **Dashboard Analytics** : Statistiques et métriques admin

### Fonctionnalités à venir

- [ ] Visualiseur de documents en plein écran
- [ ] Édition des transcriptions inline
- [ ] Annotations sur les images
- [ ] Points d'intérêt interactifs
- [ ] Frise chronologique interactive
- [ ] Carte géographique des lieux
- [ ] Export PDF des histoires générées
- [ ] API publique avec documentation Swagger
- [ ] Gestion des utilisateurs admin
- [ ] Notifications et activité en temps réel

---

*Merci d'utiliser Archivia pour préserver et valoriser votre patrimoine culturel !*

**Version** : 1.0.0
**Dernière mise à jour** : Novembre 2025
