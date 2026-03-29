# EVAQ — Analyse de Faisabilité & Architecture

Date : 2026-03-22 | Statut : Idéation / Validation

---

## Verdict global

**Faisable. Ambitieux mais réaliste si le scope MVP est respecté.**

Le brief est remarquablement bien structuré pour un document d'idéation. La stack est cohérente, le modèle économique est réaliste, et le positionnement est solide. Les risques identifiés sont les bons. Il y a cependant plusieurs points qui méritent d'être challengés avant de coder la première ligne.

---

## 1. Stack — Validation

### Flutter + Supabase : EXCELLENT CHOIX
- Combinaison battle-tested pour ce type d'app
- Supabase Realtime couvre le besoin de chat sans infrastructure supplémentaire
- RLS (Row Level Security) de PostgreSQL est parfait pour l'isolation des données utilisateur
- **Point d'attention** : les projets Supabase gratuits sont mis en pause après 7 jours d'inactivité. Prévoir un cron job de ping dès le début (c'est 10 lignes de code, mais à ne pas oublier).

### flutter_map + OSM : SOLIDE
- flutter_map est mature et activement maintenu
- FMTC (flutter_map_tile_caching) pour l'offline est bien documenté
- **Risque modéré** : le téléchargement de tuiles offline peut peser lourd en stockage. Il faudra définir des limites claires (rayon max, zoom max) pour ne pas saturer le device.

### OSRM : RISQUE SOUS-ESTIMÉ
- Le serveur de démo OSRM (router.project-osrm.org) a des limites de taux non documentées et peut être instable.
- **En production avec de vrais utilisateurs simultanés, il tombera.**
- Solution : prévoir dès le début un VPS à 5€/mois avec OSRM auto-hébergé (image Docker disponible). C'est un coût marginal mais à budgéter dès le MVP.
- Alternative légère : Valhalla est plus simple à héberger qu'OSRM pour les besoins de base.

### Hive pour le stockage offline : BON CHOIX
- Hive est rapide, zero-config, parfait pour les données structurées offline (kit de survie, plans de fuite, cartes)
- Pas besoin de sqflite en plus sauf cas très spécifique — garder la stack simple

---

## 2. Sources de données — Analyse par source

### GDACS (EXCELLENT — Source principale recommandée)
- API stable, gérée par l'UE/ONU, SLA implicite fort
- GeoJSON natif = intégration directe avec flutter_map
- Couvre séismes, tsunamis, cyclones, inondations, feux
- **Commencer UNIQUEMENT avec GDACS pour le MVP Phase 1.** C'est la source la plus fiable et la plus propre.

### ACLED (BON — Mais risque commercial)
- Données de haute qualité sur les conflits armés
- **Problème critique** : les termes ACLED distinguent usage académique/ONG vs commercial. Une app avec abonnement payant pourrait nécessiter un accord commercial. Contacter ACLED **avant** de construire dessus.
- Backup solide : UCDP (Uppsala Conflict Data Program, university-grade, API ouverte)

### VIEWS (INTERESSANT — Mais complexité cachée)
- C'est de la **prédiction** (1-36 mois), pas du temps réel
- Utile pour la couche "contexte géopolitique" mais pas pour les alertes immédiates
- Ne pas l'intégrer dans le scoring de fiabilité des alertes urgentes — c'est un registre différent
- **Suggestion** : traiter VIEWS comme une couche contextuelle séparée ("risque à long terme") plutôt que comme source d'alerte

### NewsAPI (PROBLEME MAJEUR)
- 100 requêtes/jour en tier gratuit = **inutilisable en production** dès qu'il y a plusieurs utilisateurs
- Le backend fait des requêtes (pas chaque user), donc 100 req/jour partagées entre tous les utilisateurs — ça peut tenir en phase beta très early
- **Recommandation** : remplacer par scraping RSS direct (Reuters, AFP, France24 ont des feeds RSS publics et gratuits). Plus fiable, pas de limite. C'est légèrement plus de code mais beaucoup plus robuste.

### OSINT / CrisisWatch RSS : OK
- Les flux RSS publics sont stables et gratuits
- Attention au respect des CGU de scraping (Reuters/AFP sont stricts)

---

## 3. Algorithme de scoring — Analyse

### Couche 1 (statique) : SIMPLE ET SUFFISANT pour le MVP
Les scores hardcodés par source sont une bonne approximation. Pas de surengineering.

### Couche 2 (recoupement par mots-clés) : SOUS-ESTIMÉ EN COMPLEXITÉ
Croiser des articles de sources différentes sur le même événement par mots-clés géolocalisés est plus difficile qu'il n'y paraît :
- Les noms de lieux varient selon les langues et translittérations ("Kiev" vs "Kyiv")
- Les articles n'ont pas toujours de coordonnées GPS — l'extraction d'entités géographiques demande du NLP même basique
- **Solution pragmatique MVP** : utiliser les coordonnées fournies par GDACS et ACLED (qui géolocalisent déjà leurs événements) et faire le recoupement uniquement sur ces sources structurées. Ignorer le recoupement avec les médias textuels pour le MVP — trop complexe.

### Formule de score
`score_final = score_source * 0.4 + score_recoupement * 0.6` est cohérente.
Attention : si une seule source remonte un événement (recoupement = 0), le score chute mécaniquement à 40%. Il faut gérer ce cas (événement unique mais source ultra-fiable comme GDACS niveau rouge = doit quand même déclencher une alerte).

---

## 4. DEFCON — Analyse

### Logique : SOLIDE
Les 5 niveaux sont clairs et les conditions de déclenchement sont raisonnables.

### Risque UX majeur : la notification de niveau 1
Une notification "type alarme" qui se déclenche au milieu de la nuit pour une menace estimée à <6h mais qui s'avère être une fausse alerte = **désinstallation immédiate et bad reviews**.
- Le délai de confirmation de 15min (mentionné dans les risques) est nécessaire mais insuffisant pour le niveau 1
- **Recommandation** : niveau 1 ne se déclenche QUE si au moins 2 des sources suivantes confirment : GDACS, ACLED + un media. Jamais sur source unique.

### Calcul de distance : côté client = CORRECT
Le device connaît sa position GPS, le serveur envoie les alertes géolocalisées, le device calcule la distance et détermine son niveau DEFCON. C'est privacy-by-design et ça réduit la charge serveur. Bon choix.

---

## 5. RGPD & Sécurité — Analyse

### Géolocalisation H3 : EXCELLENT
L'index H3 résolution 7 (~5km²) est une très bonne approche. La librairie `h3_dart` existe sur pub.dev.
Attention : la résolution 7 donne des hexagones de ~5km² en zone rurale mais l'index peut permettre de déduire l'arrondissement en zone urbaine dense. Pour Paris intra-muros, 5km² = environ 1-2 arrondissements = acceptable.

### Chiffrement côté client : AMBITIEUX
Dériver une clé de chiffrement depuis le mot de passe utilisateur implique :
- Un algorithme de dérivation (PBKDF2 ou Argon2) — disponible dans pointycastle
- Si l'utilisateur change de mot de passe → re-chiffrement de tout le profil
- Si l'utilisateur oublie son mot de passe → **perte définitive des données chiffrées** (pas de récupération possible). Il faut que les CGU et l'UX soient très clairs là-dessus.
- **Recommandation MVP** : pour simplifier, ne chiffrer E2E côté client que les données vraiment sensibles (profil foyer, cercle de confiance). L'inventaire et les plans de fuite peuvent être stockés normalement avec la RLS Supabase (déjà bien sécurisée) pour le MVP, et passer au chiffrement client en v1.1.

### CGU / avocat : INDISPENSABLE
L'estimation 500-1000€ est réaliste. À ne pas négliger — l'app conseille des comportements en cas de danger réel, la décharge de responsabilité est critique.

---

## 6. Timeline — Analyse critique

### Estimation globale : OPTIMISTE de 30-40%
- 18 semaines à 9h/semaine = ~162h de dev
- Flutter pour quelqu'un qui reprend le front après une pause + intégration de 5+ APIs externes = la courbe de friction initiale est réelle
- Phase 1 (alertes) seule pourrait prendre 6-8 semaines au lieu de 4

### Recommandation : revoir le découpage des phases
| Phase | Estimation brief | Estimation réaliste |
|-------|-----------------|---------------------|
| 0 — Setup | 2 semaines | 2 semaines (OK) |
| 1 — Alertes (GDACS only) | 4 semaines | 4-5 semaines |
| 1b — Alertes (ACLED + scoring) | inclus | +2-3 semaines |
| 2 — Plan de fuite | 4 semaines | 5-6 semaines |
| 3 — Kit de survie | 3 semaines | 3 semaines (OK) |
| 4 — Premium & Offline | 3 semaines | 4-5 semaines |
| 5 — Tests & Lancement | 2 semaines | 3-4 semaines |
| **Total réaliste** | 18 semaines | **23-28 semaines** |

**Suggestion** : planifier sur 6 mois plutôt que 4.5 mois. Avec Claude Code, le gain de productivité est réel mais pas infini sur les bugs d'intégration et les edge cases mobiles.

---

## 7. Modèle économique — Analyse

### Stratégie freemium : PERTINENTE
Le choix d'un abonnement pour la sauvegarde offline est défendable. La valeur perçue est réelle (avoir ses plans de fuite sans connexion en cas de crise = exactement quand l'app sert).

### RevenueCat : EXCELLENT CHOIX
Standard de l'industrie, gestion unifiée iOS/Android, analytics inclus. Gratuit sous 2500$/mois de revenus, puis 1% après. Parfait pour le MVP.

### Affiliation survivalisme : RISQUE PERÇU
Proposer des liens d'achat d'équipement de survie dans une app d'alerte peut être perçu comme opportuniste. Le timing (proposition d'achat lors d'une alerte) peut générer des bad reviews.
**Recommandation** : positionner l'affiliation uniquement dans le module "Kit de survie" en mode proactif/préparation (jamais lors d'une alerte active), et clairement labellisé "partenaire recommandé".

### Données B2B anonymisées : RISQUE JURIDIQUE ÉLEVÉ
Même avec consentement et anonymisation, la vente de données de préparation aux crises à des assureurs/collectivités entre dans une zone grise RGPD et peut générer une couverture médiatique négative.
**Recommandation** : retirer cette piste pour le MVP. La remettre sur la table uniquement si un interlocuteur institutionnel la demande explicitement.

---

## 8. Ce qui manque dans le brief

### Stratégie de test des alertes
Comment valider que l'algorithme fonctionne sans attendre une vraie catastrophe ? Il faut un mode "simulation" ou des datasets historiques (GDACS et ACLED ont des archives) pour tester le pipeline end-to-end.

### Gestion des fuseaux horaires et internationalisation
L'app est positionnée comme "internationale" mais le brief est centré IdF/France. Dès que des utilisateurs s'inscrivent depuis d'autres pays :
- Langues des alertes (ACLED est en anglais, GDACS en anglais)
- Fuseaux horaires pour les notifications
- Données locales (trafic, abris) inexistantes hors France

**Recommandation** : MVP France uniquement, expansion internationale en v2.

### Absence totale de tests & CI/CD dans le brief
Le brief mentionne "CI/CD basique" en phase 0 sans détailler. Il faut au minimum :
- GitHub Actions pour les builds Flutter (iOS + Android)
- Tests unitaires pour l'algorithme de scoring (critique — une régression ici = fausses alertes)
- Linting/analyse statique Dart

---

## 9. Simplifications recommandées pour le MVP

Pour réduire la complexité technique et le délai de lancement, voici ce qui peut être simplifié sans dégrader l'USP :

| Feature | Brief | Simplification MVP |
|---------|-------|---------------------|
| Sources d'alerte | GDACS + ACLED + VIEWS + NewsAPI + RSS | **GDACS uniquement** au début |
| Recoupement sources | Algo multi-sources 2h glissant | Score statique par source uniquement |
| Données trafic | API Cerema temps réel | Overlay statique OSM (conditions normales) |
| Chiffrement profil | E2E client (clé dérivée mdp) | RLS Supabase (suffisant pour MVP) |
| Chat E2E | Déjà en v1.1 — OK | Maintenu en v1.1 |
| VIEWS | Prédiction 1-36 mois | Retirer du MVP, ajouter en v1.1 |
| Scan photo inventaire | Beta premium | Retirer du MVP, v1.1 |

Ces simplifications réduisent la Phase 1 de 4-5 à 2-3 semaines et permettent de valider le core loop plus vite.

---

## 10. Ordre de priorité recommandé pour lancer

1. **Valider l'accès commercial ACLED** (email à envoyer avant de coder)
2. **Tester GDACS API manuellement** (Postman/curl) pour comprendre la structure des données
3. **Prototype Flutter minimal** : carte OSM + une alerte GDACS affichée = proof of concept technique en ~1 journée
4. **Wireframes validés** avant de commencer les vrais écrans
5. **CGU / avocat** à lancer en parallèle du dev phase 1 (pas de blocage mais délai à anticiper)

---

## Conclusion

EVAQ est un projet **sérieux et différenciant** avec une architecture bien pensée. Les principaux ajustements recommandés :

- OSRM : prévoir le VPS dès le MVP (~5€/mois)
- NewsAPI : remplacer par RSS direct
- GDACS seul pour la Phase 1 (ajouter ACLED en Phase 1b)
- Timeline : compter 6 mois, pas 4.5
- Chiffrement client : simplifier pour le MVP, complexifier en v1.1
- VIEWS : couche contextuelle séparée, pas source d'alerte
- Données B2B : retirer pour le moment

Le projet tient la route. Le marché est réel (le guide gouvernemental "Tous Responsables" 2025 le confirme). L'USP est défendable. Go.
