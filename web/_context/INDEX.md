# EVAQ — Index Mémoire Projet

Ce dossier `_context/` est la mémoire de réflexion du projet EVAQ.
À lire en début de session avant de travailler sur le projet.

**Convention :** chaque fichier a un préfixe qui indique son type.
Mettre à jour l'index à chaque ajout de fichier.

---

## Fichiers actifs

| Fichier | Type | Contenu | Dernière MAJ |
|---------|------|---------|-------------|
| [INDEX.md](INDEX.md) | Navigation | Ce fichier | 2026-03-22 |
| [STATUS.md](STATUS.md) | Statut global | Phase actuelle, blocages, prochaine action | 2026-03-22 |
| [DECISIONS.md](DECISIONS.md) | Décisions archi | Log des choix techniques avec justification | 2026-03-22 |
| [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) | Questions ouvertes | Ce qui n'est pas encore décidé | 2026-03-22 |
| [REFLEXIONS.md](REFLEXIONS.md) | Journal de réflexion | Idées, explorations, pistes abandonnées | 2026-03-22 |
| [BUILD_LOG.md](BUILD_LOG.md) | Build log | Progression technique, snapshots de versioning | 2026-03-23 |

## Documents de référence (dossier docs/)

| Fichier | Contenu |
|---------|---------|
| [../docs/brief-complet-v2.md](../docs/brief-complet-v2.md) | Brief complet v2 — source de vérité principale |
| [../docs/brief.md](../docs/brief.md) | Brief initial v1 (archivé) |
| [../docs/analyse-faisabilite.md](../docs/analyse-faisabilite.md) | Analyse de faisabilité initiale (intégrée dans v2) |

---

## Routine de début de session

Avant de travailler sur EVAQ :
1. Lire **STATUS.md** → Savoir où on en est
2. Lire **OPEN_QUESTIONS.md** → Savoir ce qui est en suspens
3. Consulter **DECISIONS.md** si une décision technique est questionnée

## Routine de fin de session

Après avoir travaillé sur EVAQ :
1. Mettre à jour **STATUS.md** (phase, blocages, prochaine action)
2. Logger toute nouvelle décision dans **DECISIONS.md**
3. Déplacer les questions résolues de OPEN_QUESTIONS vers DECISIONS
4. Ajouter les réflexions notables dans **REFLEXIONS.md**
