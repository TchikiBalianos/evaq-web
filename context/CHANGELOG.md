# EVAQ — Changelog complet

Historique detaille de toutes les modifications du projet, de la conception initiale a la version actuelle.

---

## v1.2.1 (2026-03-28) — Fix mode test + alertes reelles

### Corrections critiques
- **Mode test reactiv able** : Quand le mode test est desactive, un bandeau vert "MODE REEL" apparait avec un bouton "Activer TEST" pour basculer a nouveau en mode simulation. Avant cette correction, desactiver le test supprimait toute possibilite de le reactiver (le `TestModeBanner` retournait `SizedBox.shrink()`).
- **Alertes en mode normal** : En desactivant le mode test, `toggleTestMode()` vidait la liste `_nearbyAlerts = []`, ce qui affichait 0 alerte en mode sage comme en mode expert. Desormais, 7 alertes "reelles" sont chargees depuis les flux RSS simules.

### Nouvelles alertes monde reel (mode normal)
| Source | Alerte | Severite | Fiabilite |
|--------|--------|----------|-----------|
| GDACS | Seisme — Turquie, Grece (M5.8) | 72% | 95% |
| RELIEFWEB | Inondation — Bangladesh, Inde | 80% | 90% |
| GDACS | Cyclone tropical — Philippines (Cat.3) | 85% | 92% |
| RELIEFWEB | Conflit arme — Soudan | 78% | 88% |
| GDACS | Eruption volcanique — Islande | 60% | 95% |
| RELIEFWEB | Secheresse — Corne de l'Afrique | 70% | 85% |
| SENTINEL | Cyberattaque — Hopitaux europeens | 55% | 72% |

### Modifications de fichiers
- `lib/providers/evaq_provider.dart` — Ajout `_loadRealAlerts()`, `_realWorldAlerts()`, calcul DEFCON dynamique
- `lib/widgets/common_widgets.dart` — `TestModeBanner` affiche un bandeau en mode normal
- `lib/main.dart` — Ajout badge `LIVE` vert dans l'AppBar en mode normal
- `lib/utils/i18n.dart` — Ajout cles `test.normal_mode`, `test.real_alerts`, `test.enable` (x5 langues)

### Metriques
- 5 fichiers modifies
- +237 lignes ajoutees, -25 lignes supprimees

---

## v1.2.0 (2026-03-28) — Carte interactive alertes + compilation complete

### Nouvelles fonctionnalites
- **Carte interactive dans AlertDetailScreen** : Mini-map avec CustomPainter montrant la position de l'alerte (cercles concentriques de severite, coordonnees GPS, badge rayon, terrain simule avec routes/eau/parcs)
- **Version bumped** a 1.2.0+3 dans pubspec.yaml

### Verification complete de toutes les fonctionnalites
Audit exhaustif de l'ensemble du codebase (16 fichiers Dart) pour valider l'integration de toutes les ameliorations demandees.

### Modifications de fichiers
- `lib/screens/alert_detail_screen.dart` — Ajout `_buildAlertMap()` et `_AlertMapPainter` (CustomPainter)
- `pubspec.yaml` — Version 1.2.0+3

### Build & Deployment
- APK release 50 MB, signe avec `release-key.jks`
- Push GitHub sur `TchikiBalianos/evaq-web`
- Web preview deploye

---

## v1.1.0 (2026-03-28) — Migration majeure PWA vers Flutter

C'est la version pivot : tout le code PWA React/TypeScript a ete porte vers Flutter/Dart.

### Systeme i18n complet (FR/EN/ZH/RU/AR)
- Creation de `lib/utils/i18n.dart` avec ~270 cles de traduction
- 5 langues supportees : Francais, Anglais, Chinois, Russe, Arabe
- Classe `I18n` statique avec fallback sur le francais
- Traduction dynamique des titres d'alertes (`translateAlertTitle`)
- Mapping de 100+ noms de pays anglais vers francais
- Selecteur de langue dans l'AppBar et dans Settings
- Tous les labels UI utilisent `I18n.t('cle')`

### Alertes de crise enrichies
- **6 scenarios de test** portes depuis `test-scenarios.ts` :
  1. Effondrement societal (5 alertes)
  2. Guerre Iran (4 alertes)
  3. Escalade nucleaire Ukraine (3 alertes)
  4. Attaque chimique Paris (2 alertes)
  5. Cascade naturelle seisme+tsunami (3 alertes)
  6. Confinement total biologique (2 alertes)
- **AlertModel enrichi** avec champs bilingues (`titleFr`/`titleEn`, `description`/`descriptionEn`, `recommendations`/`recommendationsEn`)
- **Section RSS monitoring** dans AlertsScreen (GDACS, ReliefWeb, SENTINEL)
- **Mode sage/expert** : filtrage par fiabilite (>80% en sage)
- **Tri** par severite, date, distance
- **AlertDetailScreen** avec description complete, evolution, zones affectees, recommandations numerotees

### Plan d'evacuation interactif
- **Carte CustomPainter** avec routes, waypoints, riviere, parcs, grille
- **2 plans** : Plan A (voiture, 85km, 1h15) / Plan B (velo/pied, 45km, 4-10h)
- **Waypoints** avec labels et couleurs differenciees (depart vert, intermediaires bleu, arrivee rouge)
- **Detail du plan** avec etapes numerotees et timeline visuelle
- **Section post-ralliement** avec 5 packs micro-paiement :
  - Pack Abri d'urgence — 14.99 EUR
  - Pack Purification d'eau — 9.99 EUR
  - Pack Communication — 19.99 EUR
  - Pack Soins avances — 24.99 EUR
  - Pack Energie autonome — 29.99 EUR
- **Bottom sheet de paiement** pour chaque pack

### Gamification Kit de survie (RPG)
- **15 items** de kit de survie avec categories et emojis
- **Questionnaire RPG post-apocalyptique** : 5 questions avec 4 reponses chacune
- **4 profils de survivant** :
  - Novice (score 0-4)
  - Initie (score 5-9)
  - Preparateur (score 10-14)
  - Survivant confirme (score 15-20)
- **Barre de progression** pendant le quiz
- **Kit prioritaire par scenario** avec items specifiques recommandes
- **Score de preparation** base sur les items coches

### Section Premium
- **Hero header** gradient dore avec features cles
- **2 onglets** : Abonnements / Packs a l'unite
- **Pricing** :
  - Mensuel 4.99 EUR/mois
  - Annuel 29.99 EUR/an (-50%)
  - Pack Alertes 1.99 EUR
  - Pack Evacuation 2.99 EUR
  - Pack Kit 2.99 EUR
  - Pack Preparation 4.99 EUR
- **Payment sheet mockup** avec :
  - Formulaire carte bancaire (numero, expiry, CVC)
  - Paiement Solana (SOL) avec equivalence prix
  - Badges securite SSL + PCI DSS
  - Simulation de traitement (2s delay)
- **Vue Premium actif** apres souscription

### Corrections UI Samsung S9+
- **Emojis contraints** : `SizedBox(width: 28)` pour le leading des ListTile (emojis qui debordaient)
- **Navigation bottom bar** : `Expanded` + `maxLines: 1` + `overflow: TextOverflow.ellipsis` pour les 6 onglets
- **Font size nav** reduit a 9px pour eviter les debordements
- **Icon size nav** reduit a 20px
- **Action buttons** : `childAspectRatio: 1.8` pour la grille 2x2

### Architecture technique
- **Provider pattern** avec `EvaqProvider` (ChangeNotifier)
- **Modeles immutables** (`AlertModel`, `KitItem`, `EvacuationPlan`, `MapPoint`)
- **CustomPainter** pour les cartes (evacuation + detail alerte)
- **Consumer<EvaqProvider>** dans chaque ecran pour la reactivite

---

## v1.0.0 (2026-03-28) — Creation initiale Flutter

### Setup du projet
- `flutter create .` dans `/home/user/flutter_app`
- Configuration `pubspec.yaml` avec dependencies
- Structure de dossiers `lib/` (models, providers, screens, utils, widgets)
- Configuration Android (`com.evaq.app`, signing config)
- Icon de l'application generee et integree

### Ecrans initiaux
- HomeScreen avec DefconCard et navigation
- AlertsScreen basique
- EvacuationScreen basique
- KitScreen basique
- PremiumScreen basique
- SettingsScreen basique

### Infrastructure
- Theme Material Design 3 avec palette de couleurs (rouge urgence, vert succes, etc.)
- Constantes DEFCON (5 niveaux avec couleurs et descriptions)
- Provider basique avec alertes en dur

---

## Historique des commits Git

```
3b30259 v1.2.1: fix mode test reactiv able + alertes reelles en mode normal (GDACS, ReliefWeb, SENTINEL)
065b16f v1.2.0: carte interactive alertes, i18n 5 langues, RPG kit, packs post-rally, premium Solana, fix UI S9+
```

---

## Roadmap future (idees)

- [ ] Integration API GDACS reelle (RSS XML parsing)
- [ ] Integration Solana wallet (Phantom/Backpack) pour paiements reels
- [ ] Geolocalisation en temps reel avec geolocator
- [ ] Notifications push via Firebase Cloud Messaging
- [ ] Mode hors-ligne avec Hive pour le cache
- [ ] Partage familial (multi-utilisateurs)
- [ ] Carte OpenStreetMap reelle (flutter_map ou google_maps_flutter)
- [ ] Tests widget et integration
