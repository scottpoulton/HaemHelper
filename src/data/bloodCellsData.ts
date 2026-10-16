import { CellClass, BloodSmearSample } from '../types';

export const HAEMATOLOGY_CLASSES: CellClass[] = [
  {
    id: 'neutrophil',
    name: 'Segmented Neutrophil',
    category: 'Granulocyte',
    scientificName: 'Neutrophilus polymorphonuclearis',
    referencePercentage: '40 - 75% of WBCs (2.0 - 7.5 × 10⁹/L)',
    stainAppearance: {
      cytoplasm: 'Pale pink to salmon with fine lilac secondary granules',
      nucleus: 'Dark purple, condensed chromatin, 2-5 lobes connected by thin filaments',
      granules: 'Fine specific neutral lilac granules; rare azurophilic primary granules'
    },
    morphology: [
      'Diameter: 10 - 15 µm',
      'Dense clumped chromatin with clear parachromatin areas',
      'Neutral pink/salmon ground cytoplasm',
      'Phagocytic specialist for bacterial infections'
    ],
    clinicalSignificance: 'Elevated (Neutrophilia) in acute bacterial infections, inflammation, tissue necrosis, and myeloproliferative disorders. Decreased in chemotherapy, aplastic anaemia, severe viral infections.',
    keyFeatures: ['Multilobed nucleus (3-5 lobes)', 'Fine lilac granules', 'Pale pink cytoplasm'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="rbcBg" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
        <radialGradient id="neutroCyto" cx="50%" cy="50%"><stop offset="0%" stop-color="#fed7aa" stop-opacity="0.8"/><stop offset="100%" stop-color="#fecdd3" stop-opacity="0.9"/></radialGradient>
      </defs>
      <!-- Background RBCs -->
      <circle cx="16" cy="20" r="13" fill="url(#rbcBg)" opacity="0.6"/>
      <circle cx="86" cy="22" r="12" fill="url(#rbcBg)" opacity="0.6"/>
      <circle cx="84" cy="80" r="14" fill="url(#rbcBg)" opacity="0.6"/>
      <circle cx="18" cy="82" r="13" fill="url(#rbcBg)" opacity="0.6"/>
      <circle cx="50" cy="10" r="9" fill="url(#rbcBg)" opacity="0.5"/>
      <!-- Main Neutrophil Body -->
      <circle cx="50" cy="50" r="32" fill="url(#neutroCyto)" stroke="#f43f5e" stroke-width="1.2"/>
      <!-- Granules -->
      <circle cx="34" cy="42" r="1" fill="#c084fc"/>
      <circle cx="38" cy="62" r="1" fill="#c084fc"/>
      <circle cx="62" cy="38" r="1.2" fill="#c084fc"/>
      <circle cx="66" cy="58" r="1" fill="#c084fc"/>
      <circle cx="48" cy="32" r="1.1" fill="#c084fc"/>
      <circle cx="52" cy="70" r="1" fill="#c084fc"/>
      <!-- Lobed Nucleus with Filaments -->
      <path d="M36,44 Q38,34 46,38 Q54,42 48,50 Q42,58 34,56 Z" fill="#581c87" opacity="0.95"/>
      <path d="M46,38 Q58,36 64,44 Q70,52 62,56 Q54,58 52,50 Z" fill="#4a044e" opacity="0.95"/>
      <path d="M48,50 Q48,64 56,66 Q64,66 60,56 Z" fill="#3b0764" opacity="0.95"/>
      <path d="M44,40 L52,42 M52,50 L56,58" stroke="#3b0764" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'lymphocyte',
    name: 'Small Lymphocyte',
    category: 'Agranulocyte',
    scientificName: 'Lymphocytus minor',
    referencePercentage: '20 - 45% of WBCs (1.0 - 4.0 × 10⁹/L)',
    stainAppearance: {
      cytoplasm: 'Scant rim of pale sky-blue / robin-egg blue',
      nucleus: 'Deep round or slightly indented purple nucleus with heavily condensed, smudged chromatin',
      granules: 'Usually absent; occasional azurophilic granules in cytotoxic variants'
    },
    morphology: [
      'Diameter: 7 - 10 µm (comparable to normal RBC ~7.2 µm)',
      'High Nucleus-to-Cytoplasm (N:C) ratio (~4:1 or 5:1)',
      'Chromatin is coarse, blocked, and darkly stained',
      'Adaptive immune cells (T-cells, B-cells, NK-cells)'
    ],
    clinicalSignificance: 'Elevated (Lymphocytosis) in viral infections (EBV, CMV, hepatitis), chronic lymphocytic leukaemia (CLL), pertussis. Decreased (Lymphopenia) in HIV/AIDS, immunosuppressive therapy, stress, severe sepsis.',
    keyFeatures: ['Scant pale blue cytoplasmic rim', 'Dense round purple nucleus', 'Size similar to adjacent RBC'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="rbcBg2" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
        <radialGradient id="lymphoCyto" cx="50%" cy="50%"><stop offset="0%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#7dd3fc"/></radialGradient>
      </defs>
      <!-- Nearby RBCs for size reference -->
      <circle cx="16" cy="30" r="14" fill="url(#rbcBg2)" opacity="0.6"/>
      <circle cx="82" cy="74" r="14" fill="url(#rbcBg2)" opacity="0.6"/>
      <circle cx="80" cy="24" r="13" fill="url(#rbcBg2)" opacity="0.6"/>
      <!-- Lymphocyte Body -->
      <circle cx="48" cy="50" r="22" fill="url(#lymphoCyto)" stroke="#38bdf8" stroke-width="1.2"/>
      <!-- Dense Nucleus occupying almost entire cell -->
      <circle cx="47" cy="49" r="18" fill="#3b0764"/>
      <path d="M38,42 Q46,38 54,42 Q58,50 52,58 Q42,60 38,50 Z" fill="#2e1065"/>
    </svg>`
  },
  {
    id: 'monocyte',
    name: 'Monocyte',
    category: 'Agranulocyte',
    scientificName: 'Monocytus',
    referencePercentage: '2 - 10% of WBCs (0.2 - 1.0 × 10⁹/L)',
    stainAppearance: {
      cytoplasm: 'Abundant greyish-blue or "ground glass" / opaque slate appearance',
      nucleus: 'Pleomorphic, kidney-shaped, folded, or indented, lace-like loose chromatin',
      granules: 'Fine dust-like azurophilic granules giving frosted glass look; occasional phagocytic vacuoles'
    },
    morphology: [
      'Largest normal white cell in peripheral blood (15 - 22 µm)',
      'Delicate, folding convolutions reminiscent of brain gyri',
      'Variable cell border with pseudopods or blebs',
      'Precursor to tissue macrophages and dendritic cells'
    ],
    clinicalSignificance: 'Elevated (Monocytosis) in chronic infections (tuberculosis, subacute bacterial endocarditis), inflammatory bowel diseases, myelodysplasia, and chronic myelomonocytic leukaemia (CMML).',
    keyFeatures: ['Largest WBC', 'Brain-like folded nucleus', 'Ground-glass grey-blue cytoplasm', 'Frequent vacuoles'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="rbcBg3" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
        <radialGradient id="monoCyto" cx="50%" cy="50%"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/></radialGradient>
      </defs>
      <!-- Background RBCs -->
      <circle cx="12" cy="18" r="11" fill="url(#rbcBg3)" opacity="0.5"/>
      <circle cx="90" cy="50" r="12" fill="url(#rbcBg3)" opacity="0.5"/>
      <circle cx="15" cy="85" r="12" fill="url(#rbcBg3)" opacity="0.5"/>
      <!-- Monocyte Big irregular body -->
      <path d="M22,48 Q20,24 45,20 Q75,18 80,42 Q86,70 60,78 Q30,84 22,48 Z" fill="url(#monoCyto)" stroke="#64748b" stroke-width="1.5"/>
      <!-- Vacuoles -->
      <circle cx="34" cy="34" r="3" fill="#f8fafc" opacity="0.75"/>
      <circle cx="68" cy="62" r="2.5" fill="#f8fafc" opacity="0.75"/>
      <!-- Kidney/Folded Nucleus -->
      <path d="M38,38 C42,28 62,30 62,44 C62,54 50,52 46,60 C40,68 32,58 34,48 C36,42 34,44 38,38 Z" fill="#4c1d95" opacity="0.95"/>
      <path d="M44,38 Q54,42 56,48" stroke="#31104b" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'eosinophil',
    name: 'Eosinophil',
    category: 'Granulocyte',
    scientificName: 'Eosinophilus',
    referencePercentage: '1 - 6% of WBCs (0.04 - 0.4 × 10⁹/L)',
    stainAppearance: {
      cytoplasm: 'Packed with coarse, spherical, uniform orange-red to bright reddish-orange granules',
      nucleus: 'Typically bilobed ("spectacle-shaped" or dumbbell), purple condensed chromatin',
      granules: 'Major Basic Protein (MBP), eosinophil cationic protein; uniform bright acidophilic spheres'
    },
    morphology: [
      'Diameter: 12 - 17 µm',
      'Distinctive uniform brilliant refractile orange-red granules',
      'Usually 2 distinct nuclear lobes connected by an isthmus',
      'Mediator of allergic responses and defence against helminthic parasites'
    ],
    clinicalSignificance: 'Elevated (Eosinophilia) in allergic reactions (asthma, eczema, drug allergies), parasitic helminth infections, Churg-Strauss syndrome, and hypereosinophilic syndrome (HES).',
    keyFeatures: ['Coarse orange-red refractile granules', 'Classic bilobed spectacle nucleus', 'Neutral background'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="rbcBg4" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
        <radialGradient id="eosCyto" cx="50%" cy="50%"><stop offset="0%" stop-color="#ffedd5"/><stop offset="100%" stop-color="#fed7aa"/></radialGradient>
      </defs>
      <!-- Background RBCs -->
      <circle cx="16" cy="18" r="12" fill="url(#rbcBg4)" opacity="0.5"/>
      <circle cx="86" cy="78" r="13" fill="url(#rbcBg4)" opacity="0.5"/>
      <!-- Eosinophil Body -->
      <circle cx="50" cy="50" r="30" fill="url(#eosCyto)" stroke="#fb923c" stroke-width="1.2"/>
      <!-- Abundant Orange-Red Granules -->
      <g fill="#ea580c">
        <circle cx="30" cy="38" r="2.2"/><circle cx="36" cy="32" r="2.5"/><circle cx="44" cy="28" r="2.2"/><circle cx="56" cy="28" r="2.4"/>
        <circle cx="64" cy="32" r="2.3"/><circle cx="70" cy="40" r="2.5"/><circle cx="72" cy="52" r="2.2"/><circle cx="68" cy="62" r="2.4"/>
        <circle cx="60" cy="70" r="2.5"/><circle cx="50" cy="72" r="2.3"/><circle cx="40" cy="70" r="2.4"/><circle cx="30" cy="62" r="2.3"/>
        <circle cx="28" cy="50" r="2.5"/><circle cx="50" cy="42" r="2.1"/><circle cx="48" cy="58" r="2.2"/>
      </g>
      <!-- Bilobed Nucleus (Spectacle-like) -->
      <ellipse cx="38" cy="50" rx="9" ry="14" fill="#4c1d95" opacity="0.95"/>
      <ellipse cx="62" cy="50" rx="9" ry="14" fill="#4c1d95" opacity="0.95"/>
      <path d="M38,50 L62,50" stroke="#3b0764" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'basophil',
    name: 'Basophil',
    category: 'Granulocyte',
    scientificName: 'Basophilus',
    referencePercentage: '0 - 1% of WBCs (0.01 - 0.1 × 10⁹/L)',
    stainAppearance: {
      cytoplasm: 'Filled with large, coarse, dark violet-black / deep purple metachromatic granules',
      nucleus: 'Bilobed or cloverleaf, frequently completely obscured by the overlying coarse granules',
      granules: 'Rich in histamine, heparin, chondroitin sulfate; water-soluble and can wash out leaving vacuoles'
    },
    morphology: [
      'Diameter: 10 - 14 µm',
      'Granules are coarse, variable in size, and prominently cover the nucleus',
      'Rarest leukocyte in peripheral circulation',
      'Key effector in immediate hypersensitivity and anaphylaxis'
    ],
    clinicalSignificance: 'Elevated (Basophilia) is an important hallmark of Chronic Myeloid Leukaemia (CML) and other myeloproliferative neoplasms (polycythaemia vera, essential thrombocythaemia).',
    keyFeatures: ['Dense violet-black granules obscuring nucleus', 'Rarest WBC type', 'Metachromatic staining'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="rbcBg5" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
      </defs>
      <!-- Nearby RBCs -->
      <circle cx="82" cy="24" r="13" fill="url(#rbcBg5)" opacity="0.5"/>
      <circle cx="18" cy="76" r="12" fill="url(#rbcBg5)" opacity="0.5"/>
      <!-- Basophil Body -->
      <circle cx="50" cy="50" r="28" fill="#fdf4ff" stroke="#a855f7" stroke-width="1.2"/>
      <!-- Nucleus partially visible underneath -->
      <path d="M36,46 Q44,36 56,42 Q66,50 54,60 Q40,62 36,46 Z" fill="#3b0764" opacity="0.7"/>
      <!-- Overlying large dark violet granules covering nucleus and cytoplasm -->
      <g fill="#1e1b4b" stroke="#312e81" stroke-width="0.5">
        <circle cx="34" cy="38" r="3.4"/><circle cx="44" cy="34" r="3.6"/><circle cx="56" cy="36" r="3.8"/><circle cx="64" cy="44" r="3.2"/>
        <circle cx="40" cy="46" r="3.9"/><circle cx="50" cy="48" r="4.0"/><circle cx="60" cy="54" r="3.5"/><circle cx="36" cy="56" r="3.7"/>
        <circle cx="48" cy="62" r="3.6"/><circle cx="58" cy="64" r="3.2"/><circle cx="30" cy="48" r="3.0"/><circle cx="66" cy="52" r="3.3"/>
      </g>
    </svg>`
  },
  {
    id: 'erythrocyte',
    name: 'Erythrocyte (RBC)',
    category: 'Erythrocyte',
    scientificName: 'Erythrocytus normocyticus',
    referencePercentage: '4.0 - 5.5 × 10¹²/L (Most abundant blood cell)',
    stainAppearance: {
      cytoplasm: 'Salmon-pink to reddish-orange with distinct central pallor (approx 1/3 cell diameter)',
      nucleus: 'Anucleate in mature state',
      granules: 'None'
    },
    morphology: [
      'Biconcave disc, 6.7 - 7.7 µm diameter (mean 7.2 µm)',
      'Uniform size, smooth circular contour',
      'Central area of pallor represents thinned disc centre',
      'Gas exchange specialist carrying haemoglobin'
    ],
    clinicalSignificance: 'Evaluated for anaemia (microcytic hypochromic in iron deficiency, macrocytic in B12/folate deficiency) and morphological poikilocytosis (sickle cells, schistocytes, spherocytes, target cells).',
    keyFeatures: ['Anucleate biconcave disc', 'Central pallor (1/3 diameter)', 'Salmon-pink hemoglobinization'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="rbcNorm" cx="50%" cy="50%">
          <stop offset="0%" stop-color="#fee2e2"/>
          <stop offset="35%" stop-color="#fca5a5"/>
          <stop offset="85%" stop-color="#e11d48"/>
          <stop offset="100%" stop-color="#be123c"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill="url(#rbcNorm)" stroke="#9f1239" stroke-width="1.5"/>
      <ellipse cx="50" cy="50" rx="14" ry="14" fill="#ffedd5" opacity="0.65"/>
    </svg>`
  },
  {
    id: 'thrombocyte',
    name: 'Platelet (Thrombocyte)',
    category: 'Thrombocyte',
    scientificName: 'Thrombocytus',
    referencePercentage: '150 - 450 × 10⁹/L',
    stainAppearance: {
      cytoplasm: 'Pale light purple-blue outer zone (hyalomere) with central purple granules (granulomere)',
      nucleus: 'Anucleate cytoplasmic fragments of megakaryocytes',
      granules: 'Alpha-granules and dense granules containing clotting factors and serotonin'
    },
    morphology: [
      'Small disc-shaped fragment, 1.5 - 3 µm diameter',
      'Often clustered in small aggregates',
      'Critical for primary haemostasis and vascular plug formation'
    ],
    clinicalSignificance: 'Thrombocytopenia (<150 × 10⁹/L) increases bleeding risk (ITP, TTP, marrow failure). Thrombocytosis (>450 × 10⁹/L) seen in reactive states or essential thrombocythaemia.',
    keyFeatures: ['Smallest formed element (1.5-3 µm)', 'Anucleate granulomere cluster', 'Haemostatic plug formation'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="rbcBg6" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
      </defs>
      <!-- RBC background -->
      <circle cx="30" cy="30" r="24" fill="url(#rbcBg6)" opacity="0.5"/>
      <circle cx="75" cy="70" r="22" fill="url(#rbcBg6)" opacity="0.5"/>
      <!-- Platelets cluster -->
      <g>
        <circle cx="60" cy="35" r="7" fill="#e9d5ff" stroke="#a855f7" stroke-width="1"/>
        <circle cx="59" cy="34" r="1.5" fill="#581c87"/><circle cx="62" cy="36" r="1.2" fill="#581c87"/>
        
        <circle cx="45" cy="65" r="6" fill="#e9d5ff" stroke="#a855f7" stroke-width="1"/>
        <circle cx="44" cy="64" r="1.3" fill="#581c87"/><circle cx="46" cy="66" r="1" fill="#581c87"/>

        <circle cx="65" cy="52" r="8" fill="#e9d5ff" stroke="#a855f7" stroke-width="1"/>
        <circle cx="63" cy="51" r="1.6" fill="#581c87"/><circle cx="66" cy="53" r="1.4" fill="#581c87"/>
      </g>
    </svg>`
  },
  {
    id: 'myeloblast',
    name: 'Myeloblast (Leukaemic Precursor)',
    category: 'Blast / Precursor',
    scientificName: 'Myeloblastus',
    referencePercentage: '0% in normal peripheral blood (0 - 3% in normal bone marrow)',
    stainAppearance: {
      cytoplasm: 'Moderate to scant agranular basophilic (royal blue) cytoplasm',
      nucleus: 'Large round-to-oval nucleus with very fine, delicate "sifted" chromatin pattern',
      granules: 'Typically negative for specific granules; may contain Auer rods (fused lysosomes) in AML'
    },
    morphology: [
      'Diameter: 14 - 20 µm',
      'High N:C ratio (approx 4:1)',
      '2 to 5 distinct, pale punched-out nucleoli',
      'Pathological presence in peripheral blood confirms marrow release / leukaemia'
    ],
    clinicalSignificance: 'Diagnostic emergency! Presence in peripheral blood indicates Acute Myeloid Leukaemia (AML), blast crisis of CML, or high-risk myelodysplastic syndrome (MDS). Requires urgent haematological workup.',
    keyFeatures: ['2-5 prominent pale nucleoli', 'Delicate uncompacted chromatin', 'Pathognomonic in peripheral blood for acute leukaemia'],
    svgRender: (size = 120) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="blastCyto" cx="50%" cy="50%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></radialGradient>
        <radialGradient id="rbcBg7" cx="30%" cy="30%"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#e11d48"/></radialGradient>
      </defs>
      <!-- Nearby RBC -->
      <circle cx="14" cy="22" r="12" fill="url(#rbcBg7)" opacity="0.5"/>
      <circle cx="86" cy="80" r="13" fill="url(#rbcBg7)" opacity="0.5"/>
      <!-- Blast Cell -->
      <circle cx="50" cy="50" r="33" fill="url(#blastCyto)" stroke="#0369a1" stroke-width="1.5"/>
      <!-- Immature Nucleus -->
      <circle cx="49" cy="49" r="26" fill="#312e81"/>
      <!-- Nucleoli (Punched out pale areas) -->
      <circle cx="42" cy="42" r="4.2" fill="#93c5fd" opacity="0.85"/>
      <circle cx="56" cy="45" r="3.8" fill="#93c5fd" opacity="0.85"/>
      <circle cx="48" cy="57" r="4.0" fill="#93c5fd" opacity="0.85"/>
      <!-- Auer Rod (red needle in cytoplasm) -->
      <line x1="26" y1="58" x2="34" y2="64" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  }
];

export const SAMPLE_SLIDES: BloodSmearSample[] = [
  {
    id: 'sample-neutrophil-1',
    name: 'Specimen A: Acute Sepsis Reaction',
    category: 'Granulocyte',
    cellClassId: 'neutrophil',
    patientContext: '46yo female presenting with high fever (39.2°C), productive cough, and tachypnea. WBC count 18.4 × 10⁹/L.',
    slideStain: 'Wright-Giemsa (100x Oil Immersion)',
    magnification: '1000x total magnification',
    abnormalFeatureNote: 'Prominent toxic granulation and left shift observed alongside hypersegmented neutrophils.',
    groundTruthLabel: 'Segmented Neutrophil'
  },
  {
    id: 'sample-lymphocyte-1',
    name: 'Specimen B: Infectious Mononucleosis Screen',
    category: 'Agranulocyte',
    cellClassId: 'lymphocyte',
    patientContext: '19yo university student with sore throat, cervical lymphadenopathy, and splenomegaly. Monospot test positive.',
    slideStain: 'Leishman Stain',
    magnification: '1000x Oil Immersion',
    abnormalFeatureNote: 'Reactive Downey type II lymphocytes indented by adjacent erythrocytes.',
    groundTruthLabel: 'Small Lymphocyte'
  },
  {
    id: 'sample-monocyte-1',
    name: 'Specimen C: Chronic Monocytosis Investigation',
    category: 'Agranulocyte',
    cellClassId: 'monocyte',
    patientContext: '67yo male under investigation for persistent absolute monocytosis (>1.2 × 10⁹/L) for 3 months with mild fatigue.',
    slideStain: 'Wright-Giemsa Stain',
    magnification: '1000x Oil Immersion',
    abnormalFeatureNote: 'Large mononuclear cell with folded nucleus and delicate ground-glass cytoplasm with microvacuoles.',
    groundTruthLabel: 'Monocyte'
  },
  {
    id: 'sample-eosinophil-1',
    name: 'Specimen D: Allergic Hypereosinophilia',
    category: 'Granulocyte',
    cellClassId: 'eosinophil',
    patientContext: '32yo male with severe extrinsic asthma and atopic dermatitis flare. Absolute eosinophil count 2.4 × 10⁹/L.',
    slideStain: 'May-Grünwald Giemsa',
    magnification: '1000x Oil Immersion',
    abnormalFeatureNote: 'Characteristic refractile reddish-orange spherical granules packed uniformly in cytoplasm.',
    groundTruthLabel: 'Eosinophil'
  },
  {
    id: 'sample-basophil-1',
    name: 'Specimen E: CML Accelerated Phase Evaluation',
    category: 'Granulocyte',
    cellClassId: 'basophil',
    patientContext: '54yo male with known BCR-ABL1 positive CML presenting with splenomegaly and increasing basophil count (6%).',
    slideStain: 'Wright-Giemsa Stain',
    magnification: '1000x Oil Immersion',
    abnormalFeatureNote: 'Dark purple-black metachromatic granules heavily overlying and obscuring the nucleus.',
    groundTruthLabel: 'Basophil'
  },
  {
    id: 'sample-erythrocyte-1',
    name: 'Specimen F: Microcytic Hypochromic Anaemia',
    category: 'Erythrocyte',
    cellClassId: 'erythrocyte',
    patientContext: '28yo female with chronic menorrhagia and fatigue. Hb 8.4 g/dL, MCV 68 fL, Ferritin 6 µg/L.',
    slideStain: 'Standard Wright-Giemsa',
    magnification: '1000x Oil Immersion',
    abnormalFeatureNote: 'Exaggerated central pallor occupying > 1/2 of red cell diameter (hypochromia) and anisocytosis.',
    groundTruthLabel: 'Erythrocyte (RBC)'
  },
  {
    id: 'sample-blast-1',
    name: 'Specimen G: Acute Leukaemic Presentation',
    category: 'Blast / Precursor',
    cellClassId: 'myeloblast',
    patientContext: '61yo female presenting with spontaneous petechiae, gingival bleeding, and severe pancytopenia.',
    slideStain: 'Wright-Giemsa Stain (Urgent Stat)',
    magnification: '1000x Oil Immersion',
    abnormalFeatureNote: 'Primitive blast cells with prominent nucleoli (3 visible) and pathognomonic Auer rod in cytoplasm.',
    groundTruthLabel: 'Myeloblast (Leukaemic Precursor)'
  }
];
