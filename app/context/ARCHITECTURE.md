# EVAQ — Architecture technique

Ce document decrit l'architecture technique de l'application EVAQ, les patterns utilises, le flux de donnees et les decisions de conception.

---

## 1. Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────┐
│                     EVAQ Flutter App                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                PRESENTATION LAYER                 │   │
│  │  main.dart (EvaqApp + EvaqShell)                 │   │
│  │  ├── HomeScreen                                   │   │
│  │  ├── AlertsScreen → AlertDetailScreen             │   │
│  │  ├── EvacuationScreen                             │   │
│  │  ├── KitScreen                                    │   │
│  │  ├── PremiumScreen                                │   │
│  │  └── SettingsScreen                               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │ Consumer<EvaqProvider>                  │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │              STATE MANAGEMENT LAYER                │   │
│  │  EvaqProvider (ChangeNotifier)                    │   │
│  │  ├── Alertes (test + reelles)                     │   │
│  │  ├── Kit de survie (items + score)                │   │
│  │  ├── Plans d'evacuation                           │   │
│  │  ├── Mode test / Mode normal                      │   │
│  │  ├── Locale (i18n)                                │   │
│  │  ├── DEFCON level                                 │   │
│  │  ├── Premium status                               │   │
│  │  └── RPG quiz score                               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │                   DATA LAYER                      │   │
│  │  Models (AlertModel, KitItem, EvacuationPlan)     │   │
│  │  I18n (dictionnaires statiques)                   │   │
│  │  Constants (AppColors, DefconLevel)               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │               WIDGETS REUTILISABLES               │   │
│  │  AlertCard, DefconCard, TestModeBanner,           │   │
│  │  ActionButton, PreparationScoreCard,              │   │
│  │  NotificationCard, LocationBadge                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Pattern de state management : Provider

### Choix du pattern

EVAQ utilise le pattern **Provider** avec un **ChangeNotifier unique** (`EvaqProvider`). Ce choix a ete motive par :

- **Simplicite** : Un seul provider centralise tout l'etat de l'application
- **Reactivite** : `notifyListeners()` met a jour automatiquement tous les `Consumer<EvaqProvider>`
- **Migration facile** : Le pattern React Context de la PWA se traduit directement en Provider
- **Taille du projet** : ~4500 lignes de code ne necessitent pas une architecture plus complexe (Bloc, Riverpod)

### Flux de donnees

```
  User Action (tap, swipe, toggle)
         │
         ▼
  EvaqShell / Screen (Widget)
         │
         ▼ (appel methode)
  EvaqProvider.method()
         │
         ├── Met a jour l'etat interne (_nearbyAlerts, _defconLevel, etc.)
         ├── Appelle notifyListeners()
         │
         ▼
  Consumer<EvaqProvider> rebuild
         │
         ▼
  UI mise a jour automatiquement
```

### Exemple concret : Toggle mode test

```dart
// 1. L'utilisateur appuie sur le bouton "Activer TEST"
TestModeBanner → onToggle → provider.toggleTestMode()

// 2. Le provider met a jour l'etat
void toggleTestMode() {
  _isTestMode = !_isTestMode;
  if (!_isTestMode) {
    _loadRealAlerts();      // Charge 7 alertes monde reel
  } else {
    _loadScenarioAlerts();  // Charge les alertes du scenario actif
  }
  notifyListeners();        // Declenche le rebuild
}

// 3. Tous les Consumer se reconstruisent
// - TestModeBanner affiche "MODE REEL" ou "MODE TEST"
// - AppBar affiche "LIVE" ou "TEST ON"
// - AlertsScreen affiche les alertes correspondantes
// - HomeScreen met a jour le niveau DEFCON
```

---

## 3. Structure des fichiers et responsabilites

### Arborescence complete

```
lib/
├── main.dart                          # Point d'entree + EvaqShell (navigation)
│
├── models/
│   ├── alert_model.dart               # AlertModel + AlertSeverity enum
│   └── kit_model.dart                 # KitItem + EvacuationPlan + MapPoint
│
├── providers/
│   └── evaq_provider.dart             # EvaqProvider (ChangeNotifier central)
│
├── screens/
│   ├── home_screen.dart               # Dashboard DEFCON + actions rapides
│   ├── alerts_screen.dart             # Liste alertes + filtres + RSS
│   ├── alert_detail_screen.dart       # Detail alerte + carte interactive
│   ├── evacuation_screen.dart         # Plans + carte + packs post-rally
│   ├── kit_screen.dart                # Kit survie + RPG gamifie
│   ├── premium_screen.dart            # Abonnements + paiement
│   └── settings_screen.dart           # Parametres + langue + profil
│
├── utils/
│   ├── constants.dart                 # AppColors + DefconLevel
│   └── i18n.dart                      # Systeme i18n (5 langues)
│
└── widgets/
    ├── alert_card.dart                # Carte d'alerte
    ├── common_widgets.dart            # Widgets reutilisables
    └── defcon_card.dart               # Carte DEFCON
```

### Responsabilites par couche

| Couche | Fichiers | Responsabilite |
|--------|----------|----------------|
| **Entry point** | `main.dart` | Configuration MaterialApp, theme, shell navigation, AppBar, badges TEST/LIVE, dialogues langue/scenario |
| **Screens** | `screens/*.dart` | Logique d'affichage specifique a chaque onglet, interaction utilisateur |
| **Widgets** | `widgets/*.dart` | Composants UI reutilisables entre les ecrans |
| **Provider** | `evaq_provider.dart` | Etat global, donnees, logique metier, scenarios, alertes |
| **Models** | `models/*.dart` | Classes de donnees immutables avec constructeurs nommes |
| **Utils** | `utils/*.dart` | Constantes partagees, systeme de traduction |

---

## 4. Modeles de donnees

### AlertModel

```
AlertModel
├── id: String                 # Identifiant unique (ex: 'test-soc-1', 'real-3')
├── titleFr: String            # Titre en francais
├── titleEn: String            # Titre en anglais
├── eventType: String          # Type SENTINEL (CONFLICT, NUCLEAR, CHEMICAL, etc.)
├── category: String           # Categorie affichee (Seisme, Conflit, Cyber...)
├── distance: double           # Distance en km depuis la position utilisateur
├── severity: int              # Score de severite (0-100)
├── scoreFiabilite: int        # Score de fiabilite de la source (0-100)
├── timestamp: DateTime        # Date/heure de l'evenement
├── isSimulated: bool          # true = mode test, false = alerte reelle
├── severityLevel: AlertSeverity  # Enum (critical, high, medium, low)
├── description: String        # Description detaillee FR
├── descriptionEn: String      # Description detaillee EN
├── source: String             # Source (GDACS, RELIEFWEB, SENTINEL)
├── recommendations: List<String>    # Recommandations FR
├── recommendationsEn: List<String>  # Recommandations EN
├── affectedZones: List<String>      # Zones touchees
├── evolution: String          # Evolution (aggravation, stable, stabilisation)
├── latitude: double           # Coordonnees GPS
├── longitude: double          # Coordonnees GPS
├── radiusKm: double           # Rayon d'impact en km
├── lastUpdate: DateTime?      # Derniere mise a jour
├── affectedPeople: int        # Nombre de personnes touchees
└── status: String             # Statut (active, resolved)

Getters localises :
├── title → titleFr ou titleEn selon I18n.locale
├── subtitle → I18n.t('event.$eventType')
├── localizedDescription → description selon locale
└── localizedRecommendations → recommendations selon locale
```

### KitItem

```
KitItem
├── id: String          # Identifiant
├── name: String        # Nom de l'item
├── category: String    # Categorie (Eau, Nourriture, Sante, etc.)
├── icon: String        # Emoji representant l'item
├── isChecked: bool     # Coche par l'utilisateur (defaut: false)
└── priority: int       # Priorite (defaut: 1)

Methodes :
└── copyWith(isChecked) → Nouvelle instance immutable
```

### EvacuationPlan

```
EvacuationPlan
├── id: String
├── name: String              # Nom du plan (ex: "Plan A — Route principale")
├── destination: String       # Destination
├── distanceKm: double        # Distance totale
├── transport: String         # Moyen de transport
├── estimatedTime: String     # Temps estime
├── startLat/startLng: double # Coordonnees depart
├── endLat/endLng: double     # Coordonnees arrivee
├── steps: List<String>       # Etapes textuelles
└── waypoints: List<MapPoint> # Points de passage GPS

MapPoint
├── lat: double
├── lng: double
└── label: String
```

---

## 5. Navigation

### Architecture de navigation

EVAQ utilise une **navigation par onglets** (bottom bar) avec 6 ecrans principaux, sans routage nomme.

```
EvaqApp (MaterialApp)
  └── EvaqShell (Scaffold)
        ├── AppBar
        │   ├── Titre "EVAQ"
        │   ├── Badge TEST/LIVE
        │   └── Selecteur de langue (drapeau)
        │
        ├── Body
        │   ├── TestModeBanner (conditionnel)
        │   └── screens[provider.selectedTab]
        │       ├── [0] HomeScreen
        │       ├── [1] AlertsScreen
        │       │       └── Navigator.push → AlertDetailScreen
        │       ├── [2] EvacuationScreen
        │       ├── [3] KitScreen
        │       ├── [4] PremiumScreen
        │       └── [5] SettingsScreen
        │
        └── BottomNavigationBar (custom Row)
              ├── Accueil    (home_rounded)
              ├── Alertes    (warning_amber_rounded)
              ├── Evacuation (map_rounded)
              ├── Kit        (backpack_rounded)
              ├── Premium    (star_rounded)
              └── Parametres (settings_rounded)
```

### Navigation inter-ecrans

- **AlertsScreen → AlertDetailScreen** : `Navigator.push()` avec passage du modele `AlertModel`
- **Onglets** : Selection via `provider.setSelectedTab(index)` + rebuild du body
- **Dialogues** : `showDialog()` pour le selecteur de langue et de scenario
- **Bottom sheets** : `showModalBottomSheet()` pour les paiements Premium et les packs d'evacuation

---

## 6. Rendu de cartes (CustomPainter)

EVAQ n'utilise pas de bibliotheque de cartographie externe (Google Maps, flutter_map). Toutes les cartes sont rendues avec des **CustomPainter** natifs.

### Carte d'evacuation (`evacuation_screen.dart`)

```
_MapPainter (CustomPainter)
├── Terrain : quadrillage + zones vertes (parcs) + bleu (riviere)
├── Routes : lignes grises (A13, N10)
├── Itineraire : ligne rouge pointillee reliant les waypoints
├── Waypoints : cercles colores (vert=depart, bleu=intermediaire, rouge=arrivee)
├── Labels : noms des waypoints
└── Legende : badges distance et temps estime
```

### Carte de detail alerte (`alert_detail_screen.dart`)

```
_AlertMapPainter (CustomPainter)
├── Grille de fond
├── Terrain simule : routes, eau, parcs
├── Cercles concentriques de severite (rayon = radiusKm)
├── Point central : position de l'alerte
├── Badge : coordonnees GPS
└── Badge : rayon d'impact
```

### Avantages du CustomPainter

1. **Zero dependance** : Pas de package externe (google_maps, flutter_map, mapbox)
2. **Controle total** : Design personnalise, pas de tuiles de carte a charger
3. **Performance** : Rendu natif via Canvas, pas de WebView
4. **Taille** : Pas d'ajout de poids a l'APK
5. **Offline** : Fonctionne sans connexion internet

---

## 7. Theme et design system

### Palette de couleurs (AppColors)

```
┌──────────────────────────────────────────────────┐
│  EVAQ Color Palette                               │
├──────────────────────────────────────────────────┤
│  primary      #DC2626  ███  Rouge urgence         │
│  primaryDark  #B91C1C  ███  Rouge fonce            │
│  primaryLight #FEE2E2  ███  Rose clair             │
│  accent       #EF4444  ███  Rouge alerte           │
│  success      #22C55E  ███  Vert succes/LIVE       │
│  warning      #F59E0B  ███  Orange avertissement   │
│  info         #3B82F6  ███  Bleu informatif        │
│  background   #F8F9FA  ███  Gris tres clair        │
│  surface      #FFFFFF  ███  Blanc                  │
│  textPrimary  #1A1A1A  ███  Noir quasi-pur         │
│  textSecondary#6B7280  ███  Gris moyen             │
│  textMuted    #9CA3AF  ███  Gris clair             │
│  cardBorder   #E5E7EB  ███  Bordure cartes         │
│  divider      #F3F4F6  ███  Separateur             │
└──────────────────────────────────────────────────┘
```

### Systeme DEFCON (5 niveaux)

| Niveau | Label | Couleur fond | Couleur texte | Description |
|--------|-------|-------------|---------------|-------------|
| 1 | Urgence | #1A1A1A (noir) | Blanc | Urgence imminente. Evacuez. |
| 2 | Critique | #DC2626 (rouge) | Blanc | Situation critique. Preparez evacuation. |
| 3 | Alerte | #F59E0B (orange) | Blanc | Risque eleve. Restez vigilant. |
| 4 | Vigilance | #FDE68A (jaune clair) | Noir | Risque modere. Surveillez. |
| 5 | Normal | #86EFAC (vert clair) | Noir | Situation normale. |

### Theme Material Design 3

```dart
ThemeData(
  useMaterial3: true,
  colorSchemeSeed: AppColors.primary,     // Rouge urgence
  scaffoldBackgroundColor: AppColors.background,
  fontFamily: 'Roboto',
  appBarTheme: AppBarTheme(
    backgroundColor: AppColors.surface,   // Blanc
    elevation: 0,
    scrolledUnderElevation: 1,
    centerTitle: false,
    titleTextStyle: TextStyle(
      fontSize: 20,
      fontWeight: FontWeight.w800,
      letterSpacing: 1.5,
    ),
  ),
  cardTheme: CardThemeData(
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: BorderSide(color: AppColors.cardBorder),
    ),
  ),
)
```

---

## 8. Sources de donnees

### Mode test (simule)

6 scenarios de crise, chacun avec 2 a 5 alertes pre-definies en dur dans `EvaqProvider`.

| Scenario | ID | Alertes |
|----------|----|---------|
| Effondrement societal | `societal-collapse` | 5 |
| Guerre Iran | `iran-war` | 4 |
| Escalade nucleaire Ukraine | `ukraine-escalation` | 3 |
| Attaque chimique Paris | `chemical-attack` | 2 |
| Cascade naturelle | `natural-cascade` | 3 |
| Confinement biologique | `confinement` | 2 |
| **Total** | | **19 alertes** |

### Mode normal (reel)

7 alertes basees sur des evenements reels, definies dans `_realWorldAlerts()` avec des sources simulees.

| Source | Nombre |
|--------|--------|
| GDACS | 3 (seisme, cyclone, volcan) |
| RELIEFWEB | 3 (inondation, conflit, secheresse) |
| SENTINEL | 1 (cyberattaque) |

### Calcul DEFCON automatique

```
Severite max >= 90 → DEFCON 2 (Critique)
Severite max >= 75 → DEFCON 3 (Alerte)
Severite max >= 50 → DEFCON 4 (Vigilance)
Sinon             → DEFCON 5 (Normal)
```

---

## 9. Decisions architecturales notables

### Pourquoi pas de routage nomme ?

La navigation par index (`selectedTab`) est plus simple pour 6 onglets statiques. Le seul ecran supplementaire (`AlertDetailScreen`) utilise `Navigator.push` classique.

### Pourquoi un seul Provider ?

L'application a un seul domaine fonctionnel (alertes/evacuation). Diviser en plusieurs providers ajouterait de la complexite sans benefice. Si l'app grandit (Firebase, auth, cache), un multi-provider serait pertinent.

### Pourquoi pas de base de donnees locale ?

Les donnees sont simulees/pre-definies. SharedPreferences est declare en dependance pour un usage futur (preferences utilisateur). Hive serait ajoute pour la persistence offline en v2.

### Pourquoi CustomPainter au lieu de Google Maps ?

1. Pas de cle API necessaire
2. Fonctionne offline
3. Design sur mesure adapte au contexte de crise
4. Pas d'ajout de poids a l'APK (~5MB en moins)
5. Performances natives sans WebView

### Pourquoi i18n maison au lieu d'un package ?

Le systeme i18n est une classe statique `I18n` avec dictionnaires `Map<String, Map<String, String>>`. C'est plus leger qu'`easy_localization` ou `flutter_localizations` et offre un controle total sur la traduction des noms de pays et des titres d'alertes.
