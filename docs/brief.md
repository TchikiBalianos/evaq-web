# EVAQ — Brief Complet (v1.0)

Application de Survie & Alerte — Document d'idéation initial

---

## 1. Noms proposés

- **AEGIS** — Le bouclier de Zeus. Court, puissant, international.
- **SHELD** — Contraction de "Shield". 5 lettres, mémorisable.
- **REAKT** — Jeu sur "React" (réagir). Dynamique, orienté action.
- **EVAQ** — Contraction de "Evacuate". 4 lettres, fort, direct. **Nom retenu.**
- **PREVA** — De "Prevail" + "Prévenir". Fonctionne FR et EN.

---

## 2. Positionnement & Concurrence

Concurrents analysés : FR-Alert (Cell Broadcast, pas une app), Offline Survival Manual (statique, pas d'alertes), HazAdapt (US, pas temps réel), FEMA App (US uniquement).

**USP** : Aucune app existante ne combine alertes géopolitiques temps réel + plan de fuite dynamique + kit de survie personnalisé + réseau communautaire de voisinage.

---

## 3. Architecture Technique

### Stack
- **Frontend** : Flutter (Dart) — cross-platform iOS/Android
- **Backend (BaaS)** : Supabase (tier gratuit) — PostgreSQL, auth, Realtime, Edge Functions, RLS
- **Cartographie** : OpenStreetMap via flutter_map + tuiles OSM (gratuit)
- **Routing** : OSRM (Open Source Routing Machine) — API gratuite ou VPS ~5€/mois
- **Données trafic** : API Point d'Accès National (api.gouv.fr) + Cerema
- **Chat chiffré** : Supabase Realtime + chiffrement E2E client (pointycastle)
- **Notifications push** : Firebase Cloud Messaging (gratuit, illimité)
- **Stockage local offline** : Hive (NoSQL local) + sqflite si besoin

### Sources de données alertes
- **ACLED** — conflits armés, near-real-time, API gratuite avec inscription
- **VIEWS** — prédiction conflits 1-36 mois, Université d'Uppsala, API REST gratuite
- **CrisisWatch** (ICG) — tracker conflits globaux, RSS
- **GDACS** — catastrophes naturelles (UE/ONU), API GeoJSON gratuite, temps réel
- **WHO Disease Outbreak News** — alertes sanitaires, RSS/API
- **NewsAPI** — agrégation médias (100 req/jour gratuit) ou scraping RSS (Reuters, AFP, etc.)

### Algorithme de scoring
Système hybride deux couches :
1. Score statique par source (ACLED=95, GDACS=93, VIEWS=90, Reuters=88...)
2. Score dynamique par recoupement sur fenêtre 2h glissante

`score_final = score_source * 0.4 + score_recoupement * 0.6`

MVP : max 10 sources, recoupement par mots-clés géolocalisés (pas de NLP).

### Système DEFCON
| Niveau | Couleur | Condition |
|--------|---------|-----------|
| 5 — VEILLE | Vert | Aucune menace dans le rayon |
| 4 — ATTENTION | Jaune | Menace même zone large (ex: Europe) |
| 3 — ALERTE | Orange | Menace dans le pays ou <500 km |
| 2 — DANGER | Rouge | Confirmée par 3+ sources, <100 km |
| 1 — URGENCE ABSOLUE | Noir | Impact imminent <6h estimé |

---

## 4. Modules

### Module 1 — Alertes & DEFCON (MVP Core — Gratuit)
Dashboard DEFCON, fil d'actualités filtré géographiquement, notifications push, mode sage 80%, détail des sources.

### Module 2 — Plan de fuite (MVP Core — Sauvegarde offline premium)
Carte OSM interactive, itinéraires OSRM évitant zones de menace, overlay trafic, destinations suggérées selon menace, distinction bombardement vs chimique/nucléaire.

### Module 3 — Kit de survie & Inventaire (MVP Core — Base gratuite, scan premium)
Inventaire manuel, base de connaissances (guide "Tous Responsables" SGDSN 2025, kit 72h, CataKit Croix-Rouge, ICRP), comparaison kit recommandé vs inventaire, rappels péremption (premium), scan photo (premium beta).

### Module 4 — Communauté & Voisinage (MVP v1.1 — post-lancement)
Voisins par proximité (H3 Uber, résolution 7 ~5km²), chat anonyme E2E chiffré, signaux rapides, cercle de confiance bilatéral, organisation de convois (premium avancé).

### Module 5 — Monétisation complémentaire
Affiliation survivalisme, marketplace communautaire (post-MVP), contenu éducatif premium, données anonymisées B2B (RGPD strict), publicité tier gratuit uniquement.

---

## 5. Onboarding

**Obligatoire** : localisation principale, nombre de personnes, acceptation CGU.

**Optionnel** : enfants (âges), animaux, PMR/besoins médicaux, véhicule, étage, compétences.

---

## 6. RGPD & Sécurité

- Géolocalisation : coordonnées converties en index H3 côté client avant envoi (jamais les GPS bruts)
- Données sensibles : chiffrées côté client (clé dérivée du mot de passe), Supabase ne stocke que des blobs chiffrés
- Export/suppression des données : droit RGPD respecté
- Notifications : formulation "Information : selon nos sources..." jamais "ALERTE : vous êtes en danger"
- CGU : rédaction avocat spécialisé (budget 500-1000€)

---

## 7. Roadmap MVP

| Phase | Durée | Dev (toi) | Yévana |
|-------|-------|-----------|--------|
| 0 — Setup | S1-S2 | 15h | 12h |
| 1 — Alertes & DEFCON | S3-S6 | 36h | 24h |
| 2 — Plan de fuite | S7-S10 | 36h | 24h |
| 3 — Kit de survie | S11-S13 | 27h | 18h |
| 4 — Premium & Offline | S14-S16 | 27h | 18h |
| 5 — Tests & Lancement | S17-S18 | 18h | 12h |
| **Total** | **18 semaines** | **159h** | **108h** |

**Rythme** : 9h/semaine toi, 6h/semaine Yévana.

Phase 6 — Communauté (v1.1) : +6-8 semaines post-lancement.

---

## 8. Structure BDD (Supabase/PostgreSQL)

- `users` : id, email, password_hash, h3_index, subscription_tier, onboarding_completed
- `user_profiles` : id, user_id, encrypted_data (blob chiffré côté client)
- `inventory_items` : id, user_id, name, category, quantity, expiry_date
- `alerts` : id, source, scores, threat_type, lat/lon, radius_km, severity, raw_data, timestamps
- `user_alerts` : id, user_id, alert_id, defcon_level_for_user, notified
- `trusted_neighbors` : id, user_id_1, user_id_2, status, shared_info JSON
- `chat_messages` : id, channel_id, sender_id, encrypted_content, iv, created_at
- `survival_knowledge` : id, threat_type, category, title, content_markdown, sources, locale

---

## 9. Coûts estimés mensuels (MVP)

| Service | Coût |
|---------|------|
| Supabase free tier | 0€ |
| OSRM demo server | 0€ (VPS 5€/mois si nécessaire) |
| OSM tiles | 0€ |
| ACLED / GDACS / VIEWS | 0€ |
| Firebase Cloud Messaging | 0€ |
| NewsAPI free | 0€ |
| Apple Developer Account | ~8€/mois |
| Google Play (amorti) | ~2€/mois |
| **Total** | **8-15€/mois** |

---

## 10. Risques & Mitigations

1. **Fausses alertes** → mode sage 80% par défaut, délai 15min confirmation niveau 2+
2. **ACLED accès commercial** → contacter tôt, backup : UCDP (Uppsala)
3. **App perçue anxiogène** → UX rassurante, DEFCON 5 = écran calme et utile
4. **Paywall offline backlash** → stratégie assumée, ajustable après feedback
5. **Complexité chat E2E** → poussé en v1.1, pas dans le MVP

---

## 11. Prochaines étapes immédiates

1. Vérifier disponibilité "EVAQ" (stores, domaines .com/.fr/.app, réseaux sociaux)
2. Créer projet Flutter + projet Supabase + configurer environnement dev
3. S'inscrire aux API : ACLED, GDACS, VIEWS, Firebase
4. Yévana : curation base de connaissances survie (SGDSN, kit 72h, CataKit)
5. Wireframes 3 écrans principaux (Dashboard DEFCON, Carte de fuite, Inventaire kit)
