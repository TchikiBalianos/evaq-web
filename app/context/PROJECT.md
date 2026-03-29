# EVAQ — Crisis Alert & Evacuation

## Vue d'ensemble

**EVAQ** est une application mobile d'alerte de crise et d'evacuation d'urgence, concue pour le **Solana Mobile dApp Store** (Seeker). Elle analyse en temps reel des flux RSS mondiaux (GDACS, ReliefWeb) et des analyses OSINT (SENTINEL NLP) pour fournir des alertes de crise geolocalisees, des plans d'evacuation interactifs, et un systeme de preparation de kit de survie gamifie.

---

## Identite du projet

| Cle | Valeur |
|-----|--------|
| **Nom** | EVAQ — Crisis Alert & Evacuation |
| **Package Android** | `com.evaq.app` |
| **Version actuelle** | 1.2.1 (build 3) |
| **Plateforme cible** | Android (Solana Seeker) + Web preview |
| **Framework** | Flutter 3.35.4 / Dart 3.9.2 |
| **State management** | Provider 6.1.5+1 |
| **Langues** | Francais, English, Zhongwen, Russkij, Arabiyya |
| **Licence** | Proprietaire |
| **Repo GitHub** | `TchikiBalianos/evaq-web` |

---

## Origine du projet

EVAQ a ete initialement developpe comme une **Progressive Web App (PWA)** en React/TypeScript avec :
- Next.js pour le framework
- Supabase pour la base de donnees
- i18n.tsx pour l'internationalisation
- test-scenarios.ts pour les scenarios de crise simules

L'application a ensuite ete **entierement portee vers Flutter** pour cibler le Solana Mobile dApp Store et obtenir une experience native sur Android, tout en conservant un preview web pour les demonstrations.

Voir **PWA_TO_FLUTTER_MIGRATION.md** pour le log complet de cette migration.

---

## Stack technique

### Frontend (Flutter)
- **Flutter 3.35.4** — SDK mobile cross-platform
- **Dart 3.9.2** — Langage de programmation
- **Provider 6.1.5+1** — Gestion d'etat reactive
- **Material Design 3** — Systeme de design UI

### Dependencies
| Package | Version | Usage |
|---------|---------|-------|
| `provider` | 6.1.5+1 | State management |
| `shared_preferences` | 2.5.3 | Stockage cle-valeur local |
| `http` | 1.5.0 | Client HTTP pour API |
| `geolocator` | ^13.0.2 | Geolocalisation |
| `geocoding` | ^3.0.0 | Geocodage inverse |
| `intl` | ^0.20.2 | Formatage international |
| `fl_chart` | ^0.70.2 | Graphiques (reserve) |
| `url_launcher` | ^6.3.1 | Ouverture de liens externes |

### Build & Deployment
- **Android SDK** 35 (API level 35)
- **Java** OpenJDK 17.0.2
- **Gradle** Kotlin DSL (.gradle.kts)
- **Signing** : Keystore release (`release-key.jks`)
- **Cible** : Solana Mobile dApp Store (Seeker)

---

## Structure des fichiers

```
flutter_app/
  context/               # Documentation du projet (ce dossier)
  lib/
    main.dart            # Point d'entree, EvaqApp, EvaqShell, navigation
    models/
      alert_model.dart   # AlertModel, AlertSeverity enum
      kit_model.dart     # KitItem, MapPoint, EvacuationPlan
    providers/
      evaq_provider.dart # EvaqProvider (state central, scenarios, alertes)
    screens/
      home_screen.dart       # Dashboard DEFCON + alertes + actions rapides
      alerts_screen.dart     # Liste des alertes + filtres + RSS monitoring
      alert_detail_screen.dart  # Detail alerte + carte interactive + recommandations
      evacuation_screen.dart # Plans de fuite + carte + packs post-rally
      kit_screen.dart        # Kit de survie + questionnaire RPG
      premium_screen.dart    # Abonnements + paiement carte/Solana
      settings_screen.dart   # Parametres + langue + profil
    utils/
      constants.dart     # AppColors, DefconLevel
      i18n.dart          # Systeme i18n (FR/EN/ZH/RU/AR) — 680 lignes
    widgets/
      alert_card.dart    # Carte d'alerte (severite, distance, temps)
      common_widgets.dart # ActionButton, TestModeBanner, ScoreCard, etc.
      defcon_card.dart   # Carte DEFCON avec niveau de risque
  android/               # Configuration Android native
  assets/icon/           # Icone de l'application
  pubspec.yaml           # Dependencies et metadata
```

---

## Statistiques du code

| Metrique | Valeur |
|----------|--------|
| **Fichiers Dart** | 16 |
| **Lignes de code** | ~4 565 |
| **Cles i18n** | ~270 (x5 langues) |
| **Scenarios de test** | 6 (avec 2-5 alertes chacun) |
| **Alertes monde reel** | 7 (mode normal) |
| **Items kit de survie** | 15 |
| **Plans d'evacuation** | 2 (Plan A voiture, Plan B velo/pied) |
| **Packs micro-paiement** | 5 |
| **Taille APK** | ~52 MB |

---

## Documents disponibles

| Fichier | Contenu | Taille |
|---------|---------|--------|
| `PROJECT.md` | Ce document — vue d'ensemble du projet | ~5 KB |
| `CHANGELOG.md` | Historique complet des modifications (v1.0.0 → v1.2.1) | ~8 KB |
| `PWA_TO_FLUTTER_MIGRATION.md` | **Log detaille de la migration PWA → Flutter** — transformations composants, state, CSS, i18n, cartes, donnees, problemes rencontres et solutions | ~15 KB |
| `ARCHITECTURE.md` | Architecture technique : layers, Provider pattern, flux de donnees, modeles, navigation, CustomPainter, theme, design system | ~17 KB |
| `FEATURES.md` | Inventaire exhaustif des fonctionnalites : 10 sections, tous les ecrans, tous les items, tous les packs, mode test/normal | ~10 KB |
| `DEPLOYMENT.md` | Guide de build, signing, deploiement : APK, Web, versioning, Solana dApp Store, GitHub, troubleshooting | ~9 KB |
| `I18N.md` | Documentation du systeme multilingue : 5 langues, ~150 cles, mapping 100+ pays, temps relatif localise, guide d'ajout de langue | ~12 KB |

**Taille totale de la documentation** : ~76 KB
