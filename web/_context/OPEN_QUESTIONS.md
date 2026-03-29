# EVAQ — Questions Ouvertes

Questions non encore résolues, classées par priorité.
Quand une question est résolue, la déplacer dans DECISIONS.md.

---

## Priorité CRITIQUE (bloque le développement)

### Q1 — Licence ACLED : usage commercial autorisé ?

**Question :** ACLED autorise-t-il une app mobile avec abonnement payant à utiliser son API ?

**Contexte :** ACLED est gratuit pour usage académique/ONG. Une app freemium avec abonnements premium est-elle considérée "commerciale" selon leurs termes ?

**Impact si refusé :** Toute la Phase 1b repose sur ACLED. Backup = UCDP (qualité similaire, open access).

**Action :** Envoyer cet email à acleddata.com/contact :

```
Objet : API access request — mobile safety application

Hello ACLED team,

I'm developing EVAQ, a mobile application (iOS/Android) that helps citizens
prepare for and respond to geopolitical crises and natural disasters.

The app aggregates data from multiple open sources (GDACS, WHO, UCDP)
and displays it with a reliability scoring system. ACLED data would be
used to cover armed conflicts and political violence events.

The app will be free to download with an optional premium subscription
(€4.99/month) for offline features like map caching and evacuation plan saving.
No revenue comes from the data itself.

Questions:
1. Is this use case covered by your standard free license?
2. If not, what are the commercial licensing terms?

Thank you for your consideration.
[Nom]
```

**Délai de réponse attendu :** 3-7 jours ouvrables.

---

## Priorité HAUTE (à décider avant de commencer à coder)

### Q2 — Nom EVAQ disponible ?

**Question :** Est-ce que "EVAQ" est disponible sur les stores iOS, Android, et les domaines ?

**Action :** Vérifier manuellement :
- [ ] App Store Connect (appstoreconnect.apple.com)
- [ ] Google Play Console (play.google.com/console)
- [ ] evaq.com (whois)
- [ ] evaq.fr (whois)
- [ ] evaq.app (whois)
- [ ] @evaqapp sur Instagram, Twitter, TikTok

**Fallback si pris :** SHELD (shield contracté), REAKT, ou PREVA.

---

### Q3 — OSRM vs Valhalla : quel routing engine ?

**Question :** OSRM ou Valhalla pour le VPS de routing ?

**Contexte :** Les deux sont open source et basés sur OpenStreetMap. OSRM est plus populaire mais Valhalla est parfois décrit comme plus simple à installer et à maintenir.

**Points de comparaison à évaluer :**

| Critère | OSRM | Valhalla |
|---------|------|---------|
| Mémoire RAM requise | ~8GB pour France | ~4GB pour France |
| Temps de processing des données OSM | ~2-3h | ~30min |
| API compatibility | Propre API REST | Propre API REST |
| Package Dart existant | `osrm` (pub.dev) | Aucun dédié |
| Maintenance | Active | Active |
| Coût VPS recommandé | CX21 (4GB RAM, ~7€/mois) | CX11 (2GB RAM, ~5€/mois) |

**Action :** Tester les deux en local avec Docker avant de décider.

---

### Q4 — Hébergement des tuiles OSM : OSM standard vs Maptiler ?

**Question :** Utiliser les tuiles OSM standard (gratuites) ou un CDN comme Maptiler (~10€/mois) pour la production ?

**OSM standard :** Gratuit mais "fair use" — pas de SLA, pas de garantie de disponibilité. Pour un usage MVP avec peu d'utilisateurs, ça suffit.

**Maptiler :** ~10€/mois pour 10k tiles/mois, SLA meilleur, performance supérieure.

**Décision recommandée :** OSM standard pour le MVP, passer à Maptiler si l'app décolle et si des problèmes de performance apparaissent.

**Statut :** Décision par défaut prise — à valider lors de la Phase 0.

---

## Priorité MOYENNE (à décider avant la phase concernée)

### Q5 — Whitelist Telegram OSINT : quels canaux ?

**Question :** Quels canaux Telegram OSINT sont suffisamment fiables pour être whitelistés ?

**Contexte :** Le mode SENTINEL intégrera les canaux Telegram comme source de signaux faibles. Seuls des canaux validés manuellement seront inclus.

**Critères de validation :**
- Ancienneté > 6 mois
- Citations régulières par des médias établis
- Ratio actualités vérifiées vs désinformation élevé
- Pas de biais idéologique fort

**Canaux proposés à évaluer (non validés) :**
- OSINTdefender
- Intel_GEN (@ à vérifier)
- War Monitor
- Bellingcat (ont-ils un canal Telegram ?)
- The Intel Crab

**Action (Yévana) :** Recherche et évaluation de 10-15 canaux candidats, avec scoring selon les critères. Résultat = liste de 5-10 canaux whitelist initiaux.

---

### Q6 — Architecture NLP SENTINEL : Edge Functions ou microservice séparé ?

**Question :** Le pipeline NLP SENTINEL (ingestion RSS + extraction entités + scoring) doit-il tourner dans les Edge Functions Supabase ou dans un microservice Python séparé ?

**Contexte :**
- **Edge Functions (Deno/TypeScript)** : intégré à Supabase, zéro coût supplémentaire, mais moins performant pour du traitement textuel intensif. Suffisant pour dict+regex.
- **Microservice Python (FastAPI sur VPS)** : plus puissant (accès aux librairies NLP Python comme spaCy, HuggingFace), mais ~5€/mois supplémentaires et plus de maintenance.

**Décision recommandée :** Edge Functions pour le MVP (dict+regex = léger), microservice Python en v1.1 si on passe à des modèles NER réels.

**Statut :** Décision par défaut prise — à valider lors de la Phase 1c.

---

### Q7 — Authentification : email/password seul ou aussi OAuth ?

**Question :** L'onboarding doit-il proposer la connexion via Google/Apple en plus de l'email ?

**Pour :**
- Friction réduite à l'inscription (surtout Apple Sign In, obligatoire sur iOS si on propose d'autres OAuth)
- Plus de comptes créés

**Contre :**
- Apple Sign In peut masquer l'email réel → complique le contact utilisateur
- Complexité supplémentaire en Phase 0

**Note Apple :** Si une app iOS propose Sign in with Google, elle DOIT aussi proposer Sign in with Apple (règle App Store). Si on propose uniquement email/password, pas d'obligation.

**Décision recommandée MVP :** Email/password uniquement pour simplifier. Ajouter Apple Sign In en v1.1.

**Statut :** Décision par défaut — à confirmer lors de la Phase 0.

---

### Q8 — Stratégie de modération du chat communautaire

**Question :** Comment modérer le chat anonyme de zone en v1.1 ?

**Contexte :** Le chat est anonyme — des contenus problématiques pourraient être postés sans responsabilité clairement identifiable.

**Options :**
1. **Modération réactive uniquement** (signalement utilisateur) — simple, peu coûteux
2. **Modération automatique** (filtre de mots-clés) — implémentable en Edge Function
3. **Modération humaine** — coûteux, non viable au démarrage

**Décision recommandée :** Modération réactive + filtre automatique de mots-clés (hate speech basique). Mentionner dans les CGU les règles d'utilisation et la possibilité de suppression de compte.

**Statut :** À décider avant la Phase 6 (Communauté v1.1).

---

## Priorité BASSE (à décider plus tard)

### Q9 — Scan photo inventaire : quel modèle de vision ?

**Question :** Google Vision API ou HuggingFace (modèle open source) pour la reconnaissance d'objets dans le scan photo ?

**Contexte :** Feature beta premium de v1.1. Pas critique pour le MVP.

**À évaluer en son temps :** Coût par requête, précision sur les objets de survie, langues supportées.

---

### Q10 — Données d'abris souterrains : source officielle ou curation manuelle ?

**Question :** Y a-t-il une API ou un dataset officiel des abris souterrains en France ?

**Contexte :** Le plan de fuite en cas de bombardement doit recommander des abris souterrains proches (stations de métro, parkings couverts).

**Piste :** La RATP a des données open data sur les stations. Les parkings peuvent être issus d'OSM. La Mairie de Paris a-t-elle des données sur les abris ? À vérifier.

**Action (Yévana) :** Recherche de sources de données sur les abris en IdF. Sinon : curation manuelle des principales stations de métro profondes + parkings souterrains majeurs.

---

### Q11 — Politique de rétention des messages chat

**Question :** Quelle durée de conservation pour les messages du chat communautaire ?

**Options :** 24h / 72h / 7 jours / jusqu'à suppression manuelle

**Recommandation :** 72h par défaut (suffisant pour la coordination en cas de crise, limite les données stockées).

**Statut :** À décider avant Phase 6.
