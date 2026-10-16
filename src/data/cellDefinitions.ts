import { CellaVisionClassId } from '../types';

export interface CellaVisionClassDef {
  id: CellaVisionClassId;
  name: string;
  shortLabel: string;
  category: 'Granulocyte' | 'Agranulocyte' | 'Blast / Precursor' | 'Other / Artifact';
  normalRange: string;
  stainDescription: string;
  hotkey: string;
  svgRender: (size?: number, variant?: { rot?: number; bright?: number; cont?: number }) => string;
}

export const CELLAVISION_CLASSES: Record<CellaVisionClassId, CellaVisionClassDef> = {
  segmented_neutrophil: {
    id: 'segmented_neutrophil',
    name: 'Segmented Neutrophil',
    shortLabel: 'Seg',
    category: 'Granulocyte',
    normalRange: '40 - 75%',
    stainDescription: 'Pale pink cytoplasm with fine lilac granules; 2-5 nuclear lobes connected by thin chromatin thread.',
    hotkey: 'S',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="transform: rotate(${v.rot || 0}deg); filter: brightness(${1 + (v.bright || 0)}) contrast(${1 + (v.cont || 0)});">
        <defs>
          <radialGradient id="rbc${size}" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
          <radialGradient id="neutro${size}" cx="50%" cy="50%"><stop offset="0%" stop-color="#fed7aa" stop-opacity="0.9"/><stop offset="100%" stop-color="#fecdd3"/></radialGradient>
        </defs>
        <circle cx="15" cy="20" r="14" fill="url(#rbc${size})" opacity="0.4"/>
        <circle cx="85" cy="80" r="13" fill="url(#rbc${size})" opacity="0.4"/>
        <circle cx="50" cy="50" r="32" fill="url(#neutro${size})" stroke="#f43f5e" stroke-width="1"/>
        <circle cx="36" cy="40" r="1.2" fill="#a855f7"/><circle cx="64" cy="38" r="1.1" fill="#a855f7"/><circle cx="50" cy="68" r="1.3" fill="#a855f7"/>
        <path d="M35,45 Q38,34 46,38 Q52,42 46,50 Z" fill="#4c1d95"/>
        <path d="M48,38 Q60,36 64,44 Q68,52 60,56 Z" fill="#3b0764"/>
        <path d="M46,50 Q46,64 56,66 Q64,64 58,56 Z" fill="#2e1065"/>
        <path d="M44,40 L50,42 M50,50 L56,58" stroke="#3b0764" stroke-width="2.5"/>
      </svg>
    `,
  },
  band_neutrophil: {
    id: 'band_neutrophil',
    name: 'Band Neutrophil',
    shortLabel: 'Band',
    category: 'Granulocyte',
    normalRange: '0 - 5%',
    stainDescription: 'U-shaped or curved band nucleus with parallel sides and no filament narrowing; indicates "left shift".',
    hotkey: 'B',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="transform: rotate(${v.rot || 0}deg); filter: brightness(${1 + (v.bright || 0)}) contrast(${1 + (v.cont || 0)});">
        <defs>
          <radialGradient id="bandCyto${size}" cx="50%" cy="50%"><stop offset="0%" stop-color="#fed7aa" stop-opacity="0.9"/><stop offset="100%" stop-color="#fecdd3"/></radialGradient>
        </defs>
        <circle cx="82" cy="20" r="13" fill="#e11d48" opacity="0.35"/>
        <circle cx="50" cy="50" r="32" fill="url(#bandCyto${size})" stroke="#f43f5e" stroke-width="1"/>
        <circle cx="40" cy="35" r="1.2" fill="#a855f7"/><circle cx="65" cy="62" r="1.2" fill="#a855f7"/>
        <!-- Classic Horseshoe / C-shaped nucleus without filament -->
        <path d="M32,40 C30,26 68,26 68,42 C68,58 56,66 48,66 C36,66 34,54 36,44 C38,50 44,56 50,56 C56,56 60,48 58,40 C56,34 38,34 36,40 Z" fill="#4c1d95"/>
      </svg>
    `,
  },
  metamyelocyte: {
    id: 'metamyelocyte',
    name: 'Metamyelocyte',
    shortLabel: 'Meta',
    category: 'Granulocyte',
    normalRange: '0%',
    stainDescription: 'Kidney bean or indented nucleus (indentation < 1/2 diameter), condensed chromatin, pink-neutral cytoplasm.',
    hotkey: 'T',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="transform: rotate(${v.rot || 0}deg);">
        <circle cx="50" cy="50" r="33" fill="#fed7aa" stroke="#f43f5e" stroke-width="1"/>
        <circle cx="45" cy="32" r="1.2" fill="#9333ea"/><circle cx="60" cy="64" r="1.2" fill="#9333ea"/>
        <!-- Kidney-indented nucleus -->
        <path d="M36,36 C44,30 62,32 62,44 C62,56 54,64 42,64 C32,64 30,52 32,42 C38,48 48,48 48,42 C48,36 38,36 36,36 Z" fill="#581c87"/>
      </svg>
    `,
  },
  myelocyte: {
    id: 'myelocyte',
    name: 'Myelocyte',
    shortLabel: 'Myelo',
    category: 'Granulocyte',
    normalRange: '0%',
    stainDescription: 'Round or oval eccentric nucleus, slightly condensed chromatin, onset of specific lilac granules ("dawn of neutrophilia").',
    hotkey: 'Y',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <circle cx="50" cy="50" r="34" fill="#fed7aa" stroke="#fb923c" stroke-width="1"/>
        <circle cx="42" cy="46" r="20" fill="#6b21a8"/>
        <circle cx="66" cy="45" r="1.5" fill="#c084fc"/><circle cx="68" cy="55" r="1.5" fill="#ea580c"/>
      </svg>
    `,
  },
  promyelocyte: {
    id: 'promyelocyte',
    name: 'Promyelocyte',
    shortLabel: 'Pro',
    category: 'Granulocyte',
    normalRange: '0%',
    stainDescription: 'Large round nucleus, visible nucleolus, filled with coarse reddish-purple primary azurophilic granules.',
    hotkey: 'P',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <circle cx="50" cy="50" r="36" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.2"/>
        <circle cx="46" cy="48" r="22" fill="#4338ca"/>
        <circle cx="42" cy="42" r="3.5" fill="#a5b4fc"/>
        <!-- Coarse primary granules -->
        <circle cx="28" cy="38" r="2" fill="#b91c1c"/><circle cx="68" cy="36" r="2.2" fill="#b91c1c"/><circle cx="70" cy="62" r="2.1" fill="#b91c1c"/>
        <circle cx="32" cy="64" r="2" fill="#b91c1c"/><circle cx="50" cy="74" r="2.2" fill="#b91c1c"/>
      </svg>
    `,
  },
  blast: {
    id: 'blast',
    name: 'Myeloblast / Blast',
    shortLabel: 'Blast',
    category: 'Blast / Precursor',
    normalRange: '0%',
    stainDescription: 'High N:C ratio, finely dispersed chromatin, 2-5 prominent pale nucleoli. Medical emergency in peripheral blood!',
    hotkey: 'X',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="transform: rotate(${v.rot || 0}deg);">
        <circle cx="50" cy="50" r="35" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
        <circle cx="48" cy="48" r="27" fill="#312e81"/>
        <circle cx="40" cy="40" r="4.2" fill="#93c5fd" opacity="0.85"/>
        <circle cx="56" cy="44" r="3.8" fill="#93c5fd" opacity="0.85"/>
        <circle cx="46" cy="58" r="4.0" fill="#93c5fd" opacity="0.85"/>
        <line x1="24" y1="60" x2="33" y2="66" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `,
  },
  lymphocyte: {
    id: 'lymphocyte',
    name: 'Small Lymphocyte',
    shortLabel: 'Lymph',
    category: 'Agranulocyte',
    normalRange: '20 - 45%',
    stainDescription: 'Round condensed clumpy purple nucleus with a thin rim of robin-egg blue cytoplasm.',
    hotkey: 'L',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="transform: rotate(${v.rot || 0}deg);">
        <circle cx="16" cy="30" r="14" fill="#e11d48" opacity="0.35"/>
        <circle cx="50" cy="50" r="23" fill="#7dd3fc" stroke="#38bdf8" stroke-width="1"/>
        <circle cx="49" cy="49" r="19" fill="#3b0764"/>
      </svg>
    `,
  },
  reactive_lymphocyte: {
    id: 'reactive_lymphocyte',
    name: 'Reactive Lymphocyte',
    shortLabel: 'React Ly',
    category: 'Agranulocyte',
    normalRange: '0 - 2%',
    stainDescription: 'Downey type II cell; abundant flared cytoplasm indented by surrounding RBCs, darkened radial borders.',
    hotkey: 'R',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <circle cx="14" cy="20" r="14" fill="#e11d48" opacity="0.5"/>
        <circle cx="86" cy="74" r="14" fill="#e11d48" opacity="0.5"/>
        <path d="M22,46 C18,24 50,18 78,32 C88,48 86,74 58,82 C34,84 26,64 22,46 Z" fill="#93c5fd" stroke="#2563eb" stroke-width="1.5"/>
        <circle cx="48" cy="48" r="18" fill="#4338ca"/>
      </svg>
    `,
  },
  plasma_cell: {
    id: 'plasma_cell',
    name: 'Plasma Cell',
    shortLabel: 'Plasma',
    category: 'Agranulocyte',
    normalRange: '0%',
    stainDescription: 'Eccentric "clock-face" / cartwheel nucleus, deep basophilic royal blue cytoplasm, prominent pale perinuclear Hof.',
    hotkey: 'C',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <ellipse cx="50" cy="50" rx="32" ry="26" fill="#1e40af" stroke="#1d4ed8" stroke-width="1.2"/>
        <circle cx="36" cy="46" r="16" fill="#312e81"/>
        <!-- Perinuclear Hof (clear Golgi zone) -->
        <ellipse cx="55" cy="50" rx="7" ry="10" fill="#dbeafe" opacity="0.7"/>
      </svg>
    `,
  },
  monocyte: {
    id: 'monocyte',
    name: 'Monocyte',
    shortLabel: 'Mono',
    category: 'Agranulocyte',
    normalRange: '2 - 10%',
    stainDescription: 'Large size (15-22 µm), folded brain-like or horseshoe nucleus, opaque ground-glass slate grey-blue cytoplasm.',
    hotkey: 'M',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="transform: rotate(${v.rot || 0}deg);">
        <path d="M24,46 Q22,24 48,22 Q76,20 80,44 Q84,72 58,80 Q28,82 24,46 Z" fill="#94a3b8" stroke="#64748b" stroke-width="1.2"/>
        <circle cx="36" cy="34" r="2.5" fill="#f8fafc" opacity="0.8"/>
        <path d="M38,36 C42,28 62,30 62,44 C62,54 50,52 46,60 C40,68 32,58 34,48 Z" fill="#4c1d95"/>
      </svg>
    `,
  },
  eosinophil: {
    id: 'eosinophil',
    name: 'Eosinophil',
    shortLabel: 'Eos',
    category: 'Granulocyte',
    normalRange: '1 - 6%',
    stainDescription: 'Bilobed spectacle nucleus packed with coarse, uniform, refractile orange-red spherical granules.',
    hotkey: 'E',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <circle cx="50" cy="50" r="30" fill="#fed7aa" stroke="#fb923c" stroke-width="1.2"/>
        <ellipse cx="38" cy="50" rx="8" ry="14" fill="#4c1d95"/>
        <ellipse cx="62" cy="50" rx="8" ry="14" fill="#4c1d95"/>
        <path d="M38,50 L62,50" stroke="#3b0764" stroke-width="2.5"/>
        <!-- Coarse orange-red granules -->
        <g fill="#ea580c">
          <circle cx="32" cy="36" r="2.3"/><circle cx="48" cy="30" r="2.4"/><circle cx="66" cy="34" r="2.2"/>
          <circle cx="70" cy="58" r="2.4"/><circle cx="50" cy="68" r="2.5"/><circle cx="30" cy="62" r="2.3"/>
          <circle cx="50" cy="44" r="2.2"/>
        </g>
      </svg>
    `,
  },
  basophil: {
    id: 'basophil',
    name: 'Basophil',
    shortLabel: 'Baso',
    category: 'Granulocyte',
    normalRange: '0 - 1%',
    stainDescription: 'Abundant coarse dark violet-black metachromatic granules overlying and heavily obscuring the nucleus.',
    hotkey: 'A',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <circle cx="50" cy="50" r="28" fill="#fdf4ff" stroke="#a855f7" stroke-width="1"/>
        <path d="M36,46 Q44,36 56,42 Q66,50 54,60 Z" fill="#3b0764" opacity="0.6"/>
        <g fill="#1e1b4b">
          <circle cx="36" cy="38" r="3.6"/><circle cx="48" cy="34" r="3.8"/><circle cx="60" cy="42" r="3.5"/>
          <circle cx="42" cy="48" r="4.0"/><circle cx="54" cy="50" r="4.1"/><circle cx="38" cy="58" r="3.6"/>
          <circle cx="52" cy="64" r="3.7"/><circle cx="64" cy="54" r="3.4"/>
        </g>
      </svg>
    `,
  },
  smudge_cell: {
    id: 'smudge_cell',
    name: 'Smudge / Basket Cell',
    shortLabel: 'Smudge',
    category: 'Other / Artifact',
    normalRange: '0%',
    stainDescription: 'Ruptured fragile lymphocyte without intact cytoplasm or nuclear membrane; hallmark of CLL.',
    hotkey: 'K',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <path d="M22,34 Q45,18 72,28 Q88,52 68,76 Q40,84 26,62 Z" fill="none" stroke="#6b21a8" stroke-width="3" stroke-dasharray="4 3" opacity="0.7"/>
        <path d="M30,42 Q50,30 65,45 Q50,68 35,55 Z" fill="#581c87" opacity="0.5"/>
        <circle cx="70" cy="40" r="4" fill="#7c3aed" opacity="0.4"/>
        <circle cx="28" cy="66" r="3" fill="#7c3aed" opacity="0.4"/>
      </svg>
    `,
  },
  unclassified: {
    id: 'unclassified',
    name: 'Unclassified / Artifact',
    shortLabel: 'Unclass',
    category: 'Other / Artifact',
    normalRange: '0%',
    stainDescription: 'Cell with ambiguous morphology, stain precipitation, or overlapping cells requiring manual technologist review.',
    hotkey: 'U',
    svgRender: (size = 80, v = {}) => `
      <svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <circle cx="50" cy="50" r="28" fill="#334155" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3"/>
        <text x="50" y="58" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#94a3b8">?</text>
      </svg>
    `,
  },
};
