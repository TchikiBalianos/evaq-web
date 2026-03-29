# EVAQ — Brief Complet v3.0

**Application de Survie, Alerte & Intelligence Géopolitique**
Document de référence — Idéation & Architecture validée

Dernière mise à jour : 2026-03-23
Statut : Validation architecture — Pré-développement

> **Pivot v3 :** La v1 MVP est une **application web responsive / PWA** déployée sur Vercel (Next.js).
> La version mobile native Flutter est reportée en **v2**, après validation du product-market fit.
> Le backend Supabase est conçu une seule fois et réutilisé à 100% par les deux versions.

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Nom & Identité](#2-nom--identité)
3. [Analyse concurrentielle](#3-analyse-concurrentielle)
4. [Architecture technique](#4-architecture-technique)
5. [Sources de données & Intelligence](#5-sources-de-données--intelligence)
6. [Système NLP — Deux modes](#6-système-nlp--deux-modes)
7. [Algorithme de scoring & DEFCON](#7-algorithme-de-scoring--defcon)
8. [Modules & Features](#8-modules--features)
9. [Onboarding utilisateur](#9-onboarding-utilisateur)
10. [RGPD, Sécurité & Aspects juridiques](#10-rgpd-sécurité--aspects-juridiques)
11. [Structure base de données](#11-structure-base-de-données)
12. [Modèle économique](#12-modèle-économique)
13. [Coûts estimés](#13-coûts-estimés)
14. [Roadmap & Timeline](#14-roadmap--timeline)
15. [CI/CD & Tests](#15-cicd--tests)
16. [Risques & Mitigations](#16-risques--mitigations)
17. [Prochaines étapes immédiates](#17-prochaines-étapes-immédiates)

---

## 1. Vision & Positionnement

### Mission

EVAQ est la première application qui combine intelligence géopolitique temps réel, plan de fuite dynamique personnalisé, gestion de kit de survie et réseau de voisinage sécurisé dans une interface mobile accessible à tous.

### Problème adressé

En cas de crise (conflit armé, catastrophe naturelle, incident NRBC), les citoyens reçoivent aujourd'hui des alertes brutes (FR-Alert, sirènes) sans contexte, sans plan d'action, et sans réseau d'entraide structuré. L'État envoie un signal ; il ne t'aide pas à fuir.

Le guide gouvernemental "Tous Responsables" publié par le SGDSN en novembre 2025 confirme que la doctrine française évolue vers la responsabilisation du citoyen dans sa propre préparation. EVAQ se positionne dans cette brèche.

### USP (Unique Selling Proposition)

Aucune application existante ne combine :
- Alertes géopolitiques et catastrophes naturelles temps réel, avec score de fiabilité transparent
- Plan de fuite dynamique basé sur l'état réel des routes, le type de menace, et le profil du foyer
- Kit de survie personnalisé comparé à l'inventaire réel de l'utilisateur
- Réseau communautaire de voisinage anonyme et chiffré
- Analyse de signaux médias et réseaux sociaux pour la détection précoce

### Positionnement marché

EVAQ n'est pas une app anxiogène. C'est un **co-pilote de préparation** : utile au quotidien (gestion du kit, éducation, veille), critique en cas de crise. Le mode DEFCON 5 (aucune menace) doit être l'état dominant — l'app doit avoir de la valeur même quand il ne se passe rien.

---

## 2. Nom & Identité

### EVAQ — Nom définitif

Contraction de "Evacuate". 4 lettres, fort, direct, le "Q" final est distinctif et mémorisable. Fonctionne en anglais comme en français. Évoque immédiatement l'action sans être anxiogène.

> Les vérifications de disponibilité (domaines, réseaux sociaux, marque INPI) sont listées dans les prochaines étapes immédiates — section 17.

---

## 3. Analyse concurrentielle

### Concurrents directs

| App | Alertes | Plan de fuite | Kit survie | Communauté | Géopolitique |
|-----|---------|--------------|------------|------------|-------------|
| FR-Alert | Oui (Cell Broadcast) | Non | Non | Non | Non |
| FEMA App | Meteo US | Non | Basique | Non | Non |
| Offline Survival Manual | Non | Non | Statique | Non | Non |
| HazAdapt | Partiel | Non | Partiel | Non | Non |
| **EVAQ** | **Oui (multi-sources)** | **Oui (dynamique)** | **Oui (personnalisé)** | **Oui (chiffré)** | **Oui** |

### Relation avec FR-Alert

FR-Alert est un **allié**, pas un concurrent. Il opère par Cell Broadcast (signal réseau, sans app), sans possibilité de personnalisation ou d'action. EVAQ se positionne en couche complémentaire : FR-Alert signale, EVAQ guide. L'app peut même mentionner explicitement "si FR-Alert s'active dans votre zone, voici votre plan d'action".

---

## 4. Architecture technique

### 4.1 Vue d'ensemble

**v1 — Web/PWA (MVP)**
```
[Navigateur / PWA installée — Next.js sur Vercel]
    |
    |── Supabase Edge Functions (scoring, agrégation alertes, NLP)
    |── Supabase PostgreSQL (données utilisateur, alertes, inventaire)
    |── Supabase Realtime (chat communautaire)
    |── Web Push API + VAPID via Service Worker (notifications)
    |── OSRM self-hosted VPS (routing itinéraires)
    |── MapLibre GL JS (cartes OpenStreetMap)
    |── Workbox / Service Worker Cache (tuiles offline)
    |── Stripe Billing (abonnements web)
    |── APIs externes (GDACS, ACLED, UCDP, flux RSS, réseaux sociaux)
```

**v2 — Mobile natif (Flutter) — même backend**
```
[App iOS/Android — Flutter]
    |
    |── [même Supabase] ←→ mêmes Edge Functions, même BDD
    |── firebase_messaging (notifications)
    |── flutter_map + FMTC (cartes + offline complet)
    |── RevenueCat (in-app purchases iOS/Android)
```

### 4.2 Frontend v1 — Next.js 15 (App Router) + PWA

**Pourquoi Next.js + PWA pour la v1 :**
- Déploiement immédiat sur Vercel (zéro friction, pas de review App Store)
- Chaque push Git = déploiement en production en 30 secondes
- PWA installable sur iOS et Android depuis le navigateur (icône sur l'écran d'accueil)
- Pas de compte Apple Developer ($99/an) ni Google Play ($25) nécessaires pour le MVP
- Itérations ultra-rapides : corriger un bug = push direct, pas de cycle de build/soumission
- Next.js permet le SSR → SEO pour les pages de contenu (base de connaissances, landing)
- Stack familière pour un dev front senior
- Compatible 100% avec le backend Supabase — réutilisé sans modification en v2 Flutter

**Technologies clés :**

| Techno | Usage |
|--------|-------|
| Next.js 15 App Router | Framework React, SSR + client components |
| TypeScript | Typage strict |
| Tailwind CSS v4 | Styling |
| MapLibre GL JS + react-map-gl | Carte OpenStreetMap (remplace flutter_map) |
| h3-js | Index H3 côté client |
| @supabase/supabase-js | SDK Supabase officiel |
| next-pwa / Workbox | PWA + Service Worker + cache offline |
| Web Push API + VAPID | Notifications push navigateur |
| @stripe/stripe-js + stripe | Abonnements web (remplace RevenueCat) |
| idb | IndexedDB (remplace Hive) |
| Vercel | Déploiement, hosting, Edge Network |

**Limitations PWA vs natif (à documenter clairement dans l'onboarding) :**

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| iOS Push : uniquement si PWA installée (iOS 16.4+) | Une partie des utilisateurs iPhone ne reçoit pas les notifs | Onboarding guide explicitement l'installation "Ajouter à l'écran d'accueil" |
| Cache offline : tuiles déjà visitées uniquement (pas de téléchargement proactif complet) | Mode offline moins puissant qu'avec FMTC Flutter | Le Service Worker pré-charge les tuiles autour de la position au moment de la connexion |
| Performance : légèrement inférieure au natif sur animations complexes | Acceptable pour EVAQ (pas d'animations intensives) | Optimisation avec React.memo et dynamic imports |
| Accès aux APIs device : GPS, caméra disponibles via browser APIs | Fonctionne bien en pratique | Geolocation API, MediaDevices API standard |

### 4.3 Backend — Supabase (BaaS)

**Composants utilisés :**
- **PostgreSQL** : base de données principale (alertes, profils, inventaires, communauté)
- **Auth** : authentification email/magic link/OAuth
- **Realtime** : canaux de chat communautaire
- **Edge Functions** (Deno/TypeScript) : logique serveur (scoring alertes, agrégation sources, cron jobs)
- **Row Level Security (RLS)** : isolation des données par utilisateur, sans code supplémentaire
- **Storage** : fichiers (images kit de survie, exports utilisateur)

**Limites tier gratuit :**
- 500 MB de base de données
- 50 000 utilisateurs actifs mensuels
- 1 GB de stockage fichiers
- 5 GB d'egress
- **Mise en pause après 7 jours d'inactivité** → cron job de ping obligatoire dès le setup

**Passage au tier Pro ($25/mois)** : uniquement si >50k MAU ou besoin d'uptime garanti.

### 4.4 Cartographie — MapLibre GL JS

- **MapLibre GL JS** (open source, fork de Mapbox GL JS) via `react-map-gl` pour l'intégration React
- Rendu vectoriel performant : affichage des zones de menace, itinéraires, points d'intérêt en layers superposés
- Tuiles OSM gratuites pour un usage raisonnable (pas de SLA — envisager Maptiler ~10€/mois si volume important)
- **Offline v1 (PWA)** : Workbox + Service Worker pré-cache les tuiles de la zone de l'utilisateur à la connexion (rayon ~50km, zoom max 14). Les tuiles visitées sont également mises en cache automatiquement.
- **Offline v2 (Flutter)** : FMTC avec téléchargement proactif complet d'une région (rayon 150km, 500MB max) — feature premium plus puissante
- Alternative plus simple si MapLibre bloque : Leaflet.js via react-leaflet (moins performant mais plus léger)

### 4.5 Routing — OSRM auto-hébergé (OBLIGATOIRE dès le MVP)

**Décision architecturale importante :** le serveur de démo OSRM public (router.project-osrm.org) a des limites de taux non documentées et une disponibilité non garantie. Il tombera dès qu'il y a plusieurs utilisateurs simultanés.

**Solution : VPS auto-hébergé dès le MVP.**
- Image Docker OSRM officielle disponible
- Coût : ~5€/mois (Hetzner CX11 ou OVH VPS Starter)
- Données OSM France : ~1.5 GB pour le fichier source, ~3-4 GB après processing OSRM
- Setup initial : ~2-3h, puis maintenance quasi-nulle (mise à jour OSM mensuelle optionnelle)

**Alternative à évaluer :** Valhalla (routing engine alternatif, plus simple à installer, API compatible, également open source).

### 4.6 Stockage local offline — IndexedDB + Service Worker Cache

**v1 (Web/PWA) :**
- **IndexedDB** via la librairie `idb` (wrapper promisifié) : données structurées (kit de survie, plans de fuite, profil foyer)
- **Service Worker Cache API** (Workbox) : tuiles de carte, assets statiques Next.js, pages HTML pour navigation offline
- **localStorage** : préférences légères (niveau DEFCON minimum de notification, mode sage on/off)
- **Limitation** : les navigateurs peuvent vider le cache sous pression mémoire. L'utilisateur doit être informé que le mode offline peut nécessiter une reconnexion périodique pour rafraîchir les données.

**v2 (Flutter) :**
- **Hive** (NoSQL local, zero-config) : données structurées persistantes, pas de risque de vidage automatique
- **FMTC** : cache de tuiles cartographiques avec contrôle total de la taille et de la durée de vie

### 4.7 Notifications push — Web Push API + VAPID

**v1 (Web/PWA) :**
- Standard W3C Web Push, fonctionne sur Chrome, Firefox, Edge, et Safari iOS 16.4+
- Le Service Worker reçoit les notifications même quand l'app n'est pas ouverte
- **VAPID** (Voluntary Application Server Identification) pour l'authentification des pushs
- Firebase JS SDK peut être utilisé comme transport (cohérence avec la v2 Flutter et même configuration FCM)
- **Cas iOS spécifique** : push uniquement si l'app est installée en PWA (ajoutée à l'écran d'accueil). L'onboarding doit guider cette étape explicitement sur iPhone.
- Fallback pour iOS < 16.4 : notification in-app (badge + son au prochain chargement de la page)

**v2 (Flutter) :**
- Firebase Cloud Messaging via `firebase_messaging` — même backend FCM, pas de duplication d'infrastructure

### 4.8 Abonnements — Stripe Billing

**v1 (Web/PWA) :**
- **Stripe Checkout** : flow de paiement hébergé par Stripe (zéro PCI DSS à gérer côté EVAQ)
- **Stripe Billing** : abonnements récurrents, renouvellements, annulations, webhooks
- **Stripe Customer Portal** : gestion en self-service de l'abonnement par l'utilisateur
- Coût : 1.5% + 0.25€ par transaction (cartes européennes), sans coût fixe
- Intégration Next.js : `@stripe/stripe-js` côté client + `stripe` SDK côté serveur (Server Actions ou API Routes)
- Webhook Stripe → Edge Function Supabase → mise à jour `subscription_tier` en base

**v2 (Flutter) :**
- **RevenueCat** réintroduit pour les in-app purchases iOS/Android natifs (obligatoire pour les stores)
- Les abonnements Stripe (web) et RevenueCat (mobile) convergent vers la même colonne `subscription_tier` via leurs webhooks respectifs
- Un utilisateur peut s'abonner sur web et accéder à ses avantages sur l'app mobile, et vice versa

### 4.9 Chemin de migration v1 (Web/PWA) → v2 (Flutter)

Le backend Supabase est conçu une seule fois et réutilisé intégralement par la v2 Flutter.

```
v1 (Next.js/PWA)              Backend commun              v2 (Flutter)
        |                           |                           |
MapLibre GL JS ────────── Supabase PostgreSQL ──────── flutter_map + FMTC
Web Push / VAPID ───────── Edge Functions NLP ─────── Firebase Cloud Messaging
IndexedDB + idb ─────────── RLS + Auth ────────────── Hive
Stripe ──────────────────── subscription_tier ──────── RevenueCat
Vercel (deploy) ────────────── BDD, APIs ────────────── App Store / Google Play
```

**Principes de compatibilité :**
- Les schémas BDD PostgreSQL ne changent pas entre v1 et v2
- Les Edge Functions (scoring SCOUT, pipeline SENTINEL) sont identiques — 0 réécriture
- Un utilisateur créé en v1 (web) se connecte directement sur l'app Flutter v2 avec le même compte
- Les données (profil, inventaire, plans de fuite) sont disponibles sur les deux versions simultanément
- La logique métier (DEFCON, algorithme de scoring) est implémentée côté backend — les deux frontends en profitent sans duplication

**Avantages stratégiques de cette approche :**
1. **Validation rapide** : la PWA est déployée en semaines (pas de review App Store)
2. **Feedback réel** avant d'investir dans le développement natif
3. **Correctifs d'urgence** : un bug critique = push sur Vercel, pas de nouvelle soumission aux stores
4. **SEO** : les pages de contenu (base de connaissances, landing) sont indexées par Google
5. **Desktop** : la version web responsive fonctionne sur ordinateur — audience plus large
6. **Coût réduit** : pas de compte Apple ($99/an) ni Google Play ($25) pour le MVP

---

## 5. Sources de données & Intelligence

### 5.1 Sources structurées (données géolocalisées, haute fiabilité)

#### GDACS — Global Disaster Alert and Coordination System
- **Type** : Catastrophes naturelles (séismes, tsunamis, cyclones, inondations, sécheresses, feux de forêt)
- **Gestionnaire** : UE + ONU — fiabilité institutionnelle maximale
- **Format** : API REST GeoJSON, RSS
- **Latence** : quasi-temps réel (minutes après événement)
- **Coût** : Gratuit (citer la source)
- **Score de fiabilité** : 95/100
- **Intégration** : Source principale Phase 1 MVP

#### ACLED — Armed Conflict Location & Event Data
- **Type** : Conflits armés, violences politiques, manifestations, crises civiles
- **Format** : API REST JSON, mises à jour hebdomadaires (near-real-time pour zones actives)
- **Coût** : Gratuit pour usage académique/ONG. **Licence commerciale à vérifier avant intégration.**
- **Action obligatoire** : Contacter ACLED (acleddata.com/contact) avant de coder l'intégration. Expliquer le projet. La plupart des projets non-lucratifs au démarrage obtiennent un accès étendu.
- **Backup si accès refusé** : UCDP (Uppsala Conflict Data Program) — académique, API ouverte, qualité comparable
- **Score de fiabilité** : 92/100
- **Intégration** : Phase 1b (après GDACS validé)

#### UCDP — Uppsala Conflict Data Program
- **Type** : Conflits armés, données historiques + récentes
- **Gestionnaire** : Université d'Uppsala (Suède)
- **Format** : API REST, GeoJSON
- **Coût** : Gratuit, open access
- **Score de fiabilité** : 90/100
- **Intégration** : Backup ACLED ou source complémentaire

#### VIEWS — Violence & Impacts Early-Warning System
- **Type** : Prédiction de conflits armés à 1-36 mois via machine learning
- **Gestionnaire** : Université d'Uppsala
- **Format** : API REST
- **Coût** : Gratuit (open source)
- **Rôle dans EVAQ** : **Couche contextuelle uniquement** — VIEWS n'est PAS une source d'alerte immédiate. C'est un indicateur de risque à long terme affiché dans un onglet "Contexte géopolitique" séparé du flux d'alertes. Ne pas intégrer dans l'algorithme de scoring des alertes urgentes (registre temporel différent).
- **Score de contexte** : 88/100 (pour les prévisions)
- **Intégration** : v1.1 post-lancement

#### WHO Disease Outbreak News
- **Type** : Alertes sanitaires mondiales (épidémies, pandémies)
- **Format** : RSS / API
- **Coût** : Gratuit
- **Score de fiabilité** : 93/100
- **Intégration** : Phase 1 MVP

#### API Point d'Accès National — données trafic France
- **Type** : État du réseau routier, trafic
- **Gestionnaire** : Ministère des Transports (api.gouv.fr)
- **Format** : API REST, données Cerema
- **Coût** : Gratuit
- **Intégration** : Module Plan de fuite (Phase 2)

### 5.2 Sources médias & signaux faibles (flux RSS)

**Remplacement de NewsAPI** (trop limité à 100 req/jour en gratuit) par du **scraping RSS direct** sur les agences et médias majeurs. Les flux RSS publics sont gratuits, stables, et sans limite de requêtes documentée.

Sources RSS à intégrer :

| Source | URL RSS | Langue | Fiabilité | Score |
|--------|---------|--------|-----------|-------|
| Reuters | reuters.com/rssFeed/worldNews | EN | Agence internationale | 88/100 |
| AFP (via France24) | france24.com/fr/rss | FR/EN | Agence française | 87/100 |
| BBC World | feeds.bbci.co.uk/news/world/rss.xml | EN | Media international | 85/100 |
| France24 | france24.com/fr/monde/rss | FR | Media international FR | 85/100 |
| Le Monde | lemonde.fr/rss/une.xml | FR | Quotidien national | 83/100 |
| RFI | rfi.fr/fr/rss | FR | Radio internationale | 82/100 |
| BFMTV | bfmtv.com/rss | FR | Actu France temps réel | 78/100 |
| Al Jazeera | aljazeera.com/xml/rss/all.xml | EN | Perspective non-occidentale | 80/100 |

**Note légale** : Le scraping RSS est légal pour un usage personnel/applicatif (les flux RSS sont publics par définition). Éviter le scraping HTML direct sur Reuters et AFP qui ont des CGU plus strictes.

### 5.3 Sources réseaux sociaux

La surveillance des réseaux sociaux pour la détection de signaux faibles est une feature à valeur réelle mais techniquement contrainte. Voici l'état des accès en 2026 :

#### Twitter/X — CONTRAINTE MAJEURE
- L'API gratuite est limitée à 500 tweets lus/mois depuis 2023 — **inutilisable**.
- L'API Basic coûte $100/mois pour 10 000 lectures. Envisageable si l'app génère des revenus.
- **MVP** : exclure Twitter/X de la v1. L'intégrer en v1.1 si budget disponible.
- **Alternative** : surveiller les comptes Twitter de journalistes OSINT reconnus via leurs flux RSS (beaucoup publient aussi sur Substack ou blogs avec RSS).

#### Telegram — OPPORTUNITÉ
- L'API MTProto de Telegram est gratuite et puissante.
- De nombreux canaux OSINT reconnus publient des informations vérifiées en temps réel (IntelliTimes, War Monitor, Ukraine Conflict Monitor, etc.).
- **Risque** : les canaux Telegram peuvent aussi diffuser de la désinformation. Un whitelist strict de canaux vérifiés est indispensable.
- Intégration côté serveur (Edge Functions Deno) — pas besoin de librairie client.
- **Intégration** : Phase 1c MVP

#### Mastodon / Fediverse — FUTUR
- API ouverte, gratuite, sans restrictions
- Instances spécialisées en actualité (journalistes.social, etc.)
- Volume trop faible pour apporter une vraie valeur en v1.1 — signal/bruit intéressant mais masse critique insuffisante
- **Intégration** : v2

#### Reddit — POSSIBLE
- API Reddit accessible avec un compte app gratuit (tier Free : 100 QPM)
- Subreddits pertinents : r/worldnews, r/geopolitics, r/preppers, r/SHTF, r/EmergencyManagement
- **Intégration** : v1.1 (valeur plus communautaire qu'informationnelle pour le scoring)

#### Bluesky — FUTUR
- Protocol AT ouvert, API gratuite
- Masse critique d'utilisateurs journalistes en croissance
- **Intégration** : v2

---

## 6. Système NLP — Deux modes

C'est la feature différenciante la plus complexe techniquement. Elle s'organise en deux modes distincts avec des niveaux de confiance et des rôles différents dans l'algorithme de scoring.

### Mode SCOUT — NLP Strict (sources structurées uniquement)

**Principe** : Recoupement d'événements sur les sources déjà géolocalisées et structurées (GDACS, ACLED, UCDP, WHO). Ces sources fournissent des coordonnées GPS natives, des catégories d'événements et des scores de sévérité. Le NLP est minimal — on travaille sur des métadonnées structurées.

**Pipeline SCOUT :**
```
1. Ingestion des événements GDACS / ACLED / UCDP / WHO
2. Normalisation : même format interne {type, lat, lon, radius, severity, timestamp, source}
3. Clustering spatial : regrouper les événements dans un rayon de 50km ET une fenêtre de 6h
4. Score de recoupement : +15 pts par source supplémentaire qui confirme le même cluster
5. Score final = score_source_max * 0.5 + bonus_recoupement * 0.5
6. Génération de l'alerte si score_final > seuil défini par niveau DEFCON
```

**Caractéristiques :**
- Haute précision, faible taux de faux positifs
- Latence courte (données structurées = traitement rapide)
- Implémentable en Edge Functions Supabase (TypeScript)
- **C'est la couche primaire du MVP**

### Mode SENTINEL — NLP Étendu (médias + réseaux sociaux)

**Principe** : Analyse des flux RSS médias et des réseaux sociaux disponibles (Telegram, Mastodon, Reddit) pour détecter des signaux faibles avant que les sources structurées (GDACS/ACLED) ne les enregistrent. C'est de l'early warning avec un score de confiance naturellement plus bas.

**Pipeline SENTINEL :**

**Étape 1 — Ingestion multi-sources**
```
Sources : RSS (Reuters, France24, BBC...) + Telegram OSINT + Mastodon + Reddit
Fréquence : toutes les 5 minutes
Format : texte brut + timestamp + source_id
```

**Étape 2 — Extraction d'entités géographiques**
```
Méthode MVP (sans NLP lourd) :
- Dictionnaire de ~15 000 noms de lieux (villes, pays, régions) en FR et EN
  → Source : GeoNames (gratuit, téléchargeable)
- Regex + lookup dans le dictionnaire pour extraire les entités géographiques
- Résolution des ambiguïtés par contexte (ex: "Nice" = ville française en priorité)
- Attribution de coordonnées GPS via GeoNames
→ Résultat : article taggé avec coordonnées GPS (ou ignoré si pas de lieu détecté)
```

**Étape 3 — Classification de la menace**
```
Méthode : dictionnaire de mots-clés par catégorie de menace, multilingue (FR + EN)

Catégories :
- MILITAIRE : "frappe", "bombardement", "missile", "offensive", "troupes", "bombing", "strike", "invasion"...
- NUCLEAIRE : "nucléaire", "radiation", "centrale", "AIEA", "nuclear", "radiation", "reactor"...
- CHIMIQUE : "chimique", "sarin", "agent", "chemical", "toxic"...
- SANITAIRE : "épidémie", "outbreak", "virus", "contamination", "cas confirmés"...
- NATUREL : "séisme", "tremblement", "tsunami", "cyclone", "inondation", "earthquake"...
- CIVIL : "émeutes", "coup d'état", "manifestation violente", "coup", "riots"...

Score de pertinence = nombre de mots-clés matchés pondérés par catégorie
```

**Étape 4 — Scoring de confiance SENTINEL**
```
score_sentinel = score_source_media * 0.35 + score_recoupement_medias * 0.45 + bonus_vitesse * 0.20

score_recoupement_medias :
- 0 source confirmant : 0
- 1 source supplémentaire dans les 30min : +30
- 2 sources supplémentaires : +55
- 3+ sources : +75 (plafond)

bonus_vitesse :
- Signal détecté >2h avant sources structurées : +20 (early warning confirmé)
- Signal confirmé en même temps que structuré : +5

IMPORTANT : le score SENTINEL est naturellement plafonné à 70/100.
Il ne peut pas à lui seul déclencher un niveau DEFCON 2 ou 1.
Il contribue au score agrégé et peut déclencher DEFCON 4 ou 3 max.
```

**Étape 5 — Fusion SCOUT + SENTINEL**
```
Si un événement SENTINEL est confirmé par SCOUT :
  → Score fusionné = max(score_scout, score_sentinel + 15)
  → Alerte émise depuis SCOUT (source plus crédible citée)

Si un événement SENTINEL n'est pas (encore) confirmé par SCOUT :
  → Niveau DEFCON max = 3 (ALERTE), jamais 2 ou 1
  → Labellisé "Signal précoce — en cours de vérification"
  → Durée de vie de l'alerte précoce : 2h. Si non confirmée par SCOUT, expiration automatique.
```

**Stack NLP — Évolution**

| Phase | Technique | Coût |
|-------|-----------|------|
| MVP | Dictionnaire + regex GeoNames | 0€ |
| v1.1 | NER (Named Entity Recognition) via modèle léger HuggingFace Inference API | ~0-10€/mois |
| v2 | Fine-tuning d'un modèle spécialisé crises géopolitiques | Budget dédié |

**Note sur l'hébergement NLP :**
Les Edge Functions Supabase (Deno) sont suffisantes pour le MVP (dictionnaire + regex). Si le volume augmente ou si on passe à un vrai modèle NER, envisager un microservice Python séparé (FastAPI sur VPS ~5€/mois) pour l'inférence.

---

## 7. Algorithme de scoring & DEFCON

### 7.1 Scores de fiabilité par source

| Source | Score de base | Justification |
|--------|--------------|---------------|
| GDACS | 95 | UE/ONU, protocole de validation institutionnel |
| WHO | 93 | OMS, validation multi-pays |
| ACLED | 92 | Méthodologie académique documentée, peer-reviewed |
| UCDP | 90 | Université d'Uppsala, méthodologie publique |
| Reuters (RSS) | 88 | Agence de presse, charte éditoriale stricte |
| AFP/France24 (RSS) | 87 | Agence nationale, même niveau de rigueur |
| BBC World (RSS) | 85 | Media public international |
| Le Monde (RSS) | 83 | Quotidien national de référence |
| Al Jazeera (RSS) | 80 | Perspective internationale, mais biais politique à pondérer |
| BFMTV (RSS) | 78 | Actu temps réel FR, tendance au sensationnalisme |
| Telegram OSINT (whitelist) | 70 | Variable selon canal, évaluation manuelle requise |
| Reddit | 60 | Signal communautaire, signal/bruit variable |
| Mastodon | 65 | Meilleur que Reddit, moins que médias établis |

### 7.2 Algorithme de scoring complet

```
POUR chaque événement reçu :

1. Calcul du score brut source :
   score_brut = score_source[source_id]

2. Recoupement dans la fenêtre :
   - Recherche d'événements similaires (même zone géo ± 50km, même catégorie, ±2h)
   - recoupement = f(nombre de sources indépendantes confirmantes)
     0 sources  → 0
     1 source   → 30
     2 sources  → 55
     3+ sources → 75

3. Score intermédiaire :
   score_interim = score_brut * 0.4 + recoupement * 0.6

4. Modificateurs contextuels :
   + 10 si source officielle gouvernementale confirme (FR-Alert, COGIC, préfecture)
   + 5  si événement classé "Red" par GDACS directement
   - 15 si la même source a émis une fausse alerte dans les 24h précédentes (rate limiting de fiabilité)
   - 10 si l'événement contredit d'autres sources fiables (score contradictoire)

5. Score final (plafonné à 100) :
   score_final = min(score_interim + modificateurs, 100)

6. Cas particulier source unique ultra-fiable :
   SI source == GDACS ET severity_gdacs == "Red" ET score_final < 60
   ALORS score_final = 70 (garde-fou pour ne pas ignorer un alerte rouge ONU)
```

### 7.3 Système DEFCON

| Niveau | Couleur | Label | Condition de déclenchement | Actions automatiques |
|--------|---------|-------|---------------------------|---------------------|
| 5 | Vert | VEILLE | Aucune menace détectée dans le rayon étendu | Dashboard informatif, veille géopolitique |
| 4 | Jaune | ATTENTION | score_final > 60, distance > 500km OU menace même continent | Notification informative, fil d'actualité filtré |
| 3 | Orange | ALERTE | score_final > 70, distance < 500km | Notification prioritaire, pré-calcul plan de fuite |
| 2 | Rouge | DANGER | score_final > 80, confirmé 3+ sources, distance < 100km | Notification critique avec son, activation plan de fuite, rappel kit |
| 1 | Noir | URGENCE | score_final > 90, 2+ sources haute-fiabilité, impact estimé < 6h | Notification alarme, plan de fuite final, mode communautaire urgence |

**Règles de déclenchement :**

- Délai de confirmation pour niveaux 2 et 1 : **15 minutes minimum** après le premier signal (sauf GDACS Red qui est considéré pré-validé)
- Niveau 1 : ne se déclenche que si **au minimum 2 sources parmi** {GDACS, ACLED, WHO, Reuters/AFP} confirment
- Niveau 1 via SENTINEL seul : **IMPOSSIBLE** — la couche SCOUT doit confirmer
- Rétrogradation automatique : si le score chute sous le seuil pendant 30 minutes consécutives, rétrogradation d'un niveau avec notification "situation en amélioration"
- Anti-spam : pas plus d'une notification de même niveau toutes les 30 minutes pour le même événement

**Prise en compte du type de menace dans le rayon :**

| Type de menace | Rayon d'impact considéré |
|---------------|-------------------------|
| Nucléaire (explosion) | 500 km (contamination radiation) |
| Chimique | 50 km (dispersion atmosphérique) |
| Conventionnel (bombardement) | 30 km |
| Naturel (séisme) | Selon magnitude GDACS |
| Sanitaire | Rayon national minimum |
| Civil (émeutes) | 5 km |

---

## 8. Modules & Features

### Module 1 — Alertes & DEFCON (MVP — Gratuit)

**Dashboard principal :**
- Affichage visuel du niveau DEFCON actuel (couleur dominante de l'écran)
- Nombre d'alertes actives dans le rayon configuré
- Dernière mise à jour du flux (timestamp visible — rassurant pour l'utilisateur)

**Fil d'alertes :**
- Liste chronologique des alertes, filtrée par pertinence géographique
- Chaque alerte affiche : type de menace, zone géographique, score de fiabilité (barre visuelle), sources citées, timestamp
- Badge "Signal précoce — en cours de vérification" pour les alertes SENTINEL non encore confirmées par SCOUT
- Lien vers les sources originales (transparence)

**Mode Sage (activé par défaut) :**
- Filtre les alertes dont le score de fiabilité est inférieur à 80%
- L'utilisateur peut désactiver le mode sage pour voir toutes les alertes y compris les signaux faibles
- Message d'avertissement si désactivé : "Vous verrez des signaux non vérifiés — des fausses alertes sont possibles"

**Détail d'une alerte :**
- Carte miniature de la zone impactée
- Sources ayant rapporté l'événement avec leurs scores individuels
- Timeline de l'événement (première détection, confirmations successives)
- Lien "Voir votre plan de fuite pour cet événement"

**Onglet Contexte géopolitique (VIEWS — v1.1) :**
- Indicateurs de risque à 1-6 mois par zone géographique
- Clairement distingué des alertes immédiates (onglet séparé, titre "Risques à long terme")

### Module 2 — Plan de fuite (MVP — Calcul gratuit, sauvegarde offline premium)

**Carte interactive :**
- Carte OpenStreetMap affichée dans le navigateur, responsive mobile
- Position de l'utilisateur (GPS du téléphone via le navigateur)
- Zones de menace actives affichées en overlay coloré (selon niveau DEFCON)
- Points de destination suggérés selon le type de menace

**Calcul d'itinéraires :**
- 3 itinéraires alternatifs calculés avec temps estimé et état du trafic
- Logique adaptée au type de menace :
  - **Bombardement** : abris souterrains proches (métro, parkings) puis zones hors rayon d'impact
  - **Nucléaire** : fuite >100km dans le sens contraire du vent (données Météo-France)
  - **Chimique** : fuite perpendiculaire à la direction du vent, 30-50km
  - **Sanitaire** : zones rurales à faible densité, >50km des centres urbains
  - **Inondation** : points hauts, hors zones inondables (données gouvernementales)

**Overlay trafic :**
- État des routes en temps réel (données gratuites du gouvernement français)
- En urgence niveau 2-1 : bascule automatique vers l'itinéraire le moins encombré

**Adaptation au profil foyer :**
- Sans véhicule → itinéraires piétons et transports en commun
- PMR → évitement des terrains difficiles, destinations accessibles
- Animaux → filtrage vers destinations qui les acceptent

**Mode offline (premium) :**
- Pré-chargement des cartes autour du domicile (~50km en v1 PWA, ~150km en v2 Flutter)
- Sauvegarde des 3 derniers plans de fuite calculés pour consultation sans connexion
- Sync automatique : weekly (abonnement mensuel) / daily (abonnement annuel)

### Module 3 — Kit de survie & Inventaire (MVP — Base gratuite, scan premium)

**Base de connaissances (curée par Yévana) :**

Sources officielles :
- Guide "Tous Responsables" du SGDSN (novembre 2025)
- Kit d'urgence 72h — Ministère de la Transition écologique
- CataKit — Croix-Rouge française
- Recommandations ICRP pour les incidents nucléaires
- Guides HCFDC (Haut Comité Français pour la Défense Civile)

Organisation par type de menace :
```
Kit recommandé par catégorie :
- Eau (volume par personne par jour, durée de stockage, purification)
- Nourriture (calories/jour, aliments longue conservation, lyophilisé)
- Médical (trousse de premiers secours, médicaments courants, ordonnances)
- Outils (lampe, radio manivelle, couverture de survie, multi-outil)
- Documents (copies CNI, passeports, contrats assurance, carnet de santé)
- Communication (téléphone chargé, batterie externe, liste de contacts papier)
- Spécifique nucléaire (iodure de potassium — prescription médicale requise, dosimètre)
- Spécifique chimique (masque FFP3, combinaison étanche basique)
```

**Inventaire utilisateur :**
- Saisie manuelle par catégories prédéfinies
- Quantité, date de péremption (optionnel)
- Le kit recommandé s'adapte automatiquement au profil (nombre de personnes × jours de stock recommandé × type de menace locale)

**Écran "Ce qu'il vous manque" :**
- Comparaison inventaire réel vs kit recommandé
- Items manquants affichés par ordre de priorité
- Score de préparation global (0-100%) affiché en DEFCON 5 pour motiver la préparation

**Rappels de péremption (premium) :**
- Notification configurable (J-30, J-7, J-1) avant expiration d'un item
- Vue calendrier des prochaines expirations

**Scan photo (premium — v1.1) :**
- Reconnaissance d'objets via API de vision (Google Vision ou HuggingFace)
- Suggestion de catégorie et ajout semi-automatique à l'inventaire
- Beta tag explicite — précision imparfaite assumée

**Liens d'achat affiliés (dans ce module uniquement) :**
- Quand un item manque, proposition d'un lien d'achat partenaire
- **Uniquement en mode préparation (DEFCON 5)** — jamais pendant une alerte active
- Label "Partenaire recommandé" visible

### Module 4 — Communauté & Voisinage (v1.1 — post-lancement)

**Découverte de voisins :**
- Index H3 résolution 7 (~5km²) — seul identifiant géographique stocké en base
- L'utilisateur voit combien d'autres utilisateurs EVAQ sont dans sa zone (nombre, pas identités)
- Rayon configurable : 500m / 1km / 5km

**Signaux rapides (gratuit, anonyme) :**
```
- "J'ai besoin d'aide"
- "J'ai du stock à partager"
- "Je pars — qui vient avec moi ?"
- "Danger dans ma rue"
- "Voie bloquée [adresse approximative]"
- "Abri disponible"
```

**Chat anonyme de zone (gratuit) :**
- Canal de discussion par zone H3
- Messages anonymisés (pseudonyme auto-généré par session)
- Chiffrés en transit (HTTPS), pas de chiffrement E2E pour le MVP
- Chiffrement E2E en v2 (côté client, clé dérivée du compte)

**Cercle de confiance (premium) :**
- Invitation bilatérale (les deux utilisateurs doivent accepter)
- Partage granulaire configurable par chaque membre :
  - Stock disponible (oui/non/quantité)
  - Plan de fuite (partager ou non)
  - Véhicule disponible (oui/non/capacité)
  - Compétences (premiers secours, orientation, mécanique)
  - Position approximative (H3 résolution 8 ~0.7km²) ou précise temporairement
- Partage de position précise : temporaire (X heures configurables), chiffré, jamais persisté en base

**Organisation de convois (premium avancé — v2) :**
- Créer un groupe de fuite coordonné
- Point de RDV, heure de départ, capacité du convoi
- Suivi de progression partagé

### Module 5 — Monétisation complémentaire

**Affiliation survivalisme :**
- Partenariats : Décathlon (rayon randonnée/survie), Lyophilise.fr, Amazon Affiliation
- Intégration uniquement dans le Module Kit de survie, mode préparation
- Commission standard : 3-8% selon partenaire

**Contenu éducatif premium (v1.1) :**
- Guides PDF de survie avancés (partenariat formateurs certifiés PSC1, CFAPSE)
- Vidéos courtes : orientation sans GPS, purification d'eau, premiers secours
- Revenue share avec les formateurs : 60/40

**Publicité tier gratuit (hors écrans d'urgence) :**
- Bannières discrètes dans les écrans informatifs uniquement (DEFCON 5, inventaire, éducation)
- **Zéro publicité sur les écrans d'alerte, plan de fuite, et communauté d'urgence**
- Régie : Google AdMob (gratuit à l'intégration)

---

## 9. Onboarding utilisateur

### Phase 1 — Obligatoire (sans ces données, l'app ne fonctionne pas)

1. **Localisation principale** : adresse ou code postal → converti en H3 côté client, jamais envoyé en clair
2. **Nombre de personnes dans le foyer** : adultes + enfants (compte pour le dimensionnement du kit)
3. **Acceptation CGU** : case à cocher avec formulation explicite (voir section juridique)

### Phase 2 — Optionnelle mais recommandée

L'app explique pourquoi chaque information améliore la survie avant de la demander.

| Information | Explication affichée | Impact dans l'app |
|-------------|---------------------|-------------------|
| Présence d'enfants (âges) | "Pour adapter le kit et calculer le temps de fuite" | Kit pédiatrique, vitesse de marche réduite |
| Présence d'animaux | "Pour trouver des destinations qui les acceptent" | Filtrage des abris |
| PMR ou besoins médicaux | "Pour adapter les itinéraires et les besoins médicaux" | Routes accessibles, kit médical étendu |
| Véhicule (type) | "Pour calculer l'itinéraire et la capacité de fuite" | Vitesse, rayon d'action, carburant estimé |
| Étage | "Rez-de-chaussée vs 15ème étage change le plan d'évacuation" | Priorisation escaliers vs ascenseur |
| Compétences | "Pour le matching communautaire en cas d'urgence" | Visible dans le cercle de confiance |
| Zone de travail / fréquente | "Pour calculer un plan de fuite depuis votre lieu habituel" | Second point de départ configuré |

### Flux d'onboarding recommandé (5 écrans)

```
Écran 1 : Splash + Valeur proposition (5 secondes)
Écran 2 : Création compte (email + mot de passe)
Écran 3 : Mon foyer — localisation (code postal) + nombre de personnes sur le même écran
Écran 4 : CGU + décharge (obligatoire, pas skippable)
Écran 5 : Profil optionnel (swipeable, chaque slide = une info avec bouton "passer")
           → enfants, animaux, PMR, véhicule, étage, compétences, lieu de travail
→ Arrivée sur le Dashboard DEFCON
→ Notification push d'activation après 24h si le kit n'a pas encore été rempli
```

> Fusion des anciens écrans 3 et 4 : localisation + foyer sur le même écran réduit la friction sans perte d'information. L'utilisateur a moins l'impression de remplir un formulaire.

---

## 10. RGPD, Sécurité & Aspects juridiques

### 10.1 Géolocalisation — Privacy by Design

**Principe :** les coordonnées GPS exactes ne quittent jamais le device.

```
[Device]
  Position GPS brute → Conversion en index H3 résolution 7 (côté client)
  Index H3 envoyé → Supabase (seule donnée géo stockée en base)

  Pour les calculs d'alerte et de fuite :
  → Le device reçoit les données de menace géolocalisées du serveur
  → Calcul de distance côté client (le serveur ne connaît pas la position exacte)
  → Résultat (niveau DEFCON) calculé localement, jamais envoyé au serveur
```

H3 résolution 7 = hexagones de ~5km². En milieu urbain dense (Paris), cela représente 1-2 arrondissements. Acceptable pour la précision sans révéler l'adresse.

### 10.2 Données sensibles — Chiffrement

**Approche MVP (pragmatique) :**
- Les données utilisateur (profil foyer, inventaire, plans de fuite) sont protégées par la **Row Level Security (RLS) de Supabase** — chaque utilisateur ne peut lire/écrire que ses propres données
- C'est suffisant pour le MVP : Supabase ne vend pas de données, la RLS PostgreSQL est robuste

**Approche v1.1 (renforcée) :**
- Chiffrement côté client des données sensibles (profil foyer, cercle de confiance) avec une clé dérivée du mot de passe via PBKDF2
- Supabase stocke des blobs chiffrés — même en cas de breach, les données sont illisibles
- **Contrainte UX à documenter clairement** : si l'utilisateur oublie son mot de passe → perte définitive des données chiffrées (pas de récupération possible). Les CGU et l'interface doivent être très clairs là-dessus.

### 10.3 Chat communautaire

**v1 MVP :** chiffrement en transit uniquement (HTTPS). Supabase Realtime.
**v1.1 :** chiffrement E2E côté client (Web Crypto API en web, bibliothèque native en Flutter v2). Les messages sont chiffrés avant envoi et déchiffrés à la réception — Supabase ne voit que du contenu opaque.

### 10.4 Base légale RGPD

- **Base légale principale** : consentement explicite (article 6.1.a RGPD)
- **Privacy by Design** documenté (article 25 RGPD)
- **Droits des utilisateurs** :
  - Droit d'accès : export de toutes les données en JSON (bouton dans les paramètres)
  - Droit à l'effacement : suppression complète du compte et de toutes les données associées
  - Droit à la portabilité : export standardisé
- **DPO** : pour le MVP, le responsable de traitement assume le rôle. Si >25k utilisateurs, envisager un DPO externe.
- **Mentions légales et politique de confidentialité** : pages statiques dans l'app et sur le site web

### 10.5 CGU & Décharge de responsabilité — BUDGET NON-NÉGOCIABLE

**Budget estimé : 500-1000€ pour une rédaction par un avocat spécialisé.**

Points clés à couvrir dans les CGU :
1. Décharge sur l'exactitude des informations (les alertes sont indicatives, pas des consignes officielles)
2. Décharge sur les itinéraires (l'utilisateur reste responsable de ses décisions)
3. Clause de non-substitution aux autorités officielles
4. Limitation de responsabilité en cas de fausse alerte
5. Règles d'utilisation de la communauté (contenu prohibé, modération)

**Formulation obligatoire dans l'app** (onboarding + chaque alerte) :
> "Les informations fournies par EVAQ sont indicatives et basées sur des sources tierces. Elles ne se substituent pas aux consignes officielles des autorités (préfecture, FR-Alert, gouvernement). En cas d'urgence, consultez toujours les canaux officiels."

### 10.6 Classification juridique des notifications

Pour rester compliant avec la réglementation sur les alertes d'urgence (seul l'État peut émettre des "alertes officielles") :

- **Formulation interdite** : "ALERTE : vous êtes en danger" / "URGENCE : évacuez immédiatement"
- **Formulation correcte** : "Information EVAQ : selon nos sources, [événement] est signalé à [distance] de votre zone"
- **Mention systématique** : "Consultez FR-Alert et les autorités locales pour les consignes officielles"

---

## 11. Structure base de données (Supabase/PostgreSQL)

### Tables principales

```sql
-- Utilisateurs
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  h3_index TEXT NOT NULL,              -- Zone géographique approximative (H3 résolution 7)
  h3_work_index TEXT,                  -- Zone de travail optionnelle
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'monthly' | 'yearly'
  subscription_expires_at TIMESTAMPTZ,
  active_packs JSONB DEFAULT '[]',     -- [{pack_id: 'plan_fuite', expires_at: '...'}]
  onboarding_completed BOOLEAN DEFAULT FALSE,
  mode_sage BOOLEAN DEFAULT TRUE,
  defcon_notification_level INT DEFAULT 3, -- Notifier à partir de ce niveau
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Profil foyer (données sensibles — chiffrement client en v1.1)
user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  adults_count INT NOT NULL DEFAULT 1,
  children_data JSONB,                 -- [{age: 5}, {age: 8}]
  animals_data JSONB,                  -- [{type: 'chien', count: 1}]
  has_pmr BOOLEAN DEFAULT FALSE,
  vehicle_type TEXT,                   -- 'car' | 'moto' | 'velo' | 'none'
  floor_number INT,
  skills JSONB,                        -- ['first_aid', 'navigation', 'mechanics']
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Inventaire kit de survie
inventory_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,              -- 'water' | 'food' | 'medical' | 'tools' | 'documents' | 'communication' | 'nuclear' | 'chemical'
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT,                           -- 'litres' | 'jours' | 'unités' | 'kg'
  expiry_date DATE,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
)

-- Alertes agrégées
alerts (
  id UUID PRIMARY KEY,
  source_ids JSONB NOT NULL,           -- Array des sources qui ont signalé cet événement
  primary_source TEXT NOT NULL,        -- Source principale (la plus fiable)
  score_source NUMERIC NOT NULL,       -- Score de la source primaire
  score_recoupement NUMERIC DEFAULT 0,
  score_final NUMERIC NOT NULL,
  detection_mode TEXT NOT NULL,        -- 'SCOUT' | 'SENTINEL' | 'FUSED'
  threat_type TEXT NOT NULL,           -- 'military' | 'nuclear' | 'chemical' | 'biological' | 'natural' | 'sanitary' | 'civil'
  threat_subtype TEXT,                 -- Ex: 'earthquake', 'flooding', 'airstrike'
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  radius_km NUMERIC NOT NULL,
  severity INT NOT NULL,               -- 1 (URGENCE) à 5 (VEILLE)
  is_early_warning BOOLEAN DEFAULT FALSE, -- TRUE si SENTINEL non confirmé par SCOUT
  raw_data JSONB,                      -- Données brutes des sources
  source_urls JSONB,                   -- URLs sources pour transparence
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,           -- Quand SCOUT a confirmé un signal SENTINEL
  resolved_at TIMESTAMPTZ            -- Fin de l'événement
)

-- Alertes par utilisateur (calculées côté client, stockées pour historique)
user_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id),
  defcon_level_for_user INT NOT NULL,  -- Niveau calculé selon distance user-alerte
  distance_km NUMERIC NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ            -- Si l'utilisateur a fermé l'alerte
)

-- Plans de fuite sauvegardés (premium offline)
saved_evacuation_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id), -- Alerte pour laquelle le plan a été calculé
  threat_type TEXT NOT NULL,
  origin_h3 TEXT NOT NULL,            -- Point de départ (H3)
  destination_data JSONB NOT NULL,    -- Point d'arrivée, coordonnées, description
  routes_data JSONB NOT NULL,         -- 3 itinéraires avec waypoints, distances, durées
  offline_map_region JSONB,           -- Bounds de la région à cacher offline
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- sync_frequency supprimé : la fréquence est déterminée par le subscription_tier de l'utilisateur
)

-- Voisinage communautaire (v1.1)
community_signals (
  id UUID PRIMARY KEY,
  h3_index TEXT NOT NULL,             -- Zone H3 résolution 7 de l'émetteur
  signal_type TEXT NOT NULL,          -- 'need_help' | 'have_stock' | 'leaving' | 'danger' | 'road_blocked' | 'shelter_available'
  message TEXT,                       -- Optionnel, texte libre court (max 200 chars)
  anonymous_id TEXT NOT NULL,         -- Pseudonyme généré par session
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL     -- Auto-expiration (24h par défaut)
)

-- Cercle de confiance (v1.1)
trusted_contacts (
  id UUID PRIMARY KEY,
  user_id_requester UUID REFERENCES users(id),
  user_id_target UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',      -- 'pending' | 'accepted' | 'rejected' | 'blocked'
  shared_info_requester JSONB,        -- Ce que le demandeur partage
  shared_info_target JSONB,           -- Ce que la cible partage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Messages chat chiffrés (v1.1)
chat_messages (
  id UUID PRIMARY KEY,
  channel_id TEXT NOT NULL,           -- 'zone_{h3_index}' ou 'private_{contact_id}'
  sender_anonymous_id TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,    -- Contenu chiffré (E2E en v2)
  iv TEXT,                            -- Vecteur d'initialisation pour AES (v2)
  message_type TEXT DEFAULT 'text',   -- 'text' | 'signal' | 'location_share'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ             -- Messages expirés automatiquement (72h par défaut)
)

-- Base de connaissances survie
survival_knowledge (
  id UUID PRIMARY KEY,
  threat_type TEXT NOT NULL,
  scenario TEXT,                      -- Ex: 'nuclear_indoor', 'flood_vehicle'
  category TEXT NOT NULL,             -- 'action', 'kit', 'route', 'shelter', 'communication'
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  sources JSONB NOT NULL,             -- Sources officielles citées
  priority_order INT DEFAULT 0,       -- Ordre d'affichage (1 = plus urgent)
  locale TEXT DEFAULT 'fr',
  last_reviewed_at DATE NOT NULL
)

-- Logs des sources (monitoring du pipeline NLP)
source_ingestion_logs (
  id UUID PRIMARY KEY,
  source_id TEXT NOT NULL,
  raw_item_id TEXT,
  status TEXT NOT NULL,               -- 'processed' | 'discarded' | 'error'
  alert_id UUID REFERENCES alerts(id), -- Si une alerte a été créée
  processing_time_ms INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Indexes recommandés

```sql
CREATE INDEX idx_alerts_location ON alerts USING GIST (ll_to_earth(latitude, longitude));
CREATE INDEX idx_alerts_severity_active ON alerts(severity) WHERE resolved_at IS NULL;
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_user_alerts_user ON user_alerts(user_id);
CREATE INDEX idx_inventory_user ON inventory_items(user_id);
CREATE INDEX idx_community_signals_h3 ON community_signals(h3_index);
CREATE INDEX idx_chat_channel ON chat_messages(channel_id, created_at DESC);
```

---

## 12. Modèle économique

### 12.1 Tiers & Monétisation

#### Modèle complet : Freemium + One-shot + Abonnement

Le modèle s'articule sur **trois niveaux de dépense** pour capturer différents profils d'utilisateurs : le curieux (gratuit), le préoccupé ponctuel (one-shot), et le préparateur régulier (abonnement).

---

#### Tier 1 — Gratuit (base réduite volontairement)

L'offre gratuite doit être utile mais clairement limitée — assez pour convaincre, pas assez pour se passer du reste.

| Feature | Gratuit |
|---------|---------|
| Dashboard DEFCON + alertes temps réel | Oui |
| Fil d'alertes (mode Sage 80%) | Oui — 3 dernières alertes uniquement |
| Calcul du plan de fuite (en ligne) | Oui — 1 calcul/jour |
| Kit de survie — inventaire manuel | Oui — limité à 15 items |
| Base de connaissances survie | Accès limité (fiches basiques uniquement) |
| Notifications push | Oui — niveaux DEFCON 3+ uniquement |
| Publicité (bannières discrètes) | Oui |
| Sauvegarde offline | Non |
| Historique des alertes | 24h uniquement |

**Objectif** : que l'utilisateur gratuit perçoive la valeur, mais ressente la friction sur les 3 points-clés : la limite de calcul de fuite, la limite d'inventaire, et l'absence d'offline.

---

#### Tier 2 — One-shot (nouveauté — entre gratuit et abonnement)

Des achats ponctuels pour les utilisateurs qui ne veulent pas s'abonner mais ont un besoin spécifique. Idéal pour les utilisateurs occasionnels ou ceux qui veulent "essayer" le premium.

| Pack | Prix | Contenu | Durée |
|------|------|---------|-------|
| **Pack Alerte** | 1.99€ | Toutes les alertes sans limite + historique 30 jours | 30 jours |
| **Plan de fuite complet** | 2.99€ | Calcul illimité + sauvegarde offline du plan (1 plan) | 90 jours |
| **Kit complet** | 1.99€ | Inventaire illimité + toutes les fiches de survie | À vie |
| **Pack Préparation** | 4.99€ | Kit complet + Plan de fuite complet + Pack Alerte | 30 jours |

**Logique** : le Pack Préparation à 4.99€ (one-shot, 30 jours) coûte autant que l'abonnement mensuel → l'utilisateur qui l'achète deux fois comprend que l'abonnement est plus avantageux.

---

#### Tier 3 — Abonnement

| Plan | Prix | Contenu |
|------|------|---------|
| **Mensuel** | 4.99€/mois | Tout déverrouillé + sync offline weekly + pas de pub |
| **Annuel** | 34.99€/an (~2.92€/mois) | Tout déverrouillé + sync offline daily + historique 90 jours + **-42% vs mensuel** |
| **Famille** (v1.1) | 7.99€/mois | Jusqu'à 5 profils, partage cercle de confiance familial |

**"Tout déverrouillé" = :**
- Alertes illimitées, toutes catégories, historique 90 jours
- Calculs de fuite illimités
- Sauvegarde offline des plans de fuite + cartes (rayon ~50km, sync weekly/daily)
- Inventaire illimité + toutes les fiches de survie
- Rappels de péremption du kit
- Notifications à partir de DEFCON 4 (pas seulement 3)
- Zéro publicité

---

#### Tableau de comparaison complet

| Feature | Gratuit | Pack one-shot | Mensuel | Annuel |
|---------|---------|--------------|---------|--------|
| Dashboard DEFCON | Oui | Oui | Oui | Oui |
| Fil d'alertes | 3 dernières | Illimité (30j) | Illimité | Illimité |
| Historique alertes | 24h | 30 jours | 30 jours | 90 jours |
| Plan de fuite (calcul) | 1/jour | Illimité (90j) | Illimité | Illimité |
| Plan de fuite offline | Non | 1 plan (90j) | Weekly | Daily |
| Inventaire kit | 15 items | Illimité (si Pack Kit) | Illimité | Illimité |
| Fiches de survie | Basiques | Toutes (si Pack Kit) | Toutes | Toutes |
| Notifications DEFCON | ≥3 | ≥3 | ≥4 | ≥4 |
| Rappels péremption | Non | Non | Oui | Oui |
| Publicité | Oui | Oui | Non | Non |
| **Prix** | **0€** | **1.99-4.99€** | **4.99€/mois** | **34.99€/an** |

**Note sur la terminologie Stripe :** les one-shots sont des `payment_intent` Stripe (paiement unique), les abonnements sont des `subscription` Stripe avec `billing_cycle`. La colonne `subscription_tier` en base gère les deux en JSON : `{type: 'pack', pack_id: 'plan_fuite', expires_at: '...'}`.

### 12.2 Affiliation survivalisme

- **Où** : uniquement dans le Module Kit de survie, mode DEFCON 5
- **Quoi** : liens vers les items manquants dans le kit
- **Qui** : Décathlon (programme partenaire), Lyophilise.fr, Amazon Affiliation (3-8%)
- **Label obligatoire** : "Lien partenaire" visible
- **Jamais** pendant une alerte active

### 12.3 Contenu éducatif premium (v1.1)

- Guides PDF avancés (orientation, survie en nature, protocoles médicaux)
- Vidéos courtes partenaires formateurs certifiés
- Modèle : inclus dans l'abonnement annuel, ou à l'unité en microtransaction

### 12.4 Publicité (tier gratuit uniquement)

- Intégration **Google AdSense** (version web — AdMob est réservé aux apps mobiles natives, sera utilisé en v2 Flutter)
- Bannières affichées uniquement dans : inventaire, base de connaissances, profil
- **Zéro publicité sur** : dashboard DEFCON, carte de fuite, écrans d'alerte, chat communautaire

### 12.5 Écarté du MVP

- **Données B2B anonymisées** : trop de risque juridique et de perception négative pour le MVP. À réévaluer uniquement si un partenaire institutionnel la demande explicitement.
- **Marketplace communautaire** : feature v2, après validation de la base utilisateurs.

---

## 13. Coûts estimés

### Coûts fixes MVP v1 — Web/PWA (mensuel)

| Service | Coût | Notes |
|---------|------|-------|
| Vercel Free | 0€ | Hosting Next.js, 100GB bandwidth/mois, déploiements illimités |
| Supabase Free | 0€ | Suffisant jusqu'à 50k MAU |
| VPS OSRM (Hetzner CX11) | 5€ | Obligatoire dès MVP — démo server non viable |
| Web Push / VAPID | 0€ | Standard navigateur, pas de service tiers nécessaire |
| GDACS API | 0€ | Citer la source |
| ACLED API | 0€ | Accord non-commercial à confirmer |
| UCDP API | 0€ | Open access |
| Flux RSS directs | 0€ | Pas de limite documentée |
| Telegram MTProto API | 0€ | Accès gratuit |
| GeoNames (dictionnaire lieux) | 0€ | Téléchargement one-time |
| Stripe | 0€ fixe | Commission variable : 1.5% + 0.25€/transaction |
| **Total MVP v1** | **~5€/mois** | Très en dessous du budget 20$/mois |

### Coûts supplémentaires v2 — Flutter mobile (quand lancé)

| Service | Coût | Notes |
|---------|------|-------|
| Apple Developer Account | ~8€/mois | 99€/an, obligatoire pour l'App Store |
| Google Play Developer | ~2€/mois | 25€ one-time amorti |
| Firebase Cloud Messaging | 0€ | Gratuit, illimité |
| RevenueCat | 0€ | Gratuit sous 2 500$/mois de revenus |
| **Surcoût v2** | **~10€/mois** | S'ajoute aux 5€ du backend |

### Coûts conditionnels (si besoin)

| Service | Coût | Déclencheur |
|---------|------|-------------|
| Vercel Pro | 20$/mois | Si >100GB bandwidth ou analytics avancés |
| Supabase Pro | 25€/mois | Si >50k MAU ou uptime garanti nécessaire |
| Maptiler CDN (tuiles OSM) | ~10€/mois | Si volume de requêtes tuiles important |
| Twitter/X API Basic | ~90€/mois | Si intégration Twitter souhaitée en v1.1 |
| HuggingFace Inference API | 0-9$/mois | Si NLP avancé (NER) en v1.1 |
| VPS NLP Python | 5-10€/mois | Si microservice NLP séparé en v1.1 |
| CGU / Avocat | 500-1000€ | One-time, obligatoire avant lancement |

---

## 14. Roadmap & Timeline

### Vue d'ensemble

```
v1 — Site web / PWA    →    v1.1 — Communauté    →    v2 — App mobile native
  (~5 mois, ~Août 2026)       (+2 mois)                  (+3 mois, ~Début 2027)
```

> **Rappel du choix stratégique :** on commence par un site web consultable sur téléphone (PWA = site web installable sur l'écran d'accueil). C'est plus rapide à lancer qu'une vraie app mobile, et ça permet de valider le concept avant d'investir dans la version native iOS/Android.

Rythme de travail : **Julian ~9h/semaine — Yévana ~6h/semaine**

---

### Phase 0 — Mise en place (Semaines 1-2)

**Ce qu'on construit :** les fondations techniques invisibles de l'app. Rien n'est encore visible pour un utilisateur, mais tout le reste repose là-dessus.

**Julian (15h) :**
- [ ] Créer le projet web (Next.js) et le connecter à Vercel pour le déploiement automatique
- [ ] Configurer l'app pour fonctionner comme une PWA (installable sur l'écran d'accueil d'un téléphone)
- [ ] Créer la base de données sur Supabase (l'outil qui stocke toutes les données de l'app)
- [ ] Mettre en place le dépôt Git sur GitHub (historique du code, travail en branches)
- [ ] Déployer le serveur de calcul d'itinéraires (OSRM) sur un serveur loué ~5€/mois — c'est lui qui calculera les routes de fuite
- [ ] Configurer les notifications push (le mécanisme qui permet à l'app d'envoyer des alertes sur le téléphone, même sans connexion ouverte)
- [ ] S'inscrire et tester les accès aux APIs de données : GDACS (catastrophes naturelles ONU/UE), UCDP (conflits armés), WHO (sanitaire), GeoNames (base de données géographique mondiale)
- [ ] Envoyer un email à ACLED pour clarifier si on peut utiliser leurs données de conflits dans une app commerciale

**Yévana (12h) :**
- [ ] Faire un benchmark des apps et sites concurrents — noter ce qui est bien, ce qui est mal, et ce qui manque (avec screenshots)
- [ ] Télécharger et organiser les documents officiels de référence : guide "Tous Responsables" du SGDSN, kit 72h du gouvernement, CataKit de la Croix-Rouge, recommandations nucléaires de l'ICRP
- [ ] Vérifier que le nom "EVAQ" est disponible : domaines evaq.com / evaq.fr / evaq.app, et sur les réseaux sociaux

---

### Phase 1 — Alertes & Niveaux DEFCON, première source (Semaines 3-6)

**Ce qu'on construit :** le cœur de l'app. On branche une première source d'alertes (GDACS, l'outil de l'ONU et de l'UE pour les catastrophes naturelles), on calcule le niveau de risque pour l'utilisateur, et on affiche tout ça dans une interface lisible. À la fin de cette phase, quelqu'un peut s'inscrire, voir les alertes en cours dans le monde et recevoir une notification sur son téléphone.

**Julian (36h) :**
- [ ] Mettre en place la récupération automatique des alertes GDACS toutes les 5 minutes et les stocker en base de données
- [ ] Calculer automatiquement le niveau DEFCON de l'utilisateur selon la distance entre lui et l'alerte (le calcul se fait dans le navigateur, pas sur le serveur — pour protéger la vie privée)
- [ ] Créer la page principale : affichage du niveau DEFCON actuel avec code couleur (vert / jaune / orange / rouge / noir)
- [ ] Créer la page liste des alertes, avec le "mode sage" activé par défaut (n'affiche que les alertes dont le score de fiabilité dépasse 80%)
- [ ] Créer la page détail d'une alerte : quelle source, quel score de confiance, mini-carte de la zone
- [ ] Configurer les notifications push : l'utilisateur reçoit une alerte sur son téléphone quand le niveau DEFCON passe à 3 ou plus
- [ ] Intégrer dans l'onboarding le guide "Ajouter à l'écran d'accueil" pour les utilisateurs iPhone (étape obligatoire pour recevoir les notifications sur iOS)
- [ ] Écrire les tests automatisés pour l'algorithme de score et le calcul du niveau DEFCON

**Yévana (24h) :**
- [ ] Designer les 3 écrans principaux dans Figma ou Penpot : tableau de bord DEFCON, liste des alertes, détail d'une alerte
- [ ] Rédiger tous les textes de l'interface : titres, labels, messages de notification, messages d'erreur — en veillant à la formulation légale ("Information selon nos sources..." et non "ALERTE : vous êtes en danger")
- [ ] Tester l'app manuellement sur iPhone (Safari) et Android (Chrome) une fois la phase terminée

---

### Phase 1b — Alertes, sources supplémentaires + croisement (Semaines 7-9)

**Ce qu'on construit :** on ajoute d'autres sources de données (conflits armés, alertes sanitaires) et on croise les informations entre elles. Une alerte confirmée par plusieurs sources indépendantes aura un score plus élevé qu'une alerte vue par une seule source.

> ⚠️ Cette phase ne peut démarrer qu'après confirmation de la licence ACLED (email à envoyer en Phase 0). Si ACLED refuse, on passe sur UCDP qui est équivalent et entièrement gratuit.

**Julian (27h) :**
- [ ] Brancher les données ACLED (conflits armés) ou UCDP (backup) — même logique que GDACS
- [ ] Brancher les alertes sanitaires de l'OMS
- [ ] Écrire l'algorithme de croisement : quand deux sources différentes signalent un événement dans la même zone dans les 2 heures, le score de fiabilité augmente
- [ ] Ajouter le délai de sécurité de 15 minutes avant d'envoyer une notification de niveau 2 ou 1 (éviter les fausses alertes)

**Yévana (18h) :**
- [ ] Comparer les alertes générées par l'app avec de vrais événements passés connus : est-ce que l'app les aurait bien détectés ? Est-ce qu'elle génère des fausses alertes ?
- [ ] Rédiger la page "Nos sources" de l'app (transparence sur la méthode, les sources utilisées et leurs scores de fiabilité)

---

### Phase 1c — Surveillance des médias et réseaux sociaux (Semaines 10-12)

**Ce qu'on construit :** la détection précoce. On analyse en temps réel les articles de presse et certains canaux Telegram spécialisés pour détecter des signaux de crise *avant* que les sources officielles (GDACS, ACLED) ne les enregistrent. Ces signaux sont affichés avec un badge "Signal précoce — en cours de vérification" et ne peuvent pas déclencher une alerte de niveau critique seuls.

> Les deux couches de détection ont des noms internes : **SCOUT** (sources officielles structurées) et **SENTINEL** (médias + réseaux sociaux). SCOUT = précis mais parfois plus lent. SENTINEL = rapide mais moins fiable.

**Julian (27h) :**
- [ ] Brancher les flux d'actualités des grands médias (Reuters, France24, BBC, Le Monde, RFI, BFMTV, Al Jazeera) — ces flux sont publics et gratuits
- [ ] Écrire le programme qui lit ces articles, repère les noms de lieux géographiques (grâce à la base GeoNames téléchargée en Phase 0) et classe l'article par type de menace (militaire, naturel, sanitaire...) en cherchant des mots-clés dans les textes
- [ ] Intégrer les canaux Telegram OSINT validés par Yévana (même logique de détection)
- [ ] Afficher les signaux précoces dans l'interface avec le badge "en cours de vérification"
- [ ] Créer un tableau de bord de monitoring interne (pour Julian uniquement) : combien d'articles analysés, combien d'alertes déclenchées, taux d'erreur

**Yévana (18h) :**
- [ ] Identifier et valider 10 à 15 canaux Telegram d'information géopolitique (OSINT) fiables : ancienneté, réputation, citations par les médias établis. Produire une liste finale avec justification
- [ ] Construire le dictionnaire de mots-clés par catégorie de menace (militaire, nucléaire, chimique, sanitaire, naturel, civil) — environ 100 mots par catégorie, en français et en anglais
- [ ] Tester la qualité de la détection en simulant des événements passés connus : combien de minutes avant GDACS l'alerte aurait-elle été détectée ?

---

### Phase 2 — Plan de fuite (Semaines 13-16)

**Ce qu'on construit :** la carte interactive et le calcul d'itinéraires de fuite. L'utilisateur voit sa position, les zones de menace, et peut demander 3 itinéraires de fuite calculés en temps réel en tenant compte de l'état du trafic et du type de menace.

**Julian (36h) :**
- [ ] Intégrer la carte interactive OpenStreetMap dans l'app web
- [ ] Connecter le moteur de calcul d'itinéraires déployé en Phase 0 (OSRM) pour calculer les routes
- [ ] Écrire les règles de fuite par type de menace : bombardement → abris souterrains proches ; nucléaire → fuite à 100km+ dans le sens contraire du vent ; chimique → perpendiculaire au vent ; inondation → points hauts
- [ ] Intégrer la direction du vent en temps réel (API gratuite Météo-France) pour les menaces nucléaires et chimiques
- [ ] Afficher l'état du trafic sur les routes (données gratuites du gouvernement français via api.gouv.fr)
- [ ] Adapter les itinéraires au profil du foyer : sans voiture → itinéraires à pied/transports en commun ; PMR → routes accessibles ; animaux → destinations qui les acceptent
- [ ] Faire en sorte que les tuiles de carte autour de la position de l'utilisateur soient mises en cache pour une utilisation sans connexion (mode hors-ligne de base)

**Yévana (24h) :**
- [ ] Recenser les principaux abris souterrains en Île-de-France : stations de métro profondes, grands parkings couverts — avec adresses et coordonnées GPS
- [ ] Cartographier les zones de repli à moins de 150km de Paris : forêts, zones rurales, points hauts, petites villes — avec un niveau de pertinence selon le type de menace
- [ ] Rédiger les fiches "Quoi faire selon le type de menace" (texte affiché dans l'app quand l'utilisateur consulte son plan de fuite)

---

### Phase 3 — Kit de survie (Semaines 17-19)

**Ce qu'on construit :** l'inventaire de survie personnalisé. L'utilisateur saisit ce qu'il a chez lui, l'app compare avec ce qu'il devrait avoir selon son profil et le type de menace active, et lui montre ce qui manque avec un score de préparation.

**Julian (27h) :**
- [ ] Créer les pages de gestion de l'inventaire : ajouter/modifier/supprimer des objets par catégorie (eau, nourriture, médical, outils, documents, communication)
- [ ] Importer la base de connaissances survie préparée par Yévana dans la base de données
- [ ] Écrire l'algorithme de comparaison : inventaire réel de l'utilisateur vs kit recommandé selon son profil (nombre de personnes, animaux, enfants...) et la menace active
- [ ] Créer la page "Ce qu'il vous manque" avec le score de préparation de 0 à 100%
- [ ] Ajouter les liens d'affiliation sur les items manquants (uniquement quand il n'y a pas d'alerte active — jamais pendant une crise)
- [ ] Tester que le kit recommandé change correctement selon différents profils types

**Yévana (18h) :**
- [ ] Finaliser la base de connaissances : structurer tout le contenu par type de menace, catégorie d'objet, et niveau de priorité. Format : tableur exportable en JSON
- [ ] Rédiger les fiches conseil pour chaque type de menace (texte affiché dans l'app)
- [ ] Vérifier que chaque recommandation cite sa source officielle exacte (guide SGDSN page X, CataKit Croix-Rouge, etc.)

---

### Phase 4 — Paiements & Mode hors-ligne premium (Semaines 20-21)

**Ce qu'on construit :** le système de paiement (packs one-shot + abonnements via Stripe) et les fonctionnalités réservées aux utilisateurs payants, notamment le mode hors-ligne avancé et les rappels de péremption.

**Julian (18h) :**
- [ ] Intégrer Stripe pour les paiements : page de paiement sécurisée hébergée par Stripe (on ne touche jamais les numéros de carte), gestion des abonnements, portail de self-service pour l'utilisateur
- [ ] Connecter les événements de paiement Stripe à la base de données (quand quelqu'un paie → son compte est automatiquement mis à jour)
- [ ] Créer le système de paywall : afficher les bonnes fonctionnalités selon le niveau de l'utilisateur (gratuit / pack / abonné)
- [ ] Téléchargement proactif des tuiles de carte autour du domicile de l'utilisateur (rayon ~50km) pour le mode hors-ligne — fonctionnalité premium
- [ ] Sauvegarde locale des plans de fuite calculés (pour consultation sans connexion)
- [ ] Rappels de péremption des items du kit par notification
- [ ] Intégrer Google AdSense pour les bannières publicitaires (tier gratuit uniquement, dans les zones autorisées)

**Yévana (12h) :**
- [ ] Créer la landing page marketing d'EVAQ (peut être une page du site ou un outil externe type Webflow)
- [ ] Rédiger les textes SEO du site : descriptions, titres des pages, articles de la base de connaissances publique

---

### Phase 5 — Tests & Lancement (Semaine 22)

**Ce qu'on fait :** on teste tout de bout en bout, on corrige les derniers bugs, et on lance officiellement le site. Pas de soumission à l'App Store — le site est accessible immédiatement sur mobile via le navigateur.

**Julian (12h) :**
- [ ] Tester le parcours complet : inscription → alerte → notification → plan de fuite → paiement
- [ ] Vérifier la vitesse et la qualité du site (score PWA, performance mobile)
- [ ] Tester sur les 4 navigateurs cibles : Chrome Android, Safari iOS, Firefox, Edge
- [ ] Tester spécifiquement les notifications push sur iPhone avec l'app installée en PWA
- [ ] Corriger les bugs critiques trouvés
- [ ] Mettre en place le monitoring : logs d'erreur, alertes si le site tombe, analytics

**Yévana (8h) :**
- [ ] Organiser un beta test avec 10 à 20 personnes en Île-de-France — leur envoyer le lien, collecter les retours via un Google Forms structuré
- [ ] Vérifier et documenter le parcours d'installation sur iPhone ("Ajouter à l'écran d'accueil" dans Safari) pour s'assurer que c'est clair pour quelqu'un qui n'est pas tech

---

### Phase 6 — Communauté v1.1 (6-8 semaines après le lancement)

**Ce qu'on construit :** la dimension sociale de l'app. Les utilisateurs peuvent voir combien de voisins utilisent EVAQ dans leur zone, envoyer des signaux rapides ("J'ai du stock", "Je pars", "Danger dans ma rue"), et accéder à un chat de zone anonyme.

- Signaux rapides de zone + chat anonyme de quartier
- Cercle de confiance bilatéral pour les utilisateurs premium (partage d'infos entre personnes de confiance)
- Onglet "Risques à long terme" basé sur les prévisions de conflits (VIEWS, Université d'Uppsala)
- Scan photo pour ajouter des items au kit (version beta)
- Ajout de Reddit et Mastodon comme sources supplémentaires pour la détection précoce
- Intégration Twitter/X si le budget le permet (~90€/mois pour l'accès API)

---

### Phase 7 — App mobile native iOS/Android v2 (8-12 semaines après la v1.1)

> **Ne démarrer qu'après avoir validé que des gens utilisent et paient pour la PWA.**

**Ce qu'on construit :** la "vraie" app mobile, téléchargeable sur l'App Store et Google Play. Elle utilise exactement les mêmes données et la même logique que la version web — on ne repart pas de zéro, on adapte l'interface.

Avantages par rapport à la PWA :
- Mode hors-ligne complet (téléchargement de toute une région de carte)
- Notifications push plus fiables sur iPhone
- Paiements intégrés via Apple Pay / Google Pay (in-app purchases natifs)
- Meilleure performance générale

Étapes principales :
- Réécrire l'interface en Flutter (framework mobile cross-platform iOS + Android)
- Adapter les outils techniques au mobile natif (cartes, notifications, paiements, stockage local)
- Soumettre sur l'App Store d'Apple (délai de validation 1 à 7 jours à anticiper)
- Soumettre sur le Google Play Store (délai de validation 1 à 3 jours)

---

## 15. CI/CD & Tests

### CI/CD — Vercel + GitHub Actions

**Vercel gère le déploiement nativement** — chaque push déclenche un build automatique :
- Push sur `dev` → Preview URL (URL unique par PR, partageable pour review)
- Push sur `main` → Déploiement en production automatique
- Rollback en 1 clic depuis le dashboard Vercel si problème

**GitHub Actions** pour les tests uniquement :

```yaml
# .github/workflows/ci.yml

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint          # ESLint + TypeScript check
      - run: npm run test          # Jest / Vitest tests unitaires
      - run: npm run build         # Vérifie que le build Next.js passe

  test-edge-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v1
      - run: deno test supabase/functions/  # Tests des Edge Functions
```

### Stratégie de tests

**Tests unitaires (obligatoires dès Phase 1) :**
- Algorithme de scoring (score_final, recoupement, modificateurs)
- Calcul de distance et classification DEFCON
- Conversion coordonnées → H3
- Parsing RSS (formats edge cases)
- Extraction d'entités géographiques (faux positifs connus)

**Tests d'intégration :**
- Pipeline GDACS → Edge Function → BDD → notification push
- Routing OSRM (requête → résultat → affichage carte)
- Stripe (paiement test en mode sandbox → mise à jour subscription_tier → déverrouillage feature)

**Tests manuels (Yévana + beta testeurs) :**
- Scénarios de crise simulés avec datasets historiques GDACS
- UX flows complets (onboarding → alerte → plan de fuite)
- Comportement offline (mode avion activé)

**Données de test :**
- Utiliser les archives GDACS et ACLED (événements historiques) pour tester le pipeline sans attendre de vraie catastrophe
- Créer des fixtures de test pour les événements simulés

---

### Stratégie de test des alertes

> **Problème :** On ne peut pas attendre qu'un séisme se produise pour vérifier que le pipeline fonctionne. Il faut des méthodes pour tester le système en dehors de toute crise réelle.

#### Méthode 1 — Replay d'archives historiques (SCOUT)

GDACS et ACLED mettent à disposition leurs données historiques librement. Le principe : rejouer des événements passés connus comme si c'était du temps réel, et vérifier que le pipeline réagit correctement.

**Événements cibles pour les fixtures :**

| Événement | Date | Type | DEFCON attendu |
|-----------|------|------|---------------|
| Séisme Türkiye-Syrie | Fév 2023 | Naturel | 3 (loin de France) |
| Cyclone Freddy Madagascar | Mars 2023 | Naturel | 5 (hors zone) |
| Explosion Beyrouth | Août 2020 | Industriel/Sécurité | 3 (risque régional) |
| Conflit Sahel escalade | Juil 2023 | Conflits armés | 4 (France indirectement) |

**Procédure de test :**
1. Injecter l'événement dans la table `alerts` avec une `created_at` fictive passée
2. Positionner un utilisateur de test à une distance connue de l'épicentre (ex : Paris → Beyrouth = 3 300km)
3. Déclencher manuellement l'Edge Function de calcul DEFCON
4. Vérifier que le niveau DEFCON calculé correspond à l'attendu
5. Vérifier que la notification serait bien envoyée (ou pas, si en dessous du seuil)

#### Méthode 2 — Injection d'événements fictifs (endpoint de test)

En mode développement uniquement, exposer un endpoint protégé `/api/test/inject-alert` qui accepte un JSON d'alerte fictive et le fait passer dans tout le pipeline.

```typescript
// Uniquement accessible si NEXT_PUBLIC_ENV=development
// Exemple de payload :
{
  "source": "GDACS_TEST",
  "event_type": "EQ",
  "latitude": 48.5,
  "longitude": 2.3,
  "magnitude": 6.2,
  "radius_km": 200,
  "score_fiabilite": 85
}
```

Ce endpoint permet à Julian de tester le pipeline complet en 30 secondes, sans dépendre d'un vrai événement.

> Désactiver ce endpoint en production via variable d'environnement. Ne jamais merger avec `NEXT_PUBLIC_ENV=development` activé en prod.

#### Méthode 3 — Test de la détection SENTINEL (médias/réseaux sociaux)

Tester SENTINEL nécessite des articles de presse fictifs ou archivés contenant des noms de lieux et des mots-clés de menace.

**Jeu de test SENTINEL :**
- **Vrai positif** : article réel du Monde du 06/02/2023 sur le séisme en Türkiye → doit générer un signal géolocalisé en Turquie, type "naturel", score ≥ 60
- **Faux positif** : texte contenant "tension monte dans le Loir-et-Cher" → ne doit PAS générer d'alerte militaire
- **Ambiguïté géographique** : "Jordan" (prénom anglais vs Jordanie) → doit être correctement résolu via le contexte

**Métriques de qualité SENTINEL à suivre :**

| Métrique | Cible MVP | Mesure |
|----------|-----------|--------|
| Taux de vrais positifs | > 70% | Événements GDACS précédés d'un signal SENTINEL dans les 2h |
| Taux de faux positifs | < 15% | Signaux SENTINEL sans correspondance dans les sources officielles à J+1 |
| Délai de détection | < 30 min | Temps entre publication article → signal dans l'interface |

#### Critères de succès du pipeline d'alertes

**SCOUT (sources officielles) :**
- [ ] Un événement GDACS magnitude ≥ 5.5 à moins de 500km de Paris déclenche DEFCON 3 dans les 5 minutes suivant la publication GDACS
- [ ] Deux événements SCOUT dans la même zone H3 sur 2h font monter le score de fiabilité > 85
- [ ] Le délai de 15min pour DEFCON 2 est bien respecté (pas d'envoi immédiat)

**SENTINEL (médias + réseaux sociaux) :**
- [ ] SENTINEL seul ne peut pas déclencher DEFCON 2 ou DEFCON 1 (règle dure, non négociable)
- [ ] Un signal SENTINEL déclenche l'affichage du badge "Signal précoce — en cours de vérification" sans notification push
- [ ] SENTINEL + SCOUT sur le même événement font monter le score de fiabilité composite

**Pipeline global :**
- [ ] En cas de panne de l'Edge Function d'ingestion, l'utilisateur ne reçoit pas de notification erronée (fail silent)
- [ ] Les logs de `source_ingestion_logs` enregistrent chaque run avec le statut (succès / erreur) pour détecter les pannes silencieuses

---

## 16. Risques & Mitigations

| # | Risque | Probabilité | Impact | Mitigation |
|---|--------|-------------|--------|-----------|
| R1 | ACLED refuse l'accès commercial | Moyen | Élevé | Contacter ACLED dès la Phase 0. Backup : UCDP (qualité similaire). Ne pas coder autour d'ACLED avant confirmation. |
| R2 | Fausses alertes provoquant la panique | Moyen | Très élevé | Mode Sage 80% par défaut, délai 15min pour niveaux 2-1, SENTINEL ne peut pas déclencher niveau 1, formulation "information" et non "alerte" |
| R3 | OSRM VPS surchargé en cas de crise réelle | Faible | Élevé | Scale up VPS si pic détecté, ou cache des itinéraires les plus communs, ou limitation du nombre de recalculs/utilisateur/heure |
| R4 | App perçue comme anxiogène | Élevé | Moyen | Design UX rassurant en DEFCON 5, valeur quotidienne (kit, éducation), onboarding expliquant le mode sage |
| R5 | *(v2 Flutter)* App Store rejette l'app | Moyen | Élevé | Respecter les guidelines Apple sur les apps d'urgence, éviter formulations alarmistes, tester en TestFlight avant soumission officielle, prévoir 2 semaines de buffer. Non applicable à la v1 PWA (pas de review). |
| R6 | Complexité du NLP SENTINEL sous-estimée | Élevé | Moyen | Pipeline découpé en sous-étapes indépendantes. Si une étape bloque, elle peut être mise en standby sans bloquer le reste. SCOUT seul suffit pour le MVP. |
| R7 | Canaux Telegram OSINT diffusent de la désinformation | Élevé | Élevé | Whitelist strict (validation manuelle de chaque canal), score plafonné à 70 pour les sources Telegram, badge "source communautaire" visible |
| R8 | Twitter/X trop cher pour le MVP | Certaine | Faible | Exclu du MVP. Sources RSS + Telegram + Mastodon suffisent pour le signal early warning. |
| R9 | Utilisateur oublie son mot de passe → perte des données (v1.1 chiffrement) | Moyen | Moyen | Documentation claire dans l'app, recommandation de gestionnaire de mots de passe. Uniquement impactant si chiffrement client activé (v1.1). |
| R10 | Backlash sur le modèle freemium | Faible | Faible | Stratégie assumée et défendable. Le calcul du plan de fuite reste gratuit. Seule la sauvegarde offline est premium. |

---

## 17. Prochaines étapes immédiates

Actions à lancer cette semaine (dans cet ordre) :

**Toi :**

1. **[BLOQUANT]** Envoyer un email à ACLED (acleddata.com/contact) pour clarifier les conditions d'accès pour une app mobile commerciale. Sans réponse claire, planifier UCDP comme source principale.

2. **[CRITIQUE]** Vérifier la disponibilité du nom EVAQ :
   - Domaines : evaq.com / evaq.fr / evaq.app (via registrar Gandi ou OVH)
   - Réseaux sociaux : @evaqapp ou @evaq_app (Instagram, TikTok, X)
   - Marque : recherche INPI (inpi.fr) + EUIPO (euipo.europa.eu)
   - App Store et Google Play : à vérifier mais non bloquant pour la v1 web

3. **[TECHNIQUE]** Tester l'API GDACS manuellement :
   ```bash
   curl "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ,FL,TC,VO,DR,WF&fromDate=2026-03-15&toDate=2026-03-22"
   ```
   Vérifier la structure JSON, les champs disponibles, la fréquence de mise à jour.

4. **[TECHNIQUE]** Installer l'environnement de développement :
   - Node.js 20 LTS + npm
   - Créer le projet Next.js 15 (`npx create-next-app@latest evaq --typescript --tailwind --app`)
   - Créer projet Supabase (tier gratuit — supabase.com)
   - Générer les clés VAPID pour les notifications Web Push (`npx web-push generate-vapid-keys`)

5. **[BUDGET]** Contacter un avocat spécialisé droit du numérique pour la rédaction des CGU. Demander un devis.

**Yévana :**

6. Télécharger et organiser les documents sources :
   - Guide "Tous Responsables" (SGDSN, novembre 2025) — sgdsn.gouv.fr
   - Kit d'urgence 72h — ecologie.gouv.fr
   - CataKit — croix-rouge.fr
   - Recommandations ICRP nucléaire — icrp.org

7. Créer un tableur de la base de connaissances survie avec les colonnes : threat_type, category, title, content, source, priority.

8. Benchmark UX : documenter les flows de 3 apps (FEMA App, Offline Survival Manual, HazAdapt) avec screenshots.

---

## Annexes

### A. Canaux Telegram OSINT — Whitelist initiale à valider

*Ces canaux sont à valider manuellement avant intégration. Liste non-exhaustive, à compléter.*

- Intel Slava Z (actualités conflits — à évaluer neutralité)
- OSINTdefender
- War Monitor
- Bellingcat (investigations OSINT)
- The Intel Crab
- Ukraine War Map (si pertinent selon actualité)

*Critères de validation : ancienneté du canal, nombre d'abonnés, ratio actualités vérifiées vs désinformation, citations par des médias établis.*

### B. Ressources techniques

> Le dictionnaire de mots-clés SENTINEL, la structure de l'API GDACS et les références techniques sont documentés dans des fichiers dédiés dans `_context/` pour ne pas alourdir ce brief.
> Voir : `_context/SENTINEL_dictionnaire.md`, `_context/API_notes.md` (à créer lors de la Phase 1).

- Flutter : flutter.dev
- Supabase : supabase.com/docs
- flutter_map : docs.fleaflet.dev
- FMTC : fmtc.jaffaketchup.dev
- h3_dart : pub.dev/packages/h3_dart
- OSRM API : project-osrm.org/docs
- GDACS API : gdacs.org/gdacsapi
- GeoNames : geonames.org/export
- RevenueCat Flutter : docs.revenuecat.com/docs/flutter
- H3 Geospatial Indexing : h3geo.org
