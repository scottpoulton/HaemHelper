import { CellaVisionClassId } from '../types';
import monolayerWidefieldImg from '../assets/images/monolayer_widefield_smear_1792129887070.jpg';
import bloodSmearMonolayerImg from '../assets/images/blood_smear_monolayer_1792129507828.jpg';
import neutrophilImg from '../assets/images/microscopy_neutrophil_1792129505476.jpg';
import bandNeutrophilImg from '../assets/images/microscopy_band_neutrophil_1792129832293.jpg';
import myeloblastImg from '../assets/images/microscopy_myeloblast_1792129505437.jpg';
import lymphocyteImg from '../assets/images/microscopy_lymphocyte_1792129817282.jpg';
import reactiveLymphocyteImg from '../assets/images/microscopy_reactive_lymphocyte_1792129860988.jpg';
import plasmaCellImg from '../assets/images/microscopy_plasma_cell_1792129873701.jpg';
import monocyteImg from '../assets/images/microscopy_monocyte_1792129507454.jpg';
import eosinophilImg from '../assets/images/microscopy_eosinophil_1792129506942.jpg';
import basophilImg from '../assets/images/microscopy_basophil_1792129846451.jpg';

export interface ReferenceAtlasEntry {
  classId: CellaVisionClassId;
  title: string;
  diameterUm: string;
  nCRatio: string;
  chromatinPattern: string;
  cytoplasmicFeatures: string;
  granularity: string;
  differentialPitfalls: string;
  diagnosticHallmarks: string[];
  realPhotoUrl?: string;
}

export const REAL_SLIDE_MONOLAYER_IMAGE = monolayerWidefieldImg;
export const REAL_SLIDE_OIL_OVERVIEW_IMAGE = bloodSmearMonolayerImg;

export const REAL_CELL_PHOTO_MAP: Record<CellaVisionClassId, string> = {
  segmented_neutrophil: neutrophilImg,
  band_neutrophil: bandNeutrophilImg,
  metamyelocyte: bandNeutrophilImg,
  myelocyte: neutrophilImg,
  promyelocyte: myeloblastImg,
  blast: myeloblastImg,
  lymphocyte: lymphocyteImg,
  reactive_lymphocyte: reactiveLymphocyteImg,
  plasma_cell: plasmaCellImg,
  monocyte: monocyteImg,
  eosinophil: eosinophilImg,
  basophil: basophilImg,
  smudge_cell: lymphocyteImg,
  unclassified: neutrophilImg,
};

export const REFERENCE_ATLAS: Record<CellaVisionClassId, ReferenceAtlasEntry> = {
  segmented_neutrophil: {
    classId: 'segmented_neutrophil',
    title: 'Segmented Neutrophil',
    diameterUm: '10 - 15 µm',
    nCRatio: '1:2 (moderate cytoplasm)',
    chromatinPattern: 'Heavily clumped, dense purple with clear parachromatin gaps; 2 to 5 distinct lobes',
    cytoplasmicFeatures: 'Pale pink / salmon ground cytoplasm',
    granularity: 'Abundant fine secondary neutral lilac granules; rare primary azurophilic granules',
    differentialPitfalls: 'Distinguishing from Band Neutrophils when lobes overlap without a clear filament visible. Must rotate or inspect bridge.',
    diagnosticHallmarks: [
      'Filamentous connection between lobes (width < 1/3 of lobe)',
      'Pale salmon/pink background cytoplasm',
      'Dense pyknotic chromatin blocks',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.segmented_neutrophil,
  },
  band_neutrophil: {
    classId: 'band_neutrophil',
    title: 'Band Neutrophil',
    diameterUm: '10 - 15 µm',
    nCRatio: '1:2',
    chromatinPattern: 'Condensed chromatin forming a continuous curved, C-, S-, or horseshoe-shaped band with no constriction filament',
    cytoplasmicFeatures: 'Pinkish-salmon ground cytoplasm identical to segmented neutrophil',
    granularity: 'Fine lilac secondary granules',
    differentialPitfalls: 'Over-calling Metamyelocytes or folded Segmented Neutrophils. Band nucleus must maintain roughly parallel borders.',
    diagnosticHallmarks: [
      'Parallel nuclear margins without filament narrowing',
      'C-, U-, or horseshoe nuclear contour',
      'Signifies increased bone marrow release (left shift)',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.band_neutrophil,
  },
  metamyelocyte: {
    classId: 'metamyelocyte',
    title: 'Metamyelocyte (Juvenile)',
    diameterUm: '12 - 18 µm',
    nCRatio: '1.5:1',
    chromatinPattern: 'Coarser, slightly clumped chromatin; kidney-bean or indented nucleus (indentation < 50% nuclear diameter)',
    cytoplasmicFeatures: 'Neutral pink with faint lavender tone',
    granularity: 'Predominantly specific lilac secondary granules',
    differentialPitfalls: 'Distinguishing from Band Neutrophil (Band has indentation > 50% and parallel sides; Metamyelocyte is bean-shaped).',
    diagnosticHallmarks: [
      'Kidney-shaped indentation (< 1/2 nuclear width)',
      'No parallel nuclear sides',
      'Pinker cytoplasm than myelocyte precursor',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.metamyelocyte,
  },
  myelocyte: {
    classId: 'myelocyte',
    title: 'Myelocyte',
    diameterUm: '15 - 20 µm',
    nCRatio: '2:1',
    chromatinPattern: 'Eccentrically placed round or oval nucleus; chromatin moderately coarse; nucleoli generally absent',
    cytoplasmicFeatures: 'Bluish-pink ground with "dawn of neutrophilia" (patchy pink near Golgi)',
    granularity: 'Mixture of residual primary azurophilic and developing secondary granules',
    differentialPitfalls: 'Can be confused with monocytes or promyelocytes. Note the localized pink dawn in the cytoplasm.',
    diagnosticHallmarks: [
      'Round or oval eccentric nucleus with smooth border',
      'Local pink patch near nucleus (Golgi zone)',
      'Absence of distinct nucleoli',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.myelocyte,
  },
  promyelocyte: {
    classId: 'promyelocyte',
    title: 'Promyelocyte',
    diameterUm: '15 - 22 µm',
    nCRatio: '3:1',
    chromatinPattern: 'Large round-oval nucleus with visible nucleolus; chromatin is somewhat delicate to slightly coarse',
    cytoplasmicFeatures: 'Moderate basophilic (pale blue) cytoplasm',
    granularity: 'Prominent, coarse reddish-purple primary azurophilic granules dispersed throughout cytoplasm',
    differentialPitfalls: 'Distinguishing from Myeloblast. Look for the presence of numerous coarse primary granules.',
    diagnosticHallmarks: [
      'Coarse primary azurophilic granules',
      'High N:C ratio with visible nucleoli',
      'Intermediate between blast and myelocyte',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.promyelocyte,
  },
  blast: {
    classId: 'blast',
    title: 'Myeloblast (Leukaemic Precursor)',
    diameterUm: '14 - 20 µm',
    nCRatio: '4:1 or 5:1 (very high)',
    chromatinPattern: 'Very delicate, finely stippled / "sifted" chromatin without clumping',
    cytoplasmicFeatures: 'Scant to moderate basophilic (royal blue) cytoplasm; agranular',
    granularity: 'Agranular; may contain linear red Auer rods in acute myeloid leukaemia (AML)',
    differentialPitfalls: 'Must not be confused with reactive lymphocytes or monocytes! Look for punched-out nucleoli and fine uncompacted chromatin.',
    diagnosticHallmarks: [
      '2 to 5 distinct pale, punched-out nucleoli',
      'Delicate "sand-like" chromatin without dense blocks',
      'Auer rods are pathognomonic for myeloblastic lineage',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.blast,
  },
  lymphocyte: {
    classId: 'lymphocyte',
    title: 'Small Mature Lymphocyte',
    diameterUm: '7 - 10 µm (size of normal RBC)',
    nCRatio: '4:1 to 5:1',
    chromatinPattern: 'Extremely dense, smudged, blocked purple chromatin; no visible nucleoli',
    cytoplasmicFeatures: 'Scant crescent or thin rim of clear sky-blue / robin-egg blue cytoplasm',
    granularity: 'Generally agranular',
    differentialPitfalls: 'Can be confused with nucleated red blood cells (NRBCs) or micromyeloblasts. Dense clumped chromatin distinguishes it.',
    diagnosticHallmarks: [
      'Same size as adjacent erythrocyte (~7.2 µm)',
      'Blocked, dense purple chromatin',
      'Very thin sky-blue cytoplasmic rim',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.lymphocyte,
  },
  reactive_lymphocyte: {
    classId: 'reactive_lymphocyte',
    title: 'Reactive Lymphocyte (Downey Type II)',
    diameterUm: '15 - 25 µm (large and pleomorphic)',
    nCRatio: 'Variable (often 2:1)',
    chromatinPattern: 'Coarse to moderately clumped chromatin; variable nucleus shape, often lobed or indented',
    cytoplasmicFeatures: 'Abundant pale to deep blue cytoplasm that flares and molds around neighbouring red blood cells',
    granularity: 'Occasional azurophilic granules',
    differentialPitfalls: 'Often mistaken for monocytes or leukaemic blasts. The scalloped cytoplasmic borders hugging RBCs are diagnostic.',
    diagnosticHallmarks: [
      'Cytoplasm flows and indents around adjacent erythrocytes',
      'Darkened basophilic border where touching RBCs',
      'Abundant, flared cytoplasm',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.reactive_lymphocyte,
  },
  plasma_cell: {
    classId: 'plasma_cell',
    title: 'Plasma Cell',
    diameterUm: '12 - 18 µm',
    nCRatio: '2:1',
    chromatinPattern: 'Eccentric round nucleus with "clock-face" or "cartwheel" chromatin clumps radiating from center',
    cytoplasmicFeatures: 'Deep royal blue / intense basophilic cytoplasm with clear pale perinuclear Hof (Golgi zone)',
    granularity: 'Agranular; may contain Russell bodies (immunoglobulin vacuoles)',
    differentialPitfalls: 'Distinguishing from reactive lymphocytes. Look for the distinct pale perinuclear Hof next to the nucleus.',
    diagnosticHallmarks: [
      'Classic "cartwheel" radiating chromatin pattern',
      'Prominent clear perinuclear halo / Hof',
      'Intense deep royal blue cytoplasm',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.plasma_cell,
  },
  monocyte: {
    classId: 'monocyte',
    title: 'Monocyte',
    diameterUm: '15 - 22 µm (largest normal WBC)',
    nCRatio: '2:1',
    chromatinPattern: 'Delicate, lace-like loose chromatin with multiple folds, convolutions, or kidney indentation',
    cytoplasmicFeatures: 'Abundant opaque "ground-glass" or slate grey-blue cytoplasm; frequently contains fine phagocytic vacuoles',
    granularity: 'Fine dust-like azurophilic granules giving frosted glass appearance',
    differentialPitfalls: 'Often mistaken for large granular lymphocytes, reactive lymphocytes, or metamyelocytes. Notice the convoluted brain-like folds.',
    diagnosticHallmarks: [
      'Convoluted, brain-like folding nucleus (gyri-like)',
      'Opaque ground-glass slate grey-blue cytoplasm',
      'Phagocytic microvacuoles and blunt pseudopods',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.monocyte,
  },
  eosinophil: {
    classId: 'eosinophil',
    title: 'Eosinophil',
    diameterUm: '12 - 17 µm',
    nCRatio: '1:2',
    chromatinPattern: 'Typically bilobed ("spectacle-shaped"), connected by an isthmus; condensed purple chromatin',
    cytoplasmicFeatures: 'Neutral to faint pink background',
    granularity: 'Completely filled with uniform, coarse, spherical, brilliant orange-red to reddish-orange refractile granules',
    differentialPitfalls: 'Damaged or degranulated eosinophils can mimic neutrophils. Look for residual uniform spherical orange granules.',
    diagnosticHallmarks: [
      'Uniform coarse orange-red spherical granules',
      'Bilobed "spectacle-like" nucleus',
      'Granules do not obscure the nucleus',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.eosinophil,
  },
  basophil: {
    classId: 'basophil',
    title: 'Basophil',
    diameterUm: '10 - 14 µm',
    nCRatio: '1:1',
    chromatinPattern: 'Bilobed or cloverleaf, usually obscured by overlying coarse granules',
    cytoplasmicFeatures: 'Pale pink-purple to clear',
    granularity: 'Large, coarse, variable-sized dark violet-black metachromatic granules heavily overlying the nucleus',
    differentialPitfalls: 'Water-soluble granules can wash out during staining leaving clear vacuoles. Look for residual dark purple granules.',
    diagnosticHallmarks: [
      'Coarse violet-black granules covering both nucleus and cytoplasm',
      'Rarest leukocyte in peripheral blood (0-1%)',
      'Water-soluble histamine and heparin granules',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.basophil,
  },
  smudge_cell: {
    classId: 'smudge_cell',
    title: 'Smudge / Basket Cell',
    diameterUm: 'Variable',
    nCRatio: 'N/A',
    chromatinPattern: 'Ruptured nuclear chromatin remnant without intact cell membrane',
    cytoplasmicFeatures: 'Absent or dispersed',
    granularity: 'None',
    differentialPitfalls: 'Artifact of slide preparation in fragile cells (Chronic Lymphocytic Leukaemia - CLL). Albumin smear confirms true count.',
    diagnosticHallmarks: [
      'Fragmented nuclear chromatin network without cytoplasm',
      'Classic laboratory finding in CLL',
      'Excluded from manual 100-cell differential tally',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.smudge_cell,
  },
  unclassified: {
    classId: 'unclassified',
    title: 'Unclassified / Questionable Morphology',
    diameterUm: 'Variable',
    nCRatio: 'Variable',
    chromatinPattern: 'Atypical, damaged, or obscured',
    cytoplasmicFeatures: 'Stain precipitate, overlap, or indeterminate features',
    granularity: 'Indeterminate',
    differentialPitfalls: 'Requires second technologist review or consultation with senior hematopathologist.',
    diagnosticHallmarks: [
      'Flagged for manual secondary review',
      'Requires slide relocation under 100x oil immersion',
    ],
    realPhotoUrl: REAL_CELL_PHOTO_MAP.unclassified,
  },
};