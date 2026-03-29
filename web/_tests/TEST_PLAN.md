# EVAQ — Plan de tests fonctionnels

Référence vivante. Mis à jour après chaque phase technique.
Résultats dans `sessions/YYYY-MM-DD.md`.

---

## Convention

| Statut | Signification |
|--------|---------------|
| ✅ | Passé |
| ❌ | Échec — bug à corriger |
| ⚠️ | Dégradé — fonctionne mais à améliorer |
| ⏭️ | Non testé / hors scope phase actuelle |

---

## MODULE 1 — Auth

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| A01 | Accès `/dashboard` sans session | Redirigé vers `/login` |
| A02 | Inscription email/password valide | Compte créé, redirigé dashboard |
| A03 | Inscription mot de passe < 12 car. | Message d'erreur affiché |
| A04 | Connexion email/password valide | Session active, dashboard accessible |
| A05 | Connexion avec mauvais password | Message d'erreur, pas de session |
| A06 | Déconnexion | Session détruite, redirigé login |
| A07 | Accès URL protégée post-déconnexion | Redirigé login |

---

## MODULE 2 — Géolocalisation & DEFCON

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| G01 | Géolocalisation accordée | DEFCON calculé, badge affiché |
| G02 | Indicateur geo-status | Pill verte + nom de ville en bas à droite |
| G03 | Géolocalisation refusée | Message d'erreur lisible, DEFCON 5 |
| G04 | Navigateur sans géoloc | Message d'erreur "non supporté" |
| G05 | DEFCON recalculé au rafraîchissement | Valeur cohérente avec alertes BDD |
| G06 | Sécheresse lointaine → DEFCON 5 | DR à >1× son rayon n'élève pas le DEFCON |
| G07 | Conflit proche → DEFCON ≤ 3 | CONFLICT dans la zone d'impact → DEFCON 1-3 |

---

## MODULE 3 — Page Alertes

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| AL01 | Chargement liste alertes | Alertes visibles en <3s |
| AL02 | Mode Sage (défaut) | Seules les alertes fiabilité ≥ 80% affichées |
| AL03 | Basculer mode Expert | Toutes les alertes visibles |
| AL04 | Tri par date | Alerte la plus récente en premier |
| AL05 | Tri par gravité | Alerte severity 5 en premier |
| AL06 | Tri par distance (géoloc active) | Alerte la plus proche en premier |
| AL07 | Tri par distance (géoloc inactive) | Bouton grisé / désactivé |
| AL08 | Clic expand alerte | Détail + carte MapLibre + fiche conseil visible |
| AL09 | Mini-carte MapLibre | Carte chargée, marker visible, cercle d'impact |
| AL10 | Clic collapse alerte | Détail masqué |
| AL11 | Titres en français | Alertes GDACS traduites (ex: "Sécheresse — Autriche") |
| AL12 | Titres en anglais | Alertes en anglais si locale EN |
| AL13 | Fiche conseil "Que faire ?" | Affichée dans le détail, actions contextuelles par type |

---

## MODULE 4 — i18n

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| I01 | Toggle FR→EN | Interface basculée en anglais |
| I02 | Toggle EN→FR | Interface basculée en français |
| I03 | Persistance locale | Rechargement page → locale conservée |
| I04 | Labels DEFCON bilingues | "Attention" (FR) / "Caution" (EN) |

---

## MODULE 5 — Thème

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| T01 | Thème clair | Interface en mode clair |
| T02 | Thème sombre | Interface en mode sombre |
| T03 | Thème système | Suit les préférences OS |
| T04 | Persistance thème | Rechargement → thème conservé, pas de flash |

---

## MODULE 6 — PWA

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| P01 | Manifest PWA | `/manifest.webmanifest` retourne JSON valide |
| P02 | Icônes PWA | icon-192x192.png accessible via `/icons/icon-192x192.png` |
| P03 | Service worker | `/sw.js` accessible et enregistré |
| P04 | Prompt install iOS | Affiché sur Safari iOS (ou simulé) |
| P05 | Cache tuiles MapLibre | Tuiles en cache après navigation carte |
| P06 | Cache API offline | Réponses API cachées en mode offline |

---

## MODULE 7 — Navigation

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| N01 | Lien Dashboard depuis header | Navigation vers `/dashboard` |
| N02 | Lien Alertes depuis header | Navigation vers `/alertes` |
| N03 | Lien Plan de fuite | Navigation vers `/plan-fuite` |
| N04 | Lien Kit de survie | Navigation vers `/kit` |
| N05 | Lien depuis dashboard (quick actions) | Navigation correcte |
| N06 | Lien Premium depuis dashboard | Navigation vers `/premium` |

---

## MODULE 8 — Plan de fuite (Phase 2)

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| EV01 | Carte plein écran | MapLibre chargée, zones de menace affichées |
| EV02 | Marqueurs épicentre + popups | Clic marqueur → popup avec titre traduit |
| EV03 | Sélection destination (crosshair) | Clic bouton → mode sélection, clic carte → marqueur bleu |
| EV04 | Calcul itinéraire OSRM | 1-3 routes affichées (bleu/gris) |
| EV05 | Sélection route alternative | Clic sur route → mise en surbrillance |
| EV06 | Panneau info route | Distance km + durée affichés |
| EV07 | Bouton Annuler | Retour à l'état idle, routes effacées |
| EV08 | Évacuation intelligente | Conseil adapté au type de menace + vent |
| EV09 | Sauvegarde plan | Plan enregistré en localStorage |
| EV10 | Chargement plan sauvegardé | Route affichée depuis un plan sauvegardé |
| EV11 | Suppression plan | Plan supprimé de la liste |
| EV12 | API vent | `/api/wind` retourne vitesse + direction |

---

## MODULE 9 — Kit de survie (Phase 3)

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| K01 | Score de préparation | Score 0-100% affiché, barre de progression |
| K02 | Catégories (6 onglets) | Navigation entre catégories |
| K03 | Ajouter un item | Formulaire → item apparaît dans la liste |
| K04 | Modifier un item | Clic "Modifier" → formulaire pré-rempli |
| K05 | Supprimer un item | Item disparu de la liste |
| K06 | Expiration item | Items expirant → fond jaune ; expirés → fond rouge |
| K07 | Recommandations | Panel "items manquants" avec items recommandés |
| K08 | Ajout depuis recommandation | Clic sur item recommandé → formulaire pré-rempli |
| K09 | Limite gratuite (15 items) | Bouton "Ajouter" désactivé au-delà de 15 |
| K10 | Score dynamique | Score recalculé après ajout/suppression |

---

## MODULE 10 — Premium & Stripe (Phase 4)

| ID | Cas de test | Critère de succès |
|----|-------------|-------------------|
| PR01 | Page Premium accessible | `/premium` affiche packs et abonnements |
| PR02 | Checkout Stripe (abonnement) | Redirection vers Stripe Checkout |
| PR03 | Checkout Stripe (pack one-shot) | Redirection vers Stripe Checkout |
| PR04 | Webhook payment success | `subscription_tier` ou `active_packs` mis à jour en BDD |
| PR05 | Portail client Stripe | Lien vers le portail de gestion |
| PR06 | Cron kit-expiry | Notification push envoyée pour items expirant |

---

## Couverture par phase

| Phase | Modules couverts | Tests unitaires |
|-------|-----------------|-----------------|
| Phase 1 | 1, 2, 3, 4, 5, 6, 7 | 26 tests (defcon) |
| Phase 2 | + Module 8 | + 26 tests (evacuation-logic, scenarios) |
| Phase 3 | + Module 9 | + 15 tests (kit-knowledge) |
| Phase 4 | + Module 10 | + 10 tests (paywall) |
| Phase 5 | Validation globale | + 4 tests (threat-guides) = **81 total** |
