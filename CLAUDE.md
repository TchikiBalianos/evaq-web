# Guide pour Claude Code (ou tout agent IA reprenant le projet)

Tu te trouves dans le **Mega-Monorepo du projet EVAQ** (version 3.0 de l'architecture). 
Ceci est une application hybride de préparation à la survie, alertes géopolitiques et calcul dynamique de plan de fuite.

Avant de proposer des modifications, de coder ou de planifier de l'architecture, **LIS IMPÉRATIVEMENT THE MASTER DOC** situé ici :
👉 `docs/EVAQ_MASTER_DOC.md`

## Structure du Monorepo
Le dépôt principal est divisé en deux parties clientes indépendantes mais fonctionnant sur le même backend :
- `/app` : Application Mobile Native Flutter (iOS/Android). C'est la version de production majeure actuelle (v1.2.1+).
- `/web` : Application Web PWA (Next.js 15). Historiquement la première version développée mais qui reste synchronisée.

## Architecture Data & Intelligence (Backend)
- Les bases de données, l'Auth et les fonctions serverless (Edge Functions) sont centralisées sur **Supabase**.
- Le système de scoring (qui définit les "niveaux DEFCON") possède deux branches :
  - **SCOUT** : Données officielles (GDACS, ReliefWeb, WHO).
  - **SENTINEL** : Signaux faibles et Médias OSINT (Reuters, Telegram etc...).
- Si tu modifies la logique d'alerte, relis la section "Algo de scoring" du Master Doc en premier lieu. Ne modifie pas le NLP sans l'accord express de l'utilisateur.

## Technologies & Features Récentes actives
Si tu es amené à débuguer, l'app possède les modules suivants en production (introduits en v1.2.0 / v1.2.1) :
- Cartes dynamiques MapLibre pour l'évacuation dynamique (avec données de routes OSRM privées).
- Système "RPG Kit" pour le kit de survie (calcul dynamique des besoins du foyer).
- Premium Solana (achats in-app Web3 via crypto-monnaie $SOL).
- i18n native (5 langues).
- Mode Test réactivable : tu devrais voir des routines permettant de mock des alertes Red GDACS.

## Règles de Développement
1. **Toujours préciser sur quel environnement tu interviens** : Si l'utilisateur te demande de modifier l'UI, demande ou vérifie si cela concerne le `/web` ou l'`/app`.
2. **Ne jamais briser la base de données Supabase partagée** sans impacter les deux applications. Si tu ajoutes une colonne sur une table, assure-toi que l'autre application l'ignore gracieusement ou l'exploite.
3. Toujours faire les commits depuis la racine `EVAQ/` (c'est le dossier lié au git principal) pour conserver la trace de tout ce qui a été modifié de façon harmonisée.

L'utilisateur a donné des droits forts pour naviguer. Utilise à volonté les commandes `git` et les outils de lecture de fichiers pour t'imprégner de la base de code existante.
