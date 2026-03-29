# EVAQ — Statut Global

Derniere mise a jour : 2026-03-25

---

## Phase actuelle

**PHASE : v0.9.0 — UX polish + multi-source intelligence**
**Statut : App fonctionnelle sur Vercel. 3 sources de donnees (GDACS + ReliefWeb + SENTINEL), 104 tests, kit anime, routing avec POI.**

```
[x] PHASE 0 — Setup technique (Next.js 16 + Supabase + Vercel)
[x] PHASE 1 — Alertes GDACS + DEFCON + i18n + PWA
[x] PHASE 1b — ReliefWeb (conflits armes, UN OCHA)
[x] PHASE 1c — NLP SENTINEL (RSS 5 sources, 7 dictionnaires menaces)
[x] PHASE 2 — Plan de fuite (MapLibre + OSRM + evacuation intelligente + POI)
[x] PHASE 3 — Kit de survie (CRUD + score + recommandations + fiches conseil)
[x] PHASE 4 — Premium & Stripe (checkout + webhook + portal + paywall)
[x] PHASE 5 — Tests & Validation (104 tests, 10 modules fonctionnels)
[x] UX POLISH — Kit animations, mode expert default, route stops
[ ] Verification disponibilite nom EVAQ (domaines + INPI)
[ ] Contact ACLED (licence commerciale)
[ ] Cles Stripe production (creer compte + produits)
[ ] CGU / avocat
[ ] Beta test 10-20 personnes
```

---

## Sources de donnees actives

| Source | Type | Cron | Couverture |
|--------|------|------|------------|
| GDACS | Catastrophes naturelles | 6h UTC | Mondial (EQ, FL, TC, VO, DR, WF) |
| ReliefWeb | Conflits + crises | 6h30 UTC | 37 pays (armed-conflict, epidemic, etc.) |
| SENTINEL | RSS medias | 6h45 UTC | 5 flux (nucl., conflit, penuries, etc.) |
| Open-Meteo | Vent temps reel | On-demand | Mondial |
| OSRM | Routing | On-demand | Mondial (demo server) |
| Overpass | POI le long route | On-demand | Mondial (OpenStreetMap) |

---

## Blocages actuels

| Blocage | Type | Impact | Action requise |
|---------|------|--------|---------------|
| Licence ACLED | Externe | Eleve | Envoyer email |
| Nom EVAQ | Externe | Eleve | Verifier domaines + INPI |
| Cles Stripe prod | Config | Bloquant paiement | Creer compte Stripe |
| CGU / avocat | Budget | Bloquant lancement | Contacter |
| OSRM demo server | Technique | Limite en prod | VPS self-hosted prevu |

---

## Prochaine action concrete

**Cote technique :**
- Phase 1c NLP : ameliorer dictionnaires, ajouter Telegram scraping
- Phase 6 : Communaute v1.1 (signaux voisinage)
- OSRM self-hosted sur VPS pour production

**Cote admin (rappel vendredi 28/03 19h) :**
- Envoyer email ACLED
- Verifier disponibilite nom EVAQ
- Contacter avocat CGU
- Creer compte Stripe production

---

## Timeline globale

| Phase | Statut |
|-------|--------|
| 0 — Setup | Termine |
| 1 — Alertes GDACS | Termine |
| 1b — ReliefWeb | Termine |
| 1c — SENTINEL RSS | Termine |
| 2 — Plan de fuite | Termine |
| 3 — Kit de survie | Termine |
| 4 — Premium & Stripe | Termine |
| 5 — Tests & Validation | Termine |
| UX Polish | Termine |
| ACLED integration | Bloque (licence) |
| NLP Telegram | Non commence |
| 6 — Communaute v1.1 | Non commence |
| 7 — Flutter v2 | Non commence |

---

## Modele economique

- **Gratuit** : 3 alertes, 1 calcul/jour, 15 items kit
- **One-shot** : packs 1.99-4.99 EUR
- **Mensuel** : 4.99 EUR/mois
- **Annuel** : 34.99 EUR/an (-42%)
