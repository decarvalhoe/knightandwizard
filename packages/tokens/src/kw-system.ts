// Knight & Wizard — source du design system (dossier complet).
// Extrait des 5 planches Claude Design validées (2026-05-22) — voir docs/design/boards/.
// Architecture (cf. docs/design/DA-MATRICES.md §15) :
//   ENGINE (agnostique : schéma, géométrie, échelle, signature dé/destin)
//   + PACK de setting « Terres Oubliées » (base partagée)
//   + SKINS par surface (accent + triple de polices + composant hero).
// Un autre univers = un autre PACK sur le même ENGINE.

export type Mode = 'jour' | 'veillee';
export type SkinId = 'grimoire' | 'registre' | 'tripot' | 'archives' | 'bibliotheque';

/** Rôles sémantiques de couleur — schéma partagé par tous les skins. */
export const SEMANTIC_ROLES = [
  'bg-canvas',
  'bg-surface',
  'bg-elevated',
  'text-ink',
  'text-muted',
  'border-hairline',
  'border-rule',
  'accent',
  'accent-2',
  'fb-success',
  'fb-warn',
  'fb-danger',
  'fb-info'
] as const;
export type SemanticRole = (typeof SEMANTIC_ROLES)[number];

/** ENGINE — agnostique (aucune couleur/police de setting). */
export const engine = {
  geometry: {
    radiusRect: '0px',
    radiusDisc: '9999px',
    borderHairline: '1.5px',
    borderStrong: '2.5px',
    shadowCard: '4px 4px 0',
    shadowButton: '0 2px 0',
    grain: { filter: 'feTurbulence', blend: 'multiply' }
  },
  type: {
    ratio: 1.25,
    size: {
      cote: '0.6875rem', // 11px
      'label-sm': '0.6875rem',
      'body-m': '1rem', // 16px
      'body-l': '1.125rem', // 18px
      'title-m': '1.5rem', // 24px
      'title-l': '1.875rem' // 30px
    },
    label: { size: '0.6875rem', tracking: '0.14em', transform: 'uppercase' },
    lineHeight: { tight: 1.2, normal: 1.5 }
  },
  // Signature dé/destin universelle (présente quel que soit l'univers).
  dice: {
    size: '34px',
    border: '1.5px',
    success: 'ink-fill', // .s
    critical: 'accent-fill', // .t
    one: 'red-italic', // .o
    cascade: 'dashed', // .casc
    cascadeGlyph: '↪',
    oneColor: '#6E1414',
    rule: 'le LLM suggère, le moteur arbitre, le destin tire au cent.'
  }
} as const;

/**
 * PACK « Terres Oubliées » — base partagée.
 * La rampe Veillée (nuit) est IDENTIQUE sur les 5 skins ; seul l'accent (et le
 * canvas du Tripot) diverge en nuit. Le feedback Jour est constant.
 */
export const toBase = {
  veillee: {
    'bg-canvas': '#15110A',
    'bg-surface': '#1F1810',
    'bg-elevated': '#2A2218',
    'text-ink': '#E8D9B0',
    'text-muted': '#9A8056',
    'border-hairline': '#453825',
    'border-rule': '#605036',
    'fb-success': '#92B098',
    'fb-warn': '#DDB060',
    'fb-danger': '#C75044',
    'fb-info': '#7C9FBE'
  },
  jourFeedback: {
    'fb-success': '#3A4F1F',
    'fb-warn': '#A8721E',
    'fb-danger': '#6E1414',
    'fb-info': '#1F4870'
  },
  fonts: { body: "'EB Garamond', Georgia, serif", mono: "'Courier Prime', monospace" }
} as const;

/** SKINS par surface — accent + lights propres + triple de polices + hero. */
export const skins = {
  grimoire: {
    surface: 'Sorts & magie',
    jour: {
      'bg-canvas': '#EFE2BC',
      'bg-surface': '#FAF3DE',
      'bg-elevated': '#FFFBE8',
      'text-ink': '#1F1810',
      'text-muted': '#5A4830',
      'border-hairline': '#BAA478',
      'border-rule': '#1F1810',
      accent: '#7B5618',
      'accent-2': '#8B2018'
    },
    veilleeAccent: { accent: '#B8862F', 'accent-2': '#C75044' },
    fonts: {
      display: "'Cormorant Garamond', serif",
      body: "'EB Garamond', Georgia, serif",
      label: "'Cormorant SC', serif"
    },
    hero: 'spell-statblock'
  },
  registre: {
    surface: 'Combat / Tracker DT',
    jour: {
      'bg-canvas': '#E8DCB8',
      'bg-surface': '#F2E8C8',
      'bg-elevated': '#FAF3DE',
      'text-ink': '#0F0A04',
      'text-muted': '#5C4A30',
      'border-hairline': '#A8946A',
      'border-rule': '#1F1812',
      accent: '#264874',
      'accent-2': '#8B2418'
    },
    veilleeAccent: { accent: '#7C9FBE', 'accent-2': '#C75044' },
    fonts: {
      display: "'Big Shoulders Display', sans-serif",
      body: "'Bitter', Georgia, serif",
      label: "'Big Shoulders Display', sans-serif"
    },
    hero: 'dt-timeline'
  },
  tripot: {
    surface: 'Lancer de dés',
    jour: {
      'bg-canvas': '#1E3328', // feutre vert
      'bg-surface': '#FAF3DE',
      'bg-elevated': '#FFFBE8',
      'text-ink': '#100A04',
      'text-muted': '#5A4830',
      'border-hairline': '#BAA478',
      'border-rule': '#1F1810',
      accent: '#C58A2A',
      'accent-2': '#6E1414'
    },
    veilleeCanvas: '#0E1B14', // le canvas (feutre) diverge en nuit
    veilleeAccent: { accent: '#D89148', 'accent-2': '#C75044' },
    fonts: {
      display: "'Playfair Display', serif",
      body: "'EB Garamond', serif",
      label: "'Special Elite', monospace"
    },
    hero: 'dice-result+d100-roulette'
  },
  archives: {
    surface: 'Lecteur de règles D1-D13',
    jour: {
      'bg-canvas': '#ECE2BE',
      'bg-surface': '#F8F3E0',
      'bg-elevated': '#FFFBE8',
      'text-ink': '#1A140A',
      'text-muted': '#5C4A30',
      'border-hairline': '#D8C8A6',
      'border-rule': '#1A140A',
      accent: '#8B2018',
      'accent-2': '#1F3A55'
    },
    veilleeAccent: { accent: '#C75044', 'accent-2': '#7C9FBE' },
    fonts: {
      display: "'Libre Caslon Display', serif",
      body: "'Source Serif 4', Georgia, serif",
      label: "'Courier Prime', monospace"
    },
    hero: 'law-article'
  },
  bibliotheque: {
    surface: 'CMS regles vivantes',
    jour: {
      'bg-canvas': '#E8DFC5',
      'bg-surface': '#F5EDD2',
      'bg-elevated': '#FBF5E2',
      'text-ink': '#1F1810',
      'text-muted': '#5A4830',
      'border-hairline': '#D5C8A0',
      'border-rule': '#1F1810',
      accent: '#5C2A6A',
      'accent-2': '#B68842'
    },
    veilleeAccent: { accent: '#9C6FBE', 'accent-2': '#D89148' },
    fonts: {
      display: "'Cormorant SC', serif",
      body: "'EB Garamond', serif",
      label: "'Courier Prime', monospace"
    },
    hero: 'versioning-form'
  }
} as const;

/** 11 écoles de magie = 11 couleurs (canon D8 R-8.3 / Grand Grimoire). */
export const schools = {
  abjuration: { label: 'Abjuration', color: '#C9A52A' },
  alteration: { label: 'Altération', color: '#B0432E' },
  blanche: { label: 'Magie blanche', color: '#E0D6B8' },
  divination: { label: 'Divination', color: '#7B5618' },
  enchantement: { label: 'Enchantement', color: '#2A8A8A' },
  elementaire: { label: 'Élémentaire', color: '#264874' },
  illusion: { label: 'Illusion', color: '#5C2A6A' },
  invocation: { label: 'Invocation', color: '#B8631F' },
  naturelle: { label: 'Magie naturelle', color: '#4D6B2A' },
  noire: { label: 'Magie noire', color: '#1A1410' },
  necromancie: { label: 'Nécromancie', color: '#6E6A60' }
} as const;
