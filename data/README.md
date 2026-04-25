# `data/` — Données structurées Knight and Wizard

## Structure

```
data/
├── catalogs/                  # 12 catalogues YAML — Phase 2A (~700 entrées)
│   └── README.md              # Index détaillé des catalogues
└── legacy/                    # Sources brutes non-traitées
    ├── paper/                 # Règles papier originales (PDF/MD/PNG)
    └── web-scraped/           # Site KW.ch scrapé
```

## `catalogs/` — Phase 2A

12 catalogues YAML structurés selon les méta-modèles Phase 1 (R-9.30, R-10.20, R-11.3, R-12.X) :

| Catalogue | Entrées | Couvre |
|---|---:|---|
| [armes.yaml](catalogs/armes.yaml) | 102 | Toutes les armes (mêlée, distance, jet, naturelles, munitions) |
| [protections.yaml](catalogs/protections.yaml) | 60 | 7 catégories d'armures + 11 boucliers + multiplicateurs raciaux |
| [potions.yaml](catalogs/potions.yaml) | 5 | 3 web + 2 paper, schéma `creation_procedure` |
| [champignons.yaml](catalogs/champignons.yaml) | 8 | 14 espèces regroupées par syndrome toxicologique |
| [bestiaire.yaml](catalogs/bestiaire.yaml) | 30 | Tous les races + créatures K&W |
| [nations.yaml](catalogs/nations.yaml) | 29 | 18 paper + 11 ajouts via cartes |
| [religions.yaml](catalogs/religions.yaml) | 70+ | 9 religions, 70+ divinités |
| [organisations.yaml](catalogs/organisations.yaml) | 7 | Maisons divinatoires + Sans Noms |
| [world-map.yaml](catalogs/world-map.yaml) | — | Carte mondiale + liens régionaux |
| [cities-from-maps.yaml](catalogs/cities-from-maps.yaml) | ~280 | Villes extraites des 15 cartes |
| [images.yaml](catalogs/images.yaml) | 29 | Inventaire des fichiers visuels |
| [lore-index.yaml](catalogs/lore-index.yaml) | 6 | Lore narratif référencé |

Voir [`catalogs/README.md`](catalogs/README.md) pour le détail complet.

## `legacy/` — Sources brutes

### `legacy/paper/`
Règles papier originales scannées et extraites :
- PDFs originaux
- Markdown extraits
- Plans (Manoir Rossellini — hors canon, propriété de PJ)

### `legacy/web-scraped/`
Site web KW.ch scrapé (référence uniquement) :
- `documents/` — pages réglementaires web
- `monde/` — cartes et lieux web
- `personnages/` — fiches PJ user-generated (hors canon)
- `accueil/`, `compte/`, `outils/` — pages annexes
- `raw-html/` — HTML brut des pages

⚠️ Les fichiers `legacy/web-scraped/` ne sont pas la source de vérité. Le canon est dans `data/catalogs/` (structuré) et `docs/rules/` (règles).

## Méthodologie d'import (R-10.19)

1. **Phase 1 — Auto** : import depuis legacy avec valeurs inférées
2. **Phase 2 — Ambiguïtés** : table d'ambiguïtés détectées (`*-ambiguites.md`)
3. **Phase 3 — Édition admin** : auteur valide / surcharge
4. **Phase 4 — Migration** : versionning, migration des persos sur évolution

Voir [`docs/HANDOVER.md`](../docs/HANDOVER.md) pour le suivi.
