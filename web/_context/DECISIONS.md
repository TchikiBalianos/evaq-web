# EVAQ — Log des Décisions

Toute décision architecturale ou stratégique significative est loggée ici avec sa date,
son contexte et sa justification. Ne pas supprimer les décisions — ajouter "RÉVISÉE" si changement.

Format :
```
## [DATE] TITRE DE LA DÉCISION
**Décision :** ...
**Contexte :** ...
**Alternatives écartées :** ...
**Justification :** ...
**Impact :** ...
```

---

## [2026-03-22] Stack principale : Flutter + Supabase

**Décision :** Flutter (Dart) pour le frontend mobile, Supabase pour le backend (BaaS).

**Contexte :** Application mobile cross-platform avec besoin de fonctionnement offline, de notifications push, de cartographie, et d'une base de données avec auth intégrée.

**Alternatives écartées :**
- React Native + Expo : moins bon support offline, performances cartographie inférieures
- Kotlin/Swift natif : deux codebases à maintenir, trop coûteux en temps
- Firebase seul : moins flexible que Supabase (PostgreSQL > Firestore pour les requêtes complexes)

**Justification :** Flutter = une codebase pour iOS et Android, support offline natif excellent (Hive, FMTC), large écosystème de packages pour cartographie et chiffrement. Supabase = PostgreSQL managé avec RLS, Realtime pour le chat, Edge Functions pour la logique serveur. Combinaison battle-tested pour ce type d'app.

**Impact :** Décision centrale — toute l'architecture en découle.

---

## [2026-03-22] Routing : OSRM self-hosted VPS (pas le serveur de démo)

**Décision :** Héberger OSRM sur un VPS à ~5€/mois dès le MVP.

**Contexte :** Le serveur de démo OSRM public a des limites de taux non documentées et une disponibilité non garantie.

**Alternatives écartées :**
- Serveur de démo OSRM : non viable en production (tombera avec plusieurs utilisateurs simultanés)
- Mapbox Directions API : payant (~$0.004/requête), pas adapté au budget contraint
- Google Maps Directions : payant, dépendance forte

**Justification :** À 5€/mois (Hetzner CX11), c'est marginal dans le budget. OSRM Docker = maintenance quasi-nulle. Valhalla est une alternative à évaluer (plus simple à installer).

**Impact :** +5€/mois dans les coûts. Budget total MVP : ~15€/mois.

---

## [2026-03-22] Cartographie offline : FMTC avec limites strictes

**Décision :** Utiliser flutter_map_tile_caching (FMTC) pour le mode offline avec limites définies : rayon max 150km, zoom max niveau 14, taille max 500MB par device.

**Contexte :** Feature premium — les utilisateurs veulent accéder aux cartes sans connexion en cas de crise.

**Justification :** Sans limites, le cache peut dépasser plusieurs GB et saturer le stockage du device. Les limites définies couvrent le besoin (150km autour du domicile = zone de fuite réaliste) sans être trop restrictives.

**Impact :** UX à gérer (expliquer les limites à l'utilisateur lors du téléchargement).

---

## [2026-03-22] Géolocalisation : H3 Uber résolution 7

**Décision :** Stocker uniquement l'index H3 résolution 7 (~5km²) en base, jamais les coordonnées GPS exactes.

**Contexte :** Privacy by design — éviter de stocker des données de localisation précises.

**Justification :** H3 résolution 7 = hexagones de ~5km². Suffisamment précis pour le matching communautaire et les alertes géographiques. En milieu urbain dense (Paris), cela représente 1-2 arrondissements — acceptable. La conversion GPS → H3 se fait côté client.

**Alternative écartée :** Stocker lat/lon et anonymiser via bruit aléatoire (moins robuste juridiquement que H3).

**Impact :** Architecture client/serveur : le device fait les calculs de distance, le serveur n'a qu'un index de zone.

---

## [2026-03-22] Chiffrement données sensibles : RLS Supabase pour MVP, E2E client en v1.1

**Décision :** MVP utilise la RLS PostgreSQL de Supabase pour l'isolation des données. Le chiffrement côté client (clé dérivée du mot de passe) est reporté en v1.1.

**Contexte :** Le chiffrement client implique qu'un mot de passe oublié = perte définitive des données. L'UX et la communication autour de ça sont complexes.

**Justification :** La RLS Supabase est robuste et suffisante pour le MVP. Elle garantit qu'aucun utilisateur ne peut accéder aux données d'un autre, et Supabase en tant que service est considéré de confiance. Le chiffrement E2E client sera activé en v1.1 pour les données les plus sensibles (profil foyer, cercle de confiance).

**Impact :** Simplification significative de la Phase 0-1. Réduction du risque de perte de données utilisateur.

---

## [2026-03-22] NLP : deux modes distincts — SCOUT (structuré) + SENTINEL (médias/réseaux sociaux)

**Décision :** L'algorithme de détection s'articule en deux couches indépendantes :
- **SCOUT** : recoupement sur sources structurées géolocalisées (GDACS, ACLED, UCDP)
- **SENTINEL** : analyse flux RSS médias + réseaux sociaux (Telegram, Mastodon, Reddit)

**Contexte :** L'utilisateur veut la détection précoce via médias ET réseaux sociaux, mais cette couche est moins fiable que les sources structurées.

**Justification :** Séparer les deux modes permet de :
- Attribuer un score de confiance distinct à chaque mode
- Interdire au SENTINEL seul de déclencher un DEFCON 2 ou 1 (trop de risque de faux positifs)
- Développer les deux couches indépendamment sans blocage mutuel
- Afficher clairement à l'utilisateur si une alerte est "confirmée" ou "signal précoce"

**MVP NLP technique :** dictionnaire de mots-clés (FR + EN) + dictionnaire géographique GeoNames (regex), implémenté en Edge Functions Supabase (Deno/TypeScript). Pas de modèle ML pour le MVP.

**Impact :** Feature différenciante majeure. Complexité technique modérée pour le MVP (dict+regex), évolutive vers NER/ML en v1.1.

---

## [2026-03-22] Sources d'alerte : GDACS seul en Phase 1, ACLED en Phase 1b (si licence OK)

**Décision :** Phase 1 démarre avec GDACS uniquement. ACLED ajouté en Phase 1b après confirmation de la licence commerciale.

**Contexte :** ACLED a des conditions d'accès qui distinguent usage académique vs commercial. Une app avec abonnement payant pourrait être considérée commerciale.

**Alternatives écartées :** Coder autour d'ACLED sans confirmer la licence (risque de devoir tout refactorer si accès refusé).

**Backup si ACLED refuse :** UCDP (Uppsala Conflict Data Program) — qualité similaire, open access.

**Impact :** Email à envoyer à ACLED en priorité. Ne pas démarrer Phase 1b avant réponse.

---

## [2026-03-22] NewsAPI remplacé par RSS direct

**Décision :** Pas de NewsAPI. Scraping RSS direct sur les agences et médias.

**Contexte :** NewsAPI free tier = 100 requêtes/jour partagées entre tous les utilisateurs — inutilisable en production.

**Justification :** Les flux RSS publics sont gratuits, stables, et sans limite documentée. Reuters, France24, BBC, Le Monde, RFI, BFMTV, Al Jazeera ont tous des flux RSS publics.

**Impact :** Un peu plus de code (parsing RSS vs appel API unifié), mais beaucoup plus robuste et économique.

---

## [2026-03-22] Twitter/X exclu du MVP

**Décision :** Twitter/X API non intégrée dans le MVP.

**Contexte :** L'API gratuite est limitée à 500 tweets lus/mois depuis 2023. L'API Basic coûte $100/mois.

**Justification :** Budget incompatible avec le MVP. Les flux RSS + Telegram + Mastodon couvrent les besoins de signal early warning sans Twitter.

**Révision possible :** Si l'app génère des revenus suffisants, intégrer Twitter/X API Basic en v1.1 (~90€/mois).

**Impact :** Aucun sur le MVP. À réévaluer à 6 mois.

---

## [2026-03-22] VIEWS : couche contextuelle séparée, pas source d'alerte

**Décision :** VIEWS (prédiction conflits 1-36 mois) est une couche contextuelle affichée dans un onglet "Risques à long terme" séparé. Elle ne contribue PAS à l'algorithme de scoring des alertes immédiates.

**Contexte :** VIEWS prédit des conflits sur 1-36 mois, registre temporel incompatible avec les alertes temps réel.

**Justification :** Mixer une prévision à 36 mois avec des données temps réel fausserait le score de fiabilité des alertes. Les afficher séparément est plus honnête et plus utile pour l'utilisateur.

**Impact :** VIEWS reporté en v1.1 (onglet dédié). Phase 1 non impactée.

---

## [2026-03-22] Données B2B anonymisées : exclues

**Décision :** La piste "vente de données anonymisées à des assureurs/collectivités" est définitivement écartée pour le MVP.

**Contexte :** Même avec consentement et anonymisation, la vente de données de préparation aux crises est dans une zone grise RGPD et peut générer une couverture médiatique négative.

**Justification :** Risque juridique + perception négative > bénéfice financier. La monétisation principale (abonnements + affiliation) est suffisante.

**Impact :** Aucun sur le développement. À ne pas remettre sur la table sauf si demande institutionnelle directe.

---

## [2026-03-23] Nom définitif : EVAQ

**Décision :** Le nom EVAQ est acté. Les alternatives (AEGIS, SHELD, REAKT, PREVA) sont abandonnées.

**Justification :** Court, actionnable, international. Le "Q" final le rend distinctif et mémorisable sur les stores. Contraction de "Evacuate" — évoque immédiatement l'action sans être anxiogène. Fonctionne en français comme en anglais.

**Impact :** Supprimer toute mention des alternatives dans les documents du projet. Vérifier la disponibilité du nom (stores, domaines, INPI) en priorité.

---

## [2026-03-23] Pivot architectural : v1 Web/PWA (Next.js + Vercel), Flutter en v2

**Décision :** La v1 MVP est une application web responsive / PWA déployée sur Vercel (Next.js 15). La version native Flutter est reportée en v2.

**Contexte :** Le développement Flutter implique setup Xcode/Android Studio, cycle de build long, soumission aux stores (review 1-7 jours Apple), compte développeur ($99/an Apple). Le web/PWA supprime toutes ces frictions.

**Alternatives écartées :**
- Flutter dès la v1 : trop de friction pour valider rapidement. Review App Store = bloquant pour les correctifs urgents.
- React Native + Expo : Expo Go permet le test rapide mais la PWA est plus accessible aux utilisateurs (pas d'app à télécharger).

**Justification :**
- Vercel : push = déploiement en 30 secondes, zéro friction
- PWA installable sur iOS et Android depuis le navigateur (expérience quasi-native)
- Pas de compte Apple Developer pour le MVP (~8€/mois économisés)
- Itérations ultra-rapides pour valider le PMF
- 100% du backend Supabase réutilisé par Flutter v2 sans modification
- SEO possible sur les pages de contenu (base de connaissances, landing)

**Stack remplacée :**
- flutter_map → MapLibre GL JS via react-map-gl
- FMTC → Service Worker + Workbox (offline plus limité, acceptable pour v1)
- Firebase Cloud Messaging → Web Push API + VAPID
- RevenueCat → Stripe Billing
- Hive → IndexedDB via idb
- dart_rss → parsing RSS en Edge Functions Deno

**Impact :** Timeline réduite de ~26 à ~20 semaines. Lancement v1 cible : Août 2026 vs Septembre 2026.

---

## [2026-03-23] Modèle économique : ajout de packs one-shot entre gratuit et abonnement

**Décision :** Introduire des achats ponctuels (one-shot) thématiques entre le tier gratuit et l'abonnement.

**Contexte :** Le saut de 0€ à 4.99€/mois peut être une barrière pour certains utilisateurs. Un utilisateur qui se prépare ponctuellement (ex: tension géopolitique locale) n'a pas nécessairement besoin d'un abonnement permanent.

**Packs définis :**
- Pack Alerte : 1.99€ (alertes illimitées + historique 30 jours, durée 30 jours)
- Plan de fuite complet : 2.99€ (calculs illimités + 1 plan offline, durée 90 jours)
- Pack Kit : 1.99€ (inventaire illimité + toutes fiches, à vie)
- Pack Préparation : 4.99€ (tout ci-dessus, durée 30 jours)

**Logique de conversion :** le Pack Préparation à 4.99€ coûte autant que l'abonnement mensuel → incite à prendre l'abonnement à la 2ème utilisation.

**Offre gratuite réduite volontairement :** 3 alertes visible, 1 calcul de fuite/jour, 15 items d'inventaire max. La friction doit être ressentie.

**Implémentation Stripe :** packs = `payment_intent` (paiement unique) avec date d'expiration stockée dans `subscription_tier` (JSON avec type + pack_id + expires_at).

**Impact :** Augmente la surface de monétisation. Un utilisateur qui n'achète qu'un Pack Kit à 1.99€ est quand même monétisé. À implémenter en Phase 4.

---

## [2026-03-23] Audit complet brief v2 → v3 : simplifications validées

**Décision :** Audit complet du brief v2 réalisé. Corrections et simplifications validées par le porteur de projet.

**Corrections appliquées (incohérences techniques) :**
- `subscription_tier` : valeurs 'daily'|'weekly'|'monthly'|'yearly' → 'free'|'monthly'|'yearly' + `active_packs JSONB`
- Références Flutter (flutter_map, Hive, FMTC, FCM, RevenueCat, pointycastle) supprimées du contexte v1 web
- AdMob → AdSense pour le tier gratuit v1 (AdMob = mobile natif uniquement)
- OSRM/Flutter dans Section 8 Module 2 → réécriture feature-first sans stack specifique
- Section 17 : Flutter SDK/Android Studio → Node.js 20 + `create-next-app`
- Section 17 : Firebase FCM → clés VAPID pour Web Push
- Risque R5 (App Store) annoté "(v2 Flutter)" — non applicable à la v1 PWA

**Simplifications validées :**
- Onboarding : 7 écrans → 5 (écrans 3+4 fusionnés en "Mon foyer")
- Section 2 checklist : déplacée vers section 17 (une seule source de vérité)
- Mastodon : exclu du MVP → listé explicitement en v1.1 (communauté)
- Annexes B/C/D supprimées (doublons) → pointer vers `_context/` pour le contenu vivant
- Stratégie de test des alertes : section dédiée ajoutée (15.3) avec fixtures, métriques SENTINEL, critères de succès

**Impact :** Brief v3 cohérent, zéro référence obsolète Flutter dans le contexte v1, test strategy complète.

---

## [2026-03-22] MVP France uniquement (pas d'i18n)

**Décision :** Le MVP est ciblé France uniquement. Pas d'internationalisation (i18n) dans un premier temps.

**Contexte :** Les données complémentaires (trafic Cerema, abris souterrains IdF, zones sûres autour de Paris) sont centrées France. La gestion des fuseaux horaires et des langues d'alertes ajoute une complexité inutile pour le MVP.

**Justification :** Valider le product-market fit en France avant l'expansion. Les sources d'alerte (GDACS, ACLED) sont internationales par nature — l'expansion géographique sera facile ensuite.

**Impact :** Simplifie les données de la Phase 2 (plan de fuite) et limite la curation Yévana à l'IdF + France.
