export type CellCategory = 
  | 'Granulocyte' 
  | 'Agranulocyte' 
  | 'Erythrocyte' 
  | 'Thrombocyte' 
  | 'Blast / Precursor'
  | 'Artifact';

export type CellaVisionClassId =
  | 'segmented_neutrophil'
  | 'band_neutrophil'
  | 'lymphocyte'
  | 'reactive_lymphocyte'
  | 'monocyte'
  | 'eosinophil'
  | 'basophil'
  | 'metamyelocyte'
  | 'myelocyte'
  | 'promyelocyte'
  | 'blast'
  | 'plasma_cell'
  | 'smudge_cell'
  | 'unclassified';

export interface CellClass {
  id: string;
  name: string;
  category: CellCategory;
  scientificName: string;
  referencePercentage: string;
  stainAppearance: {
    cytoplasm: string;
    nucleus: string;
    granules?: string;
  };
  morphology: string[];
  clinicalSignificance: string;
  keyFeatures: string[];
  svgRender: (size?: number) => string;
}

export interface CellaVisionCellTile {
  id: string;
  tileIndex: number;
  xCoord: number; // coordinate on slide monolayer (µm)
  yCoord: number;
  aiPreClassId: CellaVisionClassId;
  aiConfidence: number;
  verifiedClassId: CellaVisionClassId;
  isVerified: boolean;
  reclassified: boolean;
  notes?: string;
  customImageUrl?: string;
  svgRenderKey: string;
  aspectVariants?: {
    rotation: number;
    brightness: number;
    contrast: number;
  };
}

export interface CbcAnalyzerIndices {
  wbc: number; // x 10^9/L
  rbc: number; // x 10^12/L
  hgb: number; // g/dL
  hct: number; // %
  mcv: number; // fL
  mch: number; // pg
  mchc: number; // g/dL
  plt: number; // x 10^9/L
  flags: string[];
}

export interface RbcMorphologyGrading {
  anisocytosis: 0 | 1 | 2 | 3; // 0=Normal, 1=Slight, 2=Moderate, 3=Marked
  poikilocytosis: 0 | 1 | 2 | 3;
  hypochromia: 0 | 1 | 2 | 3;
  polychromasia: 0 | 1 | 2 | 3;
  targetCells: 0 | 1 | 2 | 3;
  schistocytes: 0 | 1 | 2 | 3;
  spherocytes: 0 | 1 | 2 | 3;
  sickleCells: 0 | 1 | 2 | 3;
  teardropCells: 0 | 1 | 2 | 3;
  howellJollyBodies: 0 | 1 | 2 | 3;
}

export interface PlateletEstimation {
  averagePerField100x: number;
  estimatedCount: number; // approx average * 15 (x 10^9/L)
  morphologyNote: 'Normal morphology' | 'Giant platelets present' | 'Platelet clumping observed' | 'Severe thrombocytopenia';
}

export interface ClinicalPatientCase {
  id: string;
  accessionNumber: string;
  patientName: string;
  patientAgeGender: string;
  department: string;
  collectionTime: string;
  clinicalHistory: string;
  analyzerIndices: CbcAnalyzerIndices;
  cells: CellaVisionCellTile[];
  rbcGrading: RbcMorphologyGrading;
  plateletEstimation: PlateletEstimation;
  reviewStatus: 'In Review' | 'Verified' | 'Signed Off';
  technicianName: string;
  technicianComments: string;
  pathologistName?: string;
  pathologistLicense?: string;
  pathologistComments?: string;
  electronicSignature?: string;
  signatureHash?: string;
  signedOffAt?: string;
}

export interface AugmentationSettings {
  resizeWidth: number;
  resizeHeight: number;
  horizontalFlip: boolean;
  verticalFlip: boolean;
  rotationDegrees: number;
  brightnessJitter: number;
  contrastJitter: number;
  applyNormalization: boolean;
  mean: [number, number, number];
  std: [number, number, number];
}

export interface TrainingHyperparameters {
  batchSize: number;
  epochs: number;
  learningRate: number;
  device: 'mps' | 'cuda' | 'cpu';
  schedulerPatience: number;
  schedulerFactor: number;
  trainSplitRatio: number;
}

export interface EpochRecord {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  valAccuracy: number;
  lr: number;
  isBestLoss: boolean;
  checkpointSaved: boolean;
  batchesCompleted: number;
  totalBatches: number;
}

export interface ModelPrediction {
  classId: string;
  className: string;
  category: CellCategory;
  logit: number;
  probability: number;
}

export interface InferenceResult {
  topPrediction: ModelPrediction;
  allPredictions: ModelPrediction[];
  tensorShape: [number, number, number, number];
  featureVectorPreview: number[];
  rawLogits: number[];
  computationDevice: string;
  timestamp: string;
}

export interface BloodSmearSample {
  id: string;
  name: string;
  category: CellCategory;
  cellClassId: string;
  patientContext: string;
  slideStain: string;
  magnification: string;
  abnormalFeatureNote?: string;
  groundTruthLabel: string;
}
