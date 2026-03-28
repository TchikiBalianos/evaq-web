# EVAQ — Inventaire complet des fonctionnalites

Ce document liste exhaustivement toutes les fonctionnalites implementees dans EVAQ v1.2.1.

---

## 1. Dashboard principal (HomeScreen)

### Carte DEFCON
- **Affichage du niveau DEFCON** (1 a 5) avec code couleur
- **Label et description** du niveau actuel
- **Calcul dynamique** base sur la severite maximale des alertes actives
- **Mise a jour reactive** lors du changement de mode (test/normal) ou de scenario

### Statistiques en temps reel
- **Nombre d'alertes actives** mondiales (affichees en haut)
- **Nombre d'alertes simulees** (mode test uniquement)
- **Localisation utilisateur** : Suresnes, FR (pre-configure)
- **Score de preparation** : pourcentage base sur les items du kit coches

### Actions rapides
- **Grille 2x2** de boutons d'action avec icones
- **Navigation directe** vers les ecrans principaux

---

## 2. Systeme d'alertes (AlertsScreen + AlertDetailScreen)

### Liste des alertes
- **Carte d'alerte** (AlertCard) avec :
  - Indicateur de severite (point colore)
  - Titre localise (FR/EN selon la langue)
  - Categorie d'evenement
  - Distance en km depuis la position utilisateur
  - Temps ecoule ("il y a 2h", "il y a 3j")
  - Pourcentage de severite
  - Badge "SIM" pour les alertes simulees
- **Navigation vers le detail** au tap

### Filtrage et tri
- **Mode sage** : affiche uniquement les alertes avec fiabilite > 80%
- **Mode expert** : affiche toutes les alertes
- **Toggle sage/expert** dans l'interface

### Section RSS Monitoring
- **3 flux surveilles** : GDACS, ReliefWeb, SENTINEL NLP
- **Indicateurs visuels** par source (icones et couleurs)
- **Compteur** d'alertes par source

### Detail d'alerte (AlertDetailScreen)
- **Badge de severite** avec pourcentage et code couleur
- **Tag simulation** si alerte test
- **Temps ecoule** depuis l'evenement
- **Metadonnees** : distance, rayon d'impact, source, score de fiabilite
- **Label d'evolution** (aggravation/stable/stabilisation) avec icone et couleur
- **Nombre de personnes affectees** (formate en k/M)
- **Liste des zones touchees** avec chips
- **Recommandations numerotees** avec bullets
- **Carte interactive** (CustomPainter) :
  - Grille de fond
  - Terrain simule (routes, eau, parcs)
  - Cercles concentriques de severite
  - Point central de l'alerte
  - Badges coordonnees GPS et rayon
- **Bouton "Voir le plan d'evacuation"** avec navigation

---

## 3. Plans d'evacuation (EvacuationScreen)

### Carte interactive
- **CustomPainter** avec terrain simule
- **2 itineraires** affiches :
  - **Plan A** : Route principale, voiture, 85km, 1h15
  - **Plan B** : Itineraire bis, velo/pied, 45km, 4-10h
- **Waypoints colores** :
  - Vert = point de depart (Suresnes)
  - Bleu = points intermediaires
  - Rouge = destination
- **Labels** sur chaque waypoint

### Detail des plans
- **Nom et destination** du plan
- **Distance et temps estime**
- **Moyen de transport** avec icone
- **Etapes numerotees** avec timeline visuelle
- **Bouton d'expansion** pour voir les details

### Section post-ralliement
- **Description** : "Apres le point de ralliement, etapes supplementaires..."
- **5 packs micro-paiement** :

| Pack | Prix | Description |
|------|------|-------------|
| Abri d'urgence | 14.99 EUR | Materiel d'abri temporaire |
| Purification d'eau | 9.99 EUR | Systeme de filtration |
| Communication | 19.99 EUR | Radio + batterie externe |
| Soins avances | 24.99 EUR | Kit medical complet |
| Energie autonome | 29.99 EUR | Panneaux solaires portables |

- **Bottom sheet de paiement** pour chaque pack
- **Simulation de paiement** avec delai de 2 secondes

---

## 4. Kit de survie gamifie (KitScreen)

### Inventaire du kit
- **15 items** organises par categorie :

| ID | Item | Categorie | Icone |
|----|------|-----------|-------|
| 1 | Eau potable (6L) | Eau | 💧 |
| 2 | Nourriture lyophilisee (3j) | Nourriture | 🥫 |
| 3 | Trousse de premiers soins | Sante | 🩹 |
| 4 | Lampe torche + piles | Equipement | 🔦 |
| 5 | Radio a manivelle | Communication | 📻 |
| 6 | Couverture de survie | Protection | 🛡️ |
| 7 | Couteau multifonction | Outils | 🔪 |
| 8 | Corde (10m) | Outils | 🪢 |
| 9 | Documents importants (copies) | Documents | 📄 |
| 10 | Argent liquide | Finances | 💶 |
| 11 | Vetements de rechange | Vetements | 👕 |
| 12 | Masques FFP2 | Protection | 😷 |
| 13 | Chargeur solaire | Energie | 🔋 |
| 14 | Sifflet d'urgence | Communication | 📢 |
| 15 | Filtre a eau portable | Eau | 🚰 |

- **Checkbox** pour cocher/decocher chaque item
- **Score de preparation** mis a jour dynamiquement
- **Barre de progression** indiquant le % de completion

### Questionnaire RPG
- **5 questions post-apocalyptiques** a choix multiples (4 reponses par question)
- **Barre de progression** pendant le quiz
- **4 profils de survivant** :

| Score | Profil |
|-------|--------|
| 0-4 | Novice |
| 5-9 | Initie |
| 10-14 | Preparateur |
| 15-20 | Survivant confirme |

- **Resultat** affiche avec description personnalisee
- **Possibilite de refaire** le quiz

### Kit prioritaire par scenario
- **Specifique au scenario actif** (mode test)
- **Items supplementaires recommandes** :
  - Effondrement societal : reserve 30j, filtration eau, generateur, metaux precieux, semences
  - Guerre Iran : jerricans carburant, iode, radio, reserve 14j, especes
  - Ukraine : iode, ruban adhesif, dosimetre, reserve eau 72h, batterie solaire
  - Attaque chimique : masque FFP3/gaz, combinaison Tyvek, adhesif, lingettes decontamination
  - Cascade naturelle : sac 72h, couvertures survie, sifflet, gilets sauvetage
  - Confinement : masques FFP3 x50, purificateur HEPA, medicaments 30j, thermometre+oxymetre

### Ajout d'items personnalises
- **Dialogue d'ajout** pour ajouter de nouveaux items au kit
- **Champs** : nom, categorie

---

## 5. Section Premium (PremiumScreen)

### Interface
- **Hero header** avec degradee dore et liste de features
- **2 onglets** via chips : Abonnements / Packs a l'unite

### Abonnements
| Formule | Prix | Detail |
|---------|------|--------|
| Mensuel | 4.99 EUR/mois | Acces complet |
| Annuel | 29.99 EUR/an | -50% (equivalent 2.49 EUR/mois) |

### Packs unitaires
| Pack | Prix |
|------|------|
| Alertes | 1.99 EUR |
| Evacuation | 2.99 EUR |
| Kit | 2.99 EUR |
| Preparation | 4.99 EUR |

### Systeme de paiement (mockup)
- **Bottom sheet** de paiement avec 2 options :
  1. **Carte bancaire** : formulaire pre-rempli (4242 4242 4242 4242, 12/25, 123)
  2. **Solana (SOL)** : equivalence en SOL (~0.035 SOL mensuel, ~0.21 SOL annuel)
- **Badges securite** : SSL 256-bit, PCI DSS
- **Simulation de traitement** : spinner 2 secondes, puis confirmation
- **Vue Premium actif** : affichee apres souscription reussie

---

## 6. Parametres (SettingsScreen)

### Profil
- **Conteneur de profil** avec avatar et informations
- **Localisation** affichee

### Reglages disponibles
- **Langue** : selecteur avec drapeaux (FR/EN/ZH/RU/AR)
- **Localisation** : affichage ville/pays
- **Notifications** : toggle activer/desactiver
- **Mode hors-ligne** : indicateur de statut
- **Apparence** : reglages visuels
- **Securite** : options de securite

### Deconnexion
- **Bouton de logout** en bas de page

---

## 7. Mode test / Mode normal

### Mode test
- **Badge orange "TEST ON"** dans l'AppBar
- **Bandeau orange** sous l'AppBar avec :
  - Nom du scenario actif
  - Bouton "Desactiver"
  - Bouton "Changer" (ouvre le dialogue de selection)
- **6 scenarios selectionnables** dans un dialogue
- **Alertes simulees** (isSimulated = true)
- **DEFCON** fixe a 1 (Urgence)

### Mode normal
- **Badge vert "LIVE"** dans l'AppBar (avec point clignotant)
- **Bandeau vert "MODE REEL"** avec :
  - Nombre d'alertes reelles actives
  - Bouton "Activer TEST" pour revenir en mode test
- **7 alertes reelles** provenant de GDACS, ReliefWeb, SENTINEL
- **DEFCON dynamique** calcule selon la severite max (actuellement DEFCON 3)

### Toggle bidirectionnel
- **Test → Normal** : bouton "Desactiver" dans le bandeau orange
- **Normal → Test** : bouton "Activer TEST" dans le bandeau vert
- **Conservation du scenario** : le scenario selectionne est conserve entre les toggles

---

## 8. Internationalisation (i18n)

### 5 langues supportees
| Code | Drapeau | Langue |
|------|---------|--------|
| `fr` | 🇫🇷 | Francais (langue par defaut) |
| `en` | 🇬🇧 | English |
| `zh` | 🇨🇳 | Zhongwen (chinois) |
| `ru` | 🇷🇺 | Russkij (russe) |
| `ar` | 🇸🇦 | al-Arabiyya (arabe) |

### Ce qui est traduit
- Labels de navigation (6 onglets)
- Titres et descriptions des ecrans
- Alertes (titre FR + EN, descriptions, recommandations)
- Niveaux DEFCON et labels de severite
- Kit de survie (via scenario priorities)
- Section Premium (features, pricing labels)
- Messages systeme (mode test, mode normal)
- Noms de pays (100+ mappings anglais → francais)

### Selecteurs de langue
- **AppBar** : icone drapeau → dialogue de selection
- **SettingsScreen** : tuile de reglage → dialogue de selection

Voir **I18N.md** pour la documentation complete du systeme.

---

## 9. UI/UX mobile

### Optimisations Samsung S9+ (360px)
- **Emojis contraints** dans `SizedBox(width: 28)` pour les ListTile
- **Barre de navigation** : `Expanded` + `maxLines: 1` + `overflow: TextOverflow.ellipsis`
- **Font size** reduit a 9px pour les labels de navigation
- **Icon size** reduit a 20px
- **Grille d'actions** : `childAspectRatio: 1.8`

### SafeArea
- **Contenu principal** enveloppe dans `SafeArea`
- **Bottom navigation** enveloppee dans `SafeArea`
- **Evite le chevauchement** avec la barre de statut et la zone de gestes

### Scroll
- **SingleChildScrollView** sur les ecrans longs (Kit, Premium, Evacuation)
- **ListView.builder** pour les listes d'alertes (performance)

---

## 10. Fonctionnalites planifiees (v2+)

- [ ] API GDACS reelle (RSS XML parsing en temps reel)
- [ ] Integration Solana wallet (Phantom/Backpack) pour paiements reels
- [ ] Geolocalisation temps reel (geolocator actif)
- [ ] Notifications push (Firebase Cloud Messaging)
- [ ] Cache offline (Hive)
- [ ] Partage familial (multi-utilisateurs)
- [ ] Carte OpenStreetMap reelle (flutter_map ou google_maps_flutter)
- [ ] Tests widget et integration
- [ ] Mode sombre
- [ ] Accessibilite (TalkBack, VoiceOver)
