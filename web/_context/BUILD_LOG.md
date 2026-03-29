# EVAQ — Build Log

Progression du build technique. Mis a jour a chaque commit significatif.

---

## [2026-03-23] v0.1.0 — Phase 0 : Setup complet

**Commit :** `d1a3199` sur `main`
**Deploye :** https://evaq-web.vercel.app/
**Repo :** https://github.com/TchikiBalianos/evaq-web (prive)

### Ce qui est en place
- Next.js 16 + TypeScript + Tailwind v4 (design system DEFCON 1-5)
- PWA : manifest.ts natif + service worker (push + cache offline)
- Supabase : 9 tables + RLS + trigger auto-inscription
- Auth : email/password via Server Actions (signUp/signIn/signOut)
- Proxy auth (Next.js 16) : protege les routes /dashboard, /alertes, /plan-fuite, /kit
- Dark/light/system theme toggle (localStorage, anti-flash script)
- CI/CD : GitHub Actions (tsc + lint + build) + Vercel auto-deploy
- Cles VAPID generees

---

## [2026-03-24] v0.2.0–v0.4.0 — Phase 1 : Alertes GDACS + i18n + carte + tests

- Ingestion GDACS batch (100 alertes, dedup, cron 6h UTC)
- DEFCON client-side (haversine, scoring v2 par type d'evenement)
- Dashboard connecte (DEFCON temps reel + top 5)
- Page alertes (mode Sage/Expert, tri, detail expandable)
- Mini-carte MapLibre (OpenFreeMap, cercle d'impact GeoJSON)
- Notifications push (cron send-push 7h UTC)
- i18n FR/EN (200+ cles, traduction titres alertes)
- Indicateur geolocalisation (reverse geocoding Nominatim)
- Icones PWA (sharp SVG->PNG)
- 26 tests unitaires DEFCON
- Plan de tests fonctionnels (7 modules, 35 cas, 25/25 passes)

---

## [2026-03-24] v0.5.0 — Phase 2 : Plan de fuite MapLibre + OSRM

- Carte plein ecran MapLibre avec zones de menace (GeoJSON FeatureCollection)
- Epicentres clickables avec popups traduits
- Routing OSRM : proxy `/api/route`, 3 routes alternatives, selection
- Evacuation intelligente : 10 strategies par type de menace + vent temps reel
- API `/api/wind` (proxy Open-Meteo)
- Sauvegarde plans localStorage (max 3)
- Cache offline tuiles MapLibre (Workbox)
- 26 tests evacuation-logic + 12 tests scenarios

---

## [2026-03-24] v0.6.0 — Phase 3 : Kit de survie

- Base de connaissances : 30+ items recommandes (SGDSN, Croix-Rouge, ORSEC)
- UI inventaire CRUD (6 categories, formulaire ajout/modif/suppression)
- Score de preparation 0-100% avec barre de progression
- Recommandations contextuelles (menace-specifique : iode, masques, etc.)
- Fiches conseil "Que faire ?" (10 types de menace, FR/EN)
- Detection expiration items (jaune <30j, rouge expire)
- 15 tests unitaires kit-knowledge

---

## [2026-03-24] v0.7.0 — Phase 4 : Premium & Stripe

- Stripe SDK integre (init lazy pour eviter crash build sans cle)
- API `/api/checkout` (sessions checkout packs + abonnements)
- API `/api/webhook` (payment success -> update BDD)
- API `/api/portal` (portail client self-service)
- Page `/premium` (4 packs 1.99-4.99 EUR + 2 abonnements)
- Systeme paywall (isPremium, hasPack, limites free/pack/premium)
- Cron `/api/cron/kit-expiry` (rappels expiration 7j, daily 8h UTC)
- 10 tests unitaires paywall

---

## [2026-03-25] v0.8.0 — Phase 1b/1c : ReliefWeb + NLP SENTINEL

**Commits :** `c74e501`, `6a171df` sur `main`

### ReliefWeb (conflits armes, UN OCHA)
- Route `/api/cron/ingest-reliefweb` (daily 6h30 UTC)
- Fetch disasters + reports (armed-conflict, epidemic, technological-disaster...)
- 37 pays geolocalises (capitales)
- Dedup par reliefweb_id, score_fiabilite 85

### NLP SENTINEL (RSS scraping)
- Route `/api/cron/ingest-sentinel` (daily 6h45 UTC)
- 5 flux RSS : Le Monde, France24, BBC, Al Jazeera, NYT
- 7 dictionnaires de menaces : nuclear, conflict_escalation, terrorism, shortage, pandemic, chemical, civil_unrest
- Matching case + accent insensitif (NFD normalization)
- 41 patterns pays/villes pour geolocalisation
- score_fiabilite 60 (RSS moins fiable que sources officielles)

### Corrections
- Bug kit : ajout `user_id` manquant dans l'INSERT
- Nouveau type UNREST (DEFCON, i18n, fiche conseil)
- Fix ESLint react-hooks/set-state-in-effect (8 fichiers)
- Fix Deno Edge Function type-check (cast props to String)

---

## [2026-03-25] v0.9.0 — UX/UI Improvements

**Commit :** `b2c72db`, `23c10a4` sur `main`

### Kit de survie — refonte UX
- Score annulaire SVG (80px, animation stroke-dashoffset)
- Placeholders contextuels par categorie (exemples FR/EN)
- Toggle date d'expiration (afficher/masquer, auto-detect food/medical)
- Animations CSS : slideUp items, slideInBottom form, FAB entree
- Suppression avec shake + toast "Annuler" (2s grace period)
- Bordure gauche coloree par categorie
- Point rouge pulsant sur banniere items manquants
- Icone agrandie + bounce sur categories vides
- Transition opacity au changement de categorie

### Alertes
- Mode Expert par defaut (toutes les alertes)
- Mode Sage en option (filtre fiabilite > 80%)

### Plan de fuite — details itineraire
- Module `route-stops.ts` : recherche POI via Overpass API (OpenStreetMap)
- Stations-service (avec types de carburant : Diesel, SP95, SP98, GPL)
- Bornes electriques (Type 2, CHAdeMO, CCS)
- Aires de repos, peages, hopitaux, supermarches
- Marqueurs POI sur la carte avec popups
- Panneau scrollable tri par distance depuis le depart
- Clic sur un arret = fly to sur la carte

### API Routes (total)
| Route | Cron | Description |
|-------|------|-------------|
| /api/cron/ingest-gdacs | 6h UTC | Catastrophes naturelles (GDACS) |
| /api/cron/ingest-reliefweb | 6h30 UTC | Conflits armes (ReliefWeb) |
| /api/cron/ingest-sentinel | 6h45 UTC | Actualites menaces (RSS) |
| /api/cron/send-push | 7h UTC | Notifications push DEFCON 3+ |
| /api/cron/kit-expiry | 8h UTC | Rappels expiration kit |
| /api/route | - | Proxy OSRM (3 routes) |
| /api/wind | - | Proxy Open-Meteo (vent) |
| /api/checkout | - | Stripe checkout session |
| /api/webhook | - | Stripe webhook handler |
| /api/portal | - | Stripe billing portal |

### Tests (104 total, 8 suites)
| Suite | Tests |
|-------|-------|
| defcon | 26 |
| evacuation-logic | 14 |
| scenarios | 12 |
| kit-knowledge | 15 |
| paywall | 10 |
| threat-guides | 4+ |
| (total) | 104 |
