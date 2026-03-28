# Migration PWA vers Flutter — Log detaille

Ce document retrace en detail le processus complet de migration de l'application EVAQ depuis une Progressive Web App (PWA) React/TypeScript vers une application mobile Flutter/Dart native.

---

## 1. Contexte et motivations

### L'application PWA originale
EVAQ existait initialement comme une **PWA React** deployee sur le web :

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js (React 18+) |
| Langage | TypeScript |
| Base de donnees | Supabase (PostgreSQL) |
| Authentification | Supabase Auth |
| i18n | Module custom `i18n.tsx` |
| Styling | Tailwind CSS |
| State | React Context + hooks |
| Hebergement | Vercel |

### Pourquoi migrer vers Flutter ?
1. **Solana Mobile dApp Store** : Le Seeker (telephone Solana) requiert une app native Android (APK/AAB), pas une PWA
2. **Performance native** : Animations fluides 60fps, acces direct aux API Android
3. **Distribution** : Publication sur le dApp Store + Google Play Store potentiellement
4. **Experience utilisateur** : Navigation native, gestures, notifications push reelles
5. **Monetisation** : Integration Solana wallet native pour les micro-paiements

---

## 2. Inventaire des fichiers source PWA

### Fichiers analyses avant migration

| Fichier PWA | Contenu | Lignes approx. |
|-------------|---------|----------------|
| `i18n.tsx` | Dictionnaires FR/EN complets, fonction de traduction | ~2000 |
| `sentinel-rules.ts` | Regles de detection OSINT (CONFLICT, NUCLEAR, CHEMICAL, etc.) | ~300 |
| `test-scenarios.ts` | 6 scenarios de crise simules avec alertes | ~400 |
| `page.tsx` (Kit) | Inventaire kit de survie, CRUD Supabase | ~350 |
| `page.tsx` (Premium) | Pricing, packs, checkout Stripe/Solana | ~300 |
| `page.tsx` (Alerts) | Liste d'alertes, filtres, tri | ~250 |
| `page.tsx` (Evacuation) | Plans d'evacuation, carte | ~300 |
| `page.tsx` (Settings) | Parametres utilisateur | ~200 |
| `page.tsx` (Home) | Dashboard DEFCON | ~250 |
| **Total** | | **~4350 lignes TypeScript** |

### Donnees extraites
- **250+ cles de traduction** FR/EN depuis `i18n.tsx`
- **6 scenarios de test** avec 19 alertes totales depuis `test-scenarios.ts`
- **7 regles SENTINEL** (CONFLICT, NUCLEAR, CHEMICAL, SHORTAGE, HEALTH, EQ, CYBER)
- **Pricing complet** (abonnements + packs unitaires)
- **15 items de kit** avec categories
- **2 plans d'evacuation** avec coordonnees GPS

---

## 3. Strategie de migration

### Approche choisie : Reecriture complete guidee par les sources

Plutot qu'un portage mecanique ligne par ligne, la migration a suivi une approche de **reecriture intelligente** :

1. **Extraction des donnees** : Extraire toutes les donnees structurees (alertes, scenarios, traductions, items)
2. **Modelisation Dart** : Creer des modeles Dart propres adaptes au pattern Flutter
3. **Architecture Provider** : Remplacer React Context par Provider (ChangeNotifier)
4. **UI native Flutter** : Reconstruire chaque ecran avec des widgets Flutter natifs
5. **Enrichissement** : Ajouter des fonctionnalites impossibles en PWA (CustomPainter, animations natives)

### Ce qui a ete conserve a l'identique
- Structure des donnees d'alertes (champs, valeurs, severites)
- Scenarios de test (6 scenarios, memes alertes)
- Dictionnaires de traduction (cles et valeurs FR/EN)
- Pricing et features Premium
- Items du kit de survie
- Plans d'evacuation avec coordonnees

### Ce qui a ete transforme
- React Components → Flutter Widgets (StatelessWidget / StatefulWidget)
- React Context → Provider + ChangeNotifier
- CSS/Tailwind → Flutter decoration (BoxDecoration, EdgeInsets, TextStyle)
- Supabase CRUD → Donnees en memoire (Provider)
- HTML Canvas → Flutter CustomPainter
- TypeScript interfaces → Dart classes
- React Router → Flutter Navigator
- Stripe/API checkout → Bottom sheet mockup

### Ce qui a ete ajoute (nouveau dans Flutter)
- Traductions Chinois, Russe, Arabe (3 langues supplementaires)
- Carte interactive CustomPainter dans le detail d'alerte
- Questionnaire RPG de survie gamifie
- Section post-ralliement avec micro-paiements
- Mode sage/expert pour le filtrage des alertes
- Alertes monde reel en mode normal (7 alertes GDACS/ReliefWeb/SENTINEL)
- Badge LIVE/TEST dans l'AppBar
- Bandeau de mode avec toggle bidirectionnel

---

## 4. Mapping detaille des transformations

### 4.1 Composants React → Widgets Flutter

```
PWA (React/TSX)                    Flutter (Dart)
──────────────────────────────     ──────────────────────────────
<AlertCard alert={a} />        →   AlertCard(alert: a, timeAgo: t)
<DefconBadge level={l} />      →   DefconCard(level: l)
<KitPage />                    →   KitScreen() extends StatefulWidget
<PremiumPage />                →   PremiumScreen() extends StatefulWidget
<EvacuationPage />             →   EvacuationScreen() extends StatefulWidget
<SettingsPage />               →   SettingsScreen() extends StatelessWidget
<AlertsPage />                 →   AlertsScreen() extends StatefulWidget
<HomePage />                   →   HomeScreen() extends StatelessWidget
<TestModeBanner />             →   TestModeBanner() extends StatelessWidget
Layout (tabs + router)         →   EvaqShell() avec BottomNavigationBar
```

### 4.2 State management

```
PWA (React)                        Flutter (Dart)
──────────────────────────────     ──────────────────────────────
const [alerts, setAlerts]      →   List<AlertModel> _nearbyAlerts
  = useState([])                   get nearbyAlerts => _nearbyAlerts
                                   notifyListeners()

useContext(I18nContext)         →   I18n.t('key') (classe statique)

useEffect(() => {              →   EvaqProvider() {
  loadAlerts()                     _loadScenarioAlerts()
}, [])                             _initKit()
                                   _initEvacuationPlans()
                                 }

<I18nProvider locale={l}>      →   EvaqProvider.setLocale(l)
                                   I18n.setLocale(l)
```

### 4.3 Styling CSS → Flutter

```
Tailwind/CSS                       Flutter
──────────────────────────────     ──────────────────────────────
className="bg-red-600"         →   color: AppColors.primary
className="rounded-xl p-4"    →   decoration: BoxDecoration(
                                     borderRadius: BorderRadius.circular(16),
                                   )
                                   padding: EdgeInsets.all(16)

className="text-sm font-bold"  →   TextStyle(
                                     fontSize: 14,
                                     fontWeight: FontWeight.w700,
                                   )

className="flex items-center"  →   Row(children: [...])
className="flex flex-col"      →   Column(children: [...])
className="grid grid-cols-2"   →   GridView.count(crossAxisCount: 2)
className="overflow-y-auto"    →   SingleChildScrollView()
className="opacity-50"         →   .withValues(alpha: 0.5)

@media (max-width: 375px)      →   MediaQuery.of(context).size.width
                                   Expanded() + maxLines + overflow
```

### 4.4 i18n

```
PWA (i18n.tsx)                     Flutter (i18n.dart)
──────────────────────────────     ──────────────────────────────
const t = useTranslation()     →   I18n.t('key')
t('nav.home')                  →   I18n.t('nav.home')

const dictionaries = {         →   static final Map<String, Map<String, String>>
  fr: { ... },                     _dictionaries = {
  en: { ... },                       AppLocale.fr: { ... },
}                                    AppLocale.en: { ... },
                                     AppLocale.zh: { ... },  // NOUVEAU
                                     AppLocale.ru: { ... },  // NOUVEAU
                                     AppLocale.ar: { ... },  // NOUVEAU
                                   }

translateAlertTitle(title)     →   I18n.translateAlertTitle(title, eventType)
countryNamesFr = { ... }       →   static const Map<String, String> _countryNamesFr
```

### 4.5 Donnees et modeles

```
TypeScript (interfaces)            Dart (classes)
──────────────────────────────     ──────────────────────────────
interface SimulatedAlert {     →   class AlertModel {
  id: string                       final String id;
  title: string                    final String titleFr;
  severity_score: number           final String titleEn;
  score_fiabilite: number          final int severity;
  lat: number                      final int scoreFiabilite;
  ...                              final double latitude;
}                                  ...
                                   String get title =>
                                     I18n.locale == 'en' ? titleEn : titleFr;
                                 }

interface TestScenario {       →   static final List<Map<String, dynamic>>
  id: string                       testScenarios = [
  name: string                       { 'id': '...', 'name_fr': '...', ... }
  alerts: SimulatedAlert[]         ]
}                                  void _loadScenarioAlerts() { switch... }
```

### 4.6 Carte/Map

```
PWA (HTML Canvas)                  Flutter (CustomPainter)
──────────────────────────────     ──────────────────────────────
<canvas ref={canvasRef} />     →   CustomPaint(
ctx.beginPath()                      painter: _MapPainter(plan: plan),
ctx.arc(x, y, r, 0, 2*PI)           size: Size(width, 240),
ctx.fillStyle = '#...'             )
ctx.fill()
ctx.lineTo(x, y)              →   canvas.drawLine(p1, p2, paint)
ctx.stroke()                   →   canvas.drawPath(path, paint)
                               →   canvas.drawCircle(center, r, paint)
                               →   canvas.drawRRect(rrect, paint)
```

---

## 5. Problemes rencontres et solutions

### 5.1 Debordement UI sur Samsung S9+
**Probleme** : Les emojis dans les ListTile et les labels de la barre de navigation debordaient des limites de leur conteneur sur les ecrans 360px de large.

**Cause** : Les emojis ont une largeur variable selon le systeme, et Flutter ne les contraint pas automatiquement dans un `leading` de ListTile.

**Solution** :
```dart
// Avant (debordement)
leading: Text(item.icon, style: TextStyle(fontSize: 20))

// Apres (contraint)
leading: SizedBox(width: 28, child: Text(item.icon, style: TextStyle(fontSize: 20)))
```

Pour la navigation :
```dart
// Avant (debordement)
Column(children: [Icon(...), Text(label)])

// Apres (contraint avec Expanded)
Expanded(child: Column(children: [
  Icon(icon, size: 20),
  Text(label, fontSize: 9, maxLines: 1, overflow: TextOverflow.ellipsis),
]))
```

### 5.2 Pas d'alertes en mode normal
**Probleme** : Desactiver le mode test mettait `_nearbyAlerts = []`, aucune alerte visible.

**Cause** : Le toggle ne chargeait aucune donnee alternative.

**Solution** : Creation de `_realWorldAlerts()` avec 7 alertes basees sur des evenements reels + calcul DEFCON automatique.

### 5.3 Mode test non reactivable
**Probleme** : Le `TestModeBanner` retournait `SizedBox.shrink()` en mode normal — aucun UI pour revenir en mode test.

**Solution** : Le bandeau affiche maintenant un mode "REEL" vert avec bouton "Activer TEST" + badge "LIVE" dans l'AppBar.

### 5.4 Supabase supprime
**Probleme** : La PWA utilisait Supabase pour le CRUD du kit et les donnees utilisateur. Flutter ne peut pas facilement integrer Supabase cote client sans configuration Firebase.

**Solution** : Toutes les donnees sont gerees en memoire dans le `EvaqProvider`. Le kit, les alertes, les plans sont initialises dans le constructeur. Pas de persistence (prevu pour v2 avec Hive ou SharedPreferences).

### 5.5 Checkout Stripe → Mockup
**Probleme** : La PWA appelait `/api/checkout` (Stripe) et `/api/portal`. Pas de backend disponible en Flutter.

**Solution** : Bottom sheet de paiement avec formulaire carte pre-rempli et option Solana. Simulation de traitement (2s delay + callback success).

---

## 6. Metriques de migration

| Metrique | PWA (React) | Flutter (Dart) |
|----------|-------------|----------------|
| Lignes de code | ~4 350 | ~4 565 |
| Fichiers source | ~10 (pages + composants) | 16 (dart) |
| Langues supportees | 2 (FR, EN) | 5 (FR, EN, ZH, RU, AR) |
| Cles de traduction | ~200 | ~270 |
| Scenarios de test | 6 | 6 |
| Alertes test | 19 | 19 |
| Alertes reelles | 0 | 7 |
| Framework UI | React + Tailwind | Material Design 3 |
| State management | React Context | Provider |
| Persistence | Supabase | En memoire (Provider) |
| Map rendering | HTML Canvas | CustomPainter |
| Paiement | Stripe API | Mockup Bottom Sheet |
| Build output | PWA (web) | APK 52MB + Web preview |
| Temps de migration | — | ~1 session complete |

---

## 7. Fichiers crees pendant la migration

### Ordre chronologique de creation

1. `lib/utils/constants.dart` — Couleurs et niveaux DEFCON
2. `lib/models/alert_model.dart` — Modele d'alerte bilingue
3. `lib/models/kit_model.dart` — Modeles KitItem, EvacuationPlan, MapPoint
4. `lib/utils/i18n.dart` — Systeme i18n complet (680 lignes)
5. `lib/providers/evaq_provider.dart` — Provider central (563 lignes)
6. `lib/widgets/defcon_card.dart` — Widget carte DEFCON
7. `lib/widgets/alert_card.dart` — Widget carte d'alerte
8. `lib/widgets/common_widgets.dart` — Widgets reutilisables
9. `lib/screens/home_screen.dart` — Dashboard principal
10. `lib/screens/alerts_screen.dart` — Liste des alertes + RSS
11. `lib/screens/alert_detail_screen.dart` — Detail + carte interactive
12. `lib/screens/evacuation_screen.dart` — Plans + carte + packs
13. `lib/screens/kit_screen.dart` — Kit + RPG gamifie
14. `lib/screens/premium_screen.dart` — Premium + paiement
15. `lib/screens/settings_screen.dart` — Parametres + langue
16. `lib/main.dart` — Point d'entree + shell navigation

---

## 8. Lecons apprises

1. **Provider est plus simple que React Context** pour une app de cette taille. Un seul `ChangeNotifier` suffit.
2. **CustomPainter** est tres puissant pour les cartes stylisees sans dependance externe.
3. **Les emojis en Flutter** sont plus problematiques qu'en CSS pour le sizing — toujours les contraindre dans un `SizedBox`.
4. **Flutter web** est excellent pour le preview mais la cible reelle reste Android APK.
5. **La migration n'est pas 1:1** — certaines choses sont plus faciles en Flutter (animations, navigation), d'autres plus complexes (i18n sans package, cartes sans Google Maps).
6. **L'architecture data-first** (extraire les donnees d'abord, puis construire l'UI) est la bonne approche pour une migration.

---

## 9. Chronologie detaillee de la migration

La migration s'est deroulee en une seule session intensive, structuree en phases :

### Phase 1 : Analyse de la PWA source
- **Entree** : Fichiers `i18n.tsx`, `test-scenarios.ts`, `sentinel-rules.ts`, `page.tsx` (x6)
- **Sortie** : Inventaire complet des donnees, dictionnaires, scenarios, interfaces
- **Duree estimee** : ~15% du temps total
- **Action principale** : Lecture et extraction systematique de toutes les donnees structurees

### Phase 2 : Architecture Flutter
- **Creation du projet** : `flutter create .` dans `/home/user/flutter_app`
- **Configuration** : `pubspec.yaml`, dependencies, assets
- **Theme** : Material Design 3 avec palette de couleurs custom (rouge urgence)
- **Duree estimee** : ~10% du temps total

### Phase 3 : Couche de donnees
- **Modeles** : `AlertModel`, `KitItem`, `EvacuationPlan`, `MapPoint`
- **Constants** : `AppColors`, `DefconLevel`
- **i18n** : Classe statique `I18n` avec 680 lignes, 5 langues, mapping pays
- **Duree estimee** : ~20% du temps total
- **Particularite** : 3 langues supplementaires ajoutees (ZH, RU, AR) vs la PWA (FR, EN seulement)

### Phase 4 : Provider et logique metier
- **EvaqProvider** : 563 lignes, tout l'etat de l'app
- **6 scenarios** portes depuis `test-scenarios.ts` avec 19 alertes
- **15 items de kit** avec categories et emojis
- **2 plans d'evacuation** avec waypoints GPS
- **Duree estimee** : ~15% du temps total

### Phase 5 : Ecrans et widgets
- **6 ecrans** + 1 ecran de detail (AlertDetailScreen)
- **3 widgets reutilisables** : AlertCard, DefconCard, CommonWidgets
- **CustomPainter** pour les cartes (evacuation + detail alerte)
- **Duree estimee** : ~30% du temps total (la plus longue)
- **Defis** : Reproduction fidele du layout PWA en Flutter, contraintes S9+

### Phase 6 : Integration et corrections
- **Navigation** : BottomNavigationBar 6 onglets + push/pop pour le detail
- **Corrections S9+** : Emojis constraintes, nav overflow, font sizes
- **Mode test/normal** : Toggle bidirectionnel + alertes reelles
- **Build** : APK release signe + Web preview
- **Duree estimee** : ~10% du temps total

---

## 10. Differences fondamentales React vs Flutter

### Paradigmes de rendu

| Aspect | React (PWA) | Flutter |
|--------|-------------|---------|
| **Rendu** | Virtual DOM → DOM HTML | Widget tree → Canvas natif |
| **Rerendu** | Reconciliation par composant | Rebuild du widget subtree |
| **Styling** | CSS classes (Tailwind) | Inline Dart (BoxDecoration, TextStyle) |
| **Layout** | Flexbox / CSS Grid | Row, Column, Expanded, Flexible |
| **Responsive** | Media queries CSS | MediaQuery.of(context) |
| **Animations** | CSS transitions / JS | AnimatedContainer, Hero, Curves |
| **Formulaires** | HTML input + onChange | TextFormField + Controller |
| **Scroll** | CSS overflow-y | ListView.builder, SingleChildScrollView |

### Gestion d'etat

| Aspect | React (PWA) | Flutter |
|--------|-------------|---------|
| **Pattern** | Context + useState + useEffect | Provider + ChangeNotifier |
| **Scope** | Composant-level via hooks | App-level via Provider |
| **Trigger** | setState dans hook | notifyListeners() |
| **Consommation** | useContext(MyContext) | Consumer<T> ou context.watch<T> |
| **Side effects** | useEffect(() => {}, [deps]) | initState + addPostFrameCallback |

### Navigation

| Aspect | React (PWA) | Flutter |
|--------|-------------|---------|
| **Routeur** | Next.js file-based routing | Manual Navigator.push/pop |
| **Pages** | `/alerts`, `/kit`, `/settings` | selectedTab index switching |
| **Transitions** | Instantanees (SPA) | MaterialPageRoute (slide) |
| **Deep links** | URL-based | Non implemente (v2) |

---

## 11. Equivalences detaillees par ecran

### HomeScreen (Dashboard)

```
PWA (page.tsx)                    Flutter (home_screen.dart)
────────────────────────          ────────────────────────
<DefconBanner level={} />     →   DefconCard (widget custom)
<StatsRow alerts={105} />     →   Container avec Row de stats
<AlertList items={5} />       →   Column avec AlertCard widgets
<ActionGrid />                →   GridView.count(crossAxisCount: 2)
onClick={() => router.push}   →   provider.setSelectedTab(index)
```

### AlertsScreen

```
PWA                               Flutter
────────────────────────          ────────────────────────
<FilterBar sage/expert />     →   Row avec ChoiceChip widgets
<SortButtons />               →   Row avec toggle boutons
<AlertList />                 →   ListView.builder avec AlertCard
<RSSSection />                →   Column avec ListTile par source
filter(fiabilite > 80)        →   where((a) => a.scoreFiabilite > 80)
sort by severity              →   sort((a, b) => b.severity.compareTo(...))
```

### KitScreen

```
PWA (page.tsx)                    Flutter (kit_screen.dart)
────────────────────────          ────────────────────────
<ItemList items={15} />       →   Column avec CheckboxListTile
Supabase.from('kit').select() →   provider.kitItems (en memoire)
Supabase.update({checked})    →   provider.toggleKitItem(id)
<RPGQuiz questions={5} />     →   StatefulWidget avec _currentQuestion
<ProfileResult score={} />    →   Card avec profil calcule
```

### PremiumScreen

```
PWA                               Flutter
────────────────────────          ────────────────────────
<PricingCard monthly={} />    →   Card avec prix et bouton
<PricingCard yearly={} />     →   Card avec prix et badge -50%
<PackCard items={4} />        →   Column avec 4 ListTile
await fetch('/api/checkout')  →   showModalBottomSheet (mockup)
Stripe.redirectToCheckout()   →   Bottom sheet formulaire carte
Solana transfer instruction   →   Bottom sheet affichage SOL price
```

### EvacuationScreen

```
PWA                               Flutter
────────────────────────          ────────────────────────
<canvas> mapPainter() </canvas> → CustomPaint(painter: _MapPainter)
<PlanDetails planA={} />      →   ExpansionTile avec etapes
<PlanDetails planB={} />      →   ExpansionTile avec etapes
<PostRallySection />          →   Column avec 5 pack cards
<MicroPaymentButton />        →   ElevatedButton → bottom sheet
```

---

## 12. Ce qui n'a PAS ete migre (et pourquoi)

| Element PWA | Raison de non-migration | Alternative Flutter |
|-------------|------------------------|---------------------|
| Supabase auth | Pas de backend dispo | En memoire (v2 : Firebase Auth) |
| Supabase CRUD | Pas de backend dispo | Provider en memoire |
| Stripe checkout | Pas d'API server-side | Bottom sheet mockup |
| Next.js API routes | Pas de serveur Node.js | Donnees en dur dans Provider |
| SENTINEL rules engine | Regles complexes TS | Sources pre-definies dans les alertes |
| PWA service worker | Pas necessaire en app native | Flutter offline cache (v2) |
| CSS dark mode | Non prioritaire | Prevu pour v2 |
| Responsive breakpoints | Flutter gere nativement | MediaQuery + Expanded |

---

## 13. Resume executif de la migration

**Scope** : Migration complete d'une PWA React/Next.js vers une app mobile Flutter native.

**Resultat** :
- 4 350 lignes TypeScript → 4 565 lignes Dart
- 10 fichiers source PWA → 16 fichiers Dart
- 2 langues → 5 langues
- Web-only → Android APK + Web preview
- Supabase backend → Provider en memoire (standalone)
- Stripe payments → Mockup avec option Solana
- HTML Canvas → CustomPainter natif
- 0 alerte reelle → 7 alertes basees sur des donnees reelles

**Ajouts specifiques a Flutter** :
- Carte interactive dans le detail d'alerte (CustomPainter)
- Questionnaire RPG gamifie avec 4 profils
- Section post-ralliement avec 5 packs micro-paiement
- Mode sage/expert pour le filtrage
- Toggle bidirectionnel mode test/mode normal
- 3 nouvelles langues (chinois, russe, arabe)
- Badge LIVE/TEST dans l'AppBar
- Corrections specifiques Samsung S9+
- APK signe pour le Solana Mobile dApp Store
