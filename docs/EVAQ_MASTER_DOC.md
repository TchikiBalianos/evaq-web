# EVAQ — Documentation Complète & Architecture v3.0

**Application de Survie, Alerte & Intelligence Géopolitique**
Document Maître — Vision, Architecture technique (Monorepo), et Spécificités Fonctionnelles.

Dernière mise à jour : 2026-03-29
Statut : **En Production (Architecture Monorepo)**

> **Évolution V3 :** Le projet EVAQ est désormais organisé en **Mega-Monorepo**.
> - **`app/`** : L'Application Mobile Native Flutter (v1.2.1+ en prod)
> - **`web/`** : L'Application Web Responsive / PWA Next.js
>
> Les deux environnements partagent un seul et même Backend (Supabase) contenant les bases de données, l'authentification et les Edge Functions (algorithmes de scoring).

---

## 1. Vision & Positionnement

### Mission
EVAQ est la première application qui combine intelligence géopolitique temps réel, plan de fuite dynamique personnalisé, gestion de kit de survie (façon "RPG Kit") et réseau de voisinage sécurisé. 

### L'USP (Unique Selling Proposition)
À la différence de FR-Alert (qui n'envoie que de l'information brute), EVAQ est un **co-pilote de préparation** :
- Alertes multi-sources temps réel (GDACS, ReliefWeb, Médias).
- Recommandations d'évacuation interactives (OSRM/MapLibre).
- Gamification de la survie avec le nouveau système RPG Kit et des packs spécifiques.

---

## 2. Architecture Technique (Le Monorepo)

Le dépôt maintient deux applications clientes distinctes mais interopérables, alimentées par Supabase.

### 2.1 Backend Partagé : Supabase
* **PostgreSQL** : Profils utilisateurs, inventaires, données de la communauté.
* **Edge Functions (Deno)** : Cerveau du système. Gère l'ingestion GDACS/ReliefWeb, le système NLP (SCOUT/SENTINEL) et les calculs de scoring DEFCON.
* **Realtime** : Chat sécurisé communautaire par zone géographique (H3).

### 2.2 Frontend Mobile : `/app` (Flutter v1.2.1+)
* **Framework** : Flutter (iOS & Android).
* **Cartographie** : Carte interactive native (remplace les premières itérations statiques).
* **Hors-ligne** : Support du stockage local ultra robuste.
* **Monétisation** : Intégration blockchain avec **Premium Solana (Web3)**, permettant des achats in-app décentralisés.
* **Langues** : i18n finalisée avec 5 langues supportées.

### 2.3 Frontend PWA : `/web` (Next.js 15)
* **Framework** : React / Next.js 15 (App Router). Fonctionne en PWA installable.
* **UI/UX** : Tailwind CSS v4. Héberge notamment le dashboard de préparation.
* **Off-line partiel** : Service Worker & idb.
* **Hosting** : Déployé sur Vercel. Contient le dossier `_context/` et `_tests/` documentaires.

---

## 3. Les Outils & Algorithmes d'Intelligence (L'Alerte)

L'une des forces majeures d'EVAQ est son algorithme hybride de scoring à deux vitesses :

### 3.1 Mode SCOUT (Sources Structurées Officielles)
Prend les flux structurés de haute confiance, les agrège et les géolocalise avec précision.
- **GDACS** (ONU/UE) : Risques Naturels.
- **ReliefWeb** : Gestion crise humanitaire globale.
- **WHO / UCDP** : Risques Sanitaires et Conflits Armés.

*Le mode de test réactivable permet aujourd'hui d'injecter des fausses alertes pour vérifier toute la chaîne sans dépendre de vraies catastrophes mondiales.*

### 3.2 Mode SENTINEL (Médias & Signaux Faibles OSINT)
Scraping et analyse des flux RSS (Reuters, AFP, Le Monde) et réseaux sociaux de confiance.
Fournit un label "Signal Précoce". Un signal SENTINEL seul ne peut pas déclencher une évacuation (DEFCON 2 ou 1), il doit être répliqué par SCOUT.

### 3.3 Le Système DEFCON
Cinq niveaux de menace colorés :
- **5 - Vert (VEILLE)** : Rien à signaler.
- **4 - Jaune (ATTENTION)** : Risques mondiaux dans la macro-région.
- **3 - Orange (ALERTE)** : < 500km et niveau de fiabilité élevé.
- **2 - Rouge (DANGER)** : < 100km, confirmé officiellement. L'application calcule les itinéraires et rappelle le kit.
- **1 - Noir (URGENCE ABSOLUE)** : Fuite imminente.

---

## 4. Modules Clés & Nouvelles Features Implémentées

### 🎒 Le "RPG Kit" & Inventaire de Survie
La refonte v1.2.0 introduit une mécanique gamifiée où le kit de survie réagit comme un inventaire de RPG. L'application calcule ce qu'il vous manque selon :
1. La taille de votre foyer.
2. Le type de menace active.
Des **Packs post-rally** dédiés à des scénarios hyper spécifiques ont été ajoutés (ex: survie véhicule en inondation).

### 🗺️ Carte Interactive des Alertes
Mise à jour majeure de la v1.2.0. La carte (MapLibre/Flutter_map) est dynamique. Elle superpose les "zones de menace" (cercles DEFCON) aux couches de relief OpenStreetMap, tout en pointant l'itinéraire OSRM d'évacuation le plus sûr selon la direction des vents et du danger.

### 🌐 i18n & Accessibilité
L'application supporte désormais parfaitement **5 langues** (dont Français, Anglais), un chantier crucial pour la viabilité internationale du projet face à la concurrence purement américaine ou purement française.

### 🪙 Premium Solana (Web3)
L'intégration de Solana cible les passionnés de tech et les survivalistes voulant contourner les systèmes bancaires traditionnels (achats d'abonnements offline avec du $SOL).

---

## 5. Historique & Roadmap

### Changelog Récent
* **v1.2.1** : Ajout du mode test réactivable. Alertes de production connectées pour GDACS, ReliefWeb et SENTINEL.
* **v1.2.0** : Sortie de la carte interactive d'alerte, traduction i18n en 5 langues, intégration du module survie RPG Kit, intégration Solana Premium, et optimisation complète de l'UI PWA / App Android (Fix spécifiques Samsung S9+).
* **Restructuration Git** (Mars 2026) : Transformation du projet en Monorepo officiel (`app` + `web`).

### Prochaines Étapes
1. Déploiement du chat de Voisinage Crypté (E2E) pour les abonnés (Module "Cercle de Confiance").
2. Vérification des accès licence commerciaux avec ACLED.
3. Marketing d'Affiliation (Liens d'achats pour compléter l'inventaire RPG Kit via partenaires: Decathlon, etc.).
4. Passage du NLP SENTINEL vers un modèle complet HuggingFace NER pour réduire les "Faux Positifs".
