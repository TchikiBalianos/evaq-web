# EVAQ — Journal de Réflexion

Ce fichier capture les idées explorées, les intuitions, les pistes abandonnées,
et les questionnements en cours. C'est la mémoire "douce" du projet,
par opposition aux décisions formelles (DECISIONS.md).

Format suggéré pour chaque entrée :
```
## [DATE] Titre de la réflexion
Type : [Idée / Exploration / Piste abandonnée / Question de fond]
Statut : [En réflexion / Retenu / Abandonné / Transformé en décision]
...
```

---

## [2026-03-22] Positionnement émotionnel : préparation vs peur

**Type :** Question de fond
**Statut :** En réflexion continue

Le risque principal du projet est d'être perçu comme une app anxiogène qui profite de la peur des gens. Le guide "Tous Responsables" du SGDSN montre que l'État français lui-même pousse ce narrative de préparation — ce qui nous légitime.

Mais il faut garder une boussole claire : **EVAQ n'est pas une app de peur. C'est une app de contrôle.**

La peur naît de l'impuissance face à l'inconnu. EVAQ donne à l'utilisateur un plan, un kit, un réseau — ça réduit la peur. Le DEFCON 5 (aucune menace) doit être un écran apaisé, utile, informatif. L'utilisateur doit vouloir ouvrir l'app même quand il ne se passe rien.

**Implication design :** l'UX doit toujours avoir une action positive à proposer. "Votre kit est complet à 73% — voici ce qu'il manque." C'est rassurant, pas anxiogène.

---

## [2026-03-22] Idée : "Score de préparation" comme gamification positive

**Type :** Idée
**Statut :** Retenu (dans le brief v2, Module 3)

L'inventaire du kit de survie affiche un score de préparation de 0 à 100%.
C'est un mécanisme de gamification positif qui :
- Donne un objectif concret et mesurable à l'utilisateur
- Crée un sentiment de progression
- Incite à revenir dans l'app pour "améliorer son score"
- Est viral potentiellement ("mon score de préparation est de 84%, c'est quoi le tien ?")

Ce score pourrait être partageable (avec un visuel), ce qui serait du marketing organique naturel.

À explorer : est-ce qu'on peut avoir un "classement de zone" (anonyme) qui montre le niveau moyen de préparation des utilisateurs d'une zone H3 ?

---

## [2026-03-22] Question de fond : app payante vs gratuite = tension morale ?

**Type :** Question de fond
**Statut :** Résolu — décision assumée

Il y aura forcément des utilisateurs qui diront "comment tu peux mettre le plan de fuite derrière un paywall quand il y a une crise ?".

La réponse est claire :
1. **Le calcul du plan de fuite est gratuit.** Ce qui est premium, c'est la sauvegarde offline (pour pouvoir l'utiliser sans connexion).
2. En cas de crise réelle (niveau 2-1), le bon sens serait de rendre le mode offline temporairement gratuit. C'est une décision business à prendre le moment venu, mais l'option existe.
3. Sans modèle économique viable, l'app ne peut pas durer. Une app gratuite qui ferme = moins utile qu'une app payante qui reste en ligne.

---

## [2026-03-22] Piste abandonnée : NLP via ChatGPT/Claude API pour le scoring SENTINEL

**Type :** Piste abandonnée
**Statut :** Abandonné

Idée initiale : utiliser GPT-4 ou Claude pour analyser les articles RSS et extraire entités géographiques + niveau de menace. Ce serait plus précis qu'un dictionnaire.

**Pourquoi abandonné :**
- Coût : ~$0.001-0.01 par article. Avec 50 sources RSS × 20 articles/heure = 1000 articles/heure = $1-10/heure = $720-7200/mois. Totalement hors budget.
- Latence : les appels API LLM ajoutent 0.5-3s par article — incompatible avec le temps réel.
- Dépendance : si l'API est indisponible, le pipeline s'arrête.

**Alternative retenue :** dictionnaire de mots-clés + GeoNames pour le MVP, modèle NER open source (HuggingFace, ~100ms/article) en v1.1.

---

## [2026-03-22] Réflexion : la communauté comme moat défensif

**Type :** Exploration stratégique
**Statut :** En réflexion

Les modules 1-3 (alertes, carte, kit) peuvent être copiés par n'importe qui. La vraie barrière à l'entrée, c'est la **communauté** (Module 4).

Un réseau de voisinage de 10 000 personnes en IdF ne peut pas être copié du jour au lendemain. C'est le "moat" défensif de l'app — la raison pour laquelle un concurrent ne peut pas simplement cloner l'app et gagner.

Implication : même si la communauté est en v1.1, elle doit être dans la roadmap publique dès le lancement. Les early adopters doivent comprendre qu'ils contribuent à construire quelque chose qui aura de la valeur pour leur voisinage.

---

## [2026-03-22] Idée : mode "Simulation de crise" pour l'onboarding

**Type :** Idée
**Statut :** À approfondir

Pour que l'utilisateur comprenne la valeur de l'app dès l'onboarding, on pourrait proposer un "mode simulation" : simuler un événement fictif (ex: "séisme magnitude 5.8 à 45km") et montrer comment l'app réagirait.

- Notification simulée → Dashboard DEFCON 3 → Plan de fuite calculé → Kit recommandé affiché
- L'utilisateur voit la valeur concrète AVANT qu'une vraie crise arrive

Risque : si la simulation est trop réaliste, certains utilisateurs peuvent paniquer ou prendre ça pour une vraie alerte. Le mode simulation doit être clairement labellisé avec des bannières "SIMULATION — PAS UNE VRAIE ALERTE" très visibles.

---

## [2026-03-22] Réflexion sur la timeline : les 6 mois sont compressibles

**Type :** Exploration
**Statut :** En réflexion

La timeline de 26 semaines suppose un rythme de 9h/semaine. Avec Claude Code, si certaines semaines permettent 15-20h de travail (vacances, sprint intense), on peut rattraper du retard.

Points de compression naturels :
- Phase 0 : si l'environnement dev est déjà partiellement configuré, peut se faire en 1 semaine
- Phase 3 (kit de survie) : si Yévana prépare le JSON de la base de connaissances en parallèle des Phases 1-2, l'intégration en Phase 3 sera beaucoup plus rapide

Point de friction non-compressible :
- Review App Store : 1-7 jours incompressibles
- Réponse ACLED : 3-7 jours incompressibles
- CGU avocat : 2-4 semaines minimum

---

## [2026-03-22] Question : différenciation vs feature creep

**Type :** Question de fond
**Statut :** En réflexion continue

Le brief est riche en features. Le risque classique = feature creep qui allonge le time-to-market.

Règle à appliquer : **si une feature n'est pas dans les 3 modules core (Alertes, Plan de fuite, Kit), elle peut attendre.**

Test rapide pour chaque idée nouvelle :
1. Est-ce que l'app est utilisable sans cette feature ? → Si oui, c'est v1.1 minimum.
2. Est-ce que cette feature aide l'utilisateur dans les 6 premières heures d'une crise ? → Si oui, c'est peut-être MVP.
3. Est-ce que cette feature peut générer des revenus directement ? → Si oui, évaluer le ROI dev.

---

## [2026-03-22] Réflexion : la notification comme moment de vérité

**Type :** Question de fond
**Statut :** En réflexion

La première vraie notification DEFCON 3 ou 4 que recevra un utilisateur sera un moment de vérité pour l'app. Soit :
a) L'événement était réel et l'app s'est avérée utile → fidélisation maximale
b) L'événement était un faux positif → risque de désinstallation

Le mode Sage (80% par défaut) et le délai de confirmation de 15min existent pour maximiser la probabilité du cas (a). Mais il faut aussi préparer une communication claire en cas de faux positif : une notification de suivi "Mise à jour : l'événement signalé plus tôt n'a pas été confirmé par les sources officielles."

Cette notification de correction est aussi importante que la notification initiale.
