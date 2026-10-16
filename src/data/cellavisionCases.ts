import { ClinicalPatientCase, CellaVisionCellTile, CellaVisionClassId } from '../types';
import { REAL_CELL_PHOTO_MAP } from './referenceAtlas';

// Helper to generate a 100-cell realistic slide distribution
function generateCellCohort(
  casePrefix: string,
  classDistribution: Array<{ classId: CellaVisionClassId; count: number; confidenceRange: [number, number]; borderlineMistake?: CellaVisionClassId }>
): CellaVisionCellTile[] {
  const cells: CellaVisionCellTile[] = [];
  let index = 1;

  classDistribution.forEach(dist => {
    for (let i = 0; i < dist.count; i++) {
      // 10% of borderline cases are initially pre-classified by AI as the mistake (e.g., Band called Seg)
      const isAIErr = Boolean(dist.borderlineMistake && i === 0);
      const aiPre = isAIErr ? dist.borderlineMistake! : dist.classId;
      const verified = dist.classId; // true ground truth

      const minConf = dist.confidenceRange[0];
      const maxConf = dist.confidenceRange[1];
      const conf = Number((minConf + Math.random() * (maxConf - minConf)).toFixed(2));

      // Random monolayer coordinates on slide (10mm to 35mm region)
      const xCoord = Math.round(12000 + Math.random() * 22000);
      const yCoord = Math.round(8000 + Math.random() * 14000);

      const rot = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
      const bright = Number(((Math.random() - 0.5) * 0.12).toFixed(2));
      const cont = Number(((Math.random() - 0.5) * 0.12).toFixed(2));

      cells.push({
        id: `${casePrefix}-cell-${String(index).padStart(3, '0')}`,
        tileIndex: index,
        xCoord,
        yCoord,
        aiPreClassId: aiPre,
        aiConfidence: conf,
        verifiedClassId: verified,
        isVerified: false,
        reclassified: isAIErr,
        svgRenderKey: dist.classId,
        customImageUrl: REAL_CELL_PHOTO_MAP[dist.classId],
        aspectVariants: { rotation: rot, brightness: bright, contrast: cont },
      });

      index++;
    }
  });

  // Shuffle cells slightly to simulate finding them across the slide scan area
  return cells.sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, tileIndex: i + 1 }));
}

export const INITIAL_CELLAVISION_CASES: ClinicalPatientCase[] = [
  {
    id: 'case-sepsis-01',
    accessionNumber: 'ACC-89241',
    patientName: 'Elena Rostova',
    patientAgeGender: '46Y / Female',
    department: 'Intensive Care Unit (ICU)',
    collectionTime: 'Today, 06:45',
    clinicalHistory: 'Post-op day 3 bowel resection with sudden fever (39.5°C), tachycardia (128 bpm), hypotension, and suspected septic shock.',
    analyzerIndices: {
      wbc: 18.4,
      rbc: 3.65,
      hgb: 10.4,
      hct: 32.1,
      mcv: 88.0,
      mch: 28.5,
      mchc: 32.4,
      plt: 142,
      flags: ['WBC LEUKOCYTOSIS', 'LEFT SHIFT FLAG', 'NEUTROPHILIA', 'TOXIC GRANULATION ALERT'],
    },
    rbcGrading: {
      anisocytosis: 1,
      poikilocytosis: 1,
      hypochromia: 0,
      polychromasia: 1,
      targetCells: 0,
      schistocytes: 1,
      spherocytes: 0,
      sickleCells: 0,
      teardropCells: 0,
      howellJollyBodies: 0,
    },
    plateletEstimation: {
      averagePerField100x: 9.5,
      estimatedCount: 142,
      morphologyNote: 'Normal morphology',
    },
    reviewStatus: 'In Review',
    technicianName: 'S. Poulton (Senior MLT)',
    technicianComments: 'Significant left shift with band neutrophils, metamyelocytes, and toxic granulation in >60% of neutrophils.',
    cells: generateCellCohort('case1', [
      { classId: 'segmented_neutrophil', count: 58, confidenceRange: [0.88, 0.99] },
      { classId: 'band_neutrophil', count: 18, confidenceRange: [0.78, 0.94], borderlineMistake: 'segmented_neutrophil' },
      { classId: 'metamyelocyte', count: 4, confidenceRange: [0.82, 0.92], borderlineMistake: 'band_neutrophil' },
      { classId: 'myelocyte', count: 1, confidenceRange: [0.85, 0.95] },
      { classId: 'lymphocyte', count: 11, confidenceRange: [0.92, 0.99] },
      { classId: 'monocyte', count: 5, confidenceRange: [0.86, 0.96] },
      { classId: 'eosinophil', count: 2, confidenceRange: [0.94, 0.99] },
      { classId: 'basophil', count: 1, confidenceRange: [0.89, 0.96] },
    ]),
  },
  {
    id: 'case-cml-02',
    accessionNumber: 'ACC-89315',
    patientName: 'David Vance',
    patientAgeGender: '59Y / Male',
    department: 'Haematology Outpatient Clinic',
    collectionTime: 'Today, 08:30',
    clinicalHistory: 'Known BCR-ABL1 positive Chronic Myeloid Leukaemia; progressive splenomegaly (8 cm below costal margin), fatigue, and night sweats.',
    analyzerIndices: {
      wbc: 74.2,
      rbc: 3.12,
      hgb: 9.2,
      hct: 28.4,
      mcv: 91.0,
      mch: 29.5,
      mchc: 32.4,
      plt: 580,
      flags: ['EXTREME LEUKOCYTOSIS', 'IMMATURE GRANULOCYTE FLAG', 'BASOPHILIA', 'THROMBOCYTOSIS'],
    },
    rbcGrading: {
      anisocytosis: 2,
      poikilocytosis: 1,
      hypochromia: 1,
      polychromasia: 1,
      targetCells: 0,
      schistocytes: 0,
      spherocytes: 0,
      sickleCells: 0,
      teardropCells: 1,
      howellJollyBodies: 0,
    },
    plateletEstimation: {
      averagePerField100x: 38.0,
      estimatedCount: 570,
      morphologyNote: 'Giant platelets present',
    },
    reviewStatus: 'In Review',
    technicianName: 'S. Poulton (Senior MLT)',
    technicianComments: 'Full granulocytic maturation cascade present with 7% basophils and 3% circulating myeloblasts. Concern for accelerated phase CML.',
    cells: generateCellCohort('case2', [
      { classId: 'segmented_neutrophil', count: 35, confidenceRange: [0.89, 0.98] },
      { classId: 'band_neutrophil', count: 18, confidenceRange: [0.82, 0.95] },
      { classId: 'metamyelocyte', count: 12, confidenceRange: [0.84, 0.94] },
      { classId: 'myelocyte', count: 10, confidenceRange: [0.86, 0.96] },
      { classId: 'promyelocyte', count: 3, confidenceRange: [0.80, 0.92] },
      { classId: 'blast', count: 3, confidenceRange: [0.85, 0.96], borderlineMistake: 'promyelocyte' },
      { classId: 'basophil', count: 7, confidenceRange: [0.93, 0.99] },
      { classId: 'eosinophil', count: 4, confidenceRange: [0.92, 0.98] },
      { classId: 'lymphocyte', count: 5, confidenceRange: [0.91, 0.98] },
      { classId: 'monocyte', count: 3, confidenceRange: [0.88, 0.95] },
    ]),
  },
  {
    id: 'case-mononucleosis-03',
    accessionNumber: 'ACC-89402',
    patientName: 'Chloe Bennett',
    patientAgeGender: '19Y / Female',
    department: 'Emergency Department',
    collectionTime: 'Today, 09:15',
    clinicalHistory: 'Tonsillitis with exudate, marked bilateral cervical lymphadenopathy, profound lethargy, and mild tender splenomegaly.',
    analyzerIndices: {
      wbc: 15.2,
      rbc: 4.45,
      hgb: 13.1,
      hct: 39.8,
      mcv: 89.4,
      mch: 29.4,
      mchc: 32.9,
      plt: 185,
      flags: ['ATYPICAL LYMPHOCYTES DETECTED', 'LYMPHOCYTOSIS FLAG', 'WBC ABNORMAL SCATTER'],
    },
    rbcGrading: {
      anisocytosis: 0,
      poikilocytosis: 0,
      hypochromia: 0,
      polychromasia: 0,
      targetCells: 0,
      schistocytes: 0,
      spherocytes: 0,
      sickleCells: 0,
      teardropCells: 0,
      howellJollyBodies: 0,
    },
    plateletEstimation: {
      averagePerField100x: 12.0,
      estimatedCount: 180,
      morphologyNote: 'Normal morphology',
    },
    reviewStatus: 'In Review',
    technicianName: 'S. Poulton (Senior MLT)',
    technicianComments: 'Marked reactive lymphocytosis (Downey Type II variants) classic for acute Epstein-Barr Virus (EBV) infectious mononucleosis.',
    cells: generateCellCohort('case3', [
      { classId: 'lymphocyte', count: 38, confidenceRange: [0.90, 0.99] },
      { classId: 'reactive_lymphocyte', count: 26, confidenceRange: [0.82, 0.95], borderlineMistake: 'monocyte' },
      { classId: 'segmented_neutrophil', count: 24, confidenceRange: [0.89, 0.98] },
      { classId: 'monocyte', count: 8, confidenceRange: [0.85, 0.95] },
      { classId: 'eosinophil', count: 3, confidenceRange: [0.92, 0.98] },
      { classId: 'basophil', count: 1, confidenceRange: [0.90, 0.97] },
    ]),
  },
  {
    id: 'case-aml-04',
    accessionNumber: 'ACC-89510',
    patientName: 'Robert Thornton',
    patientAgeGender: '63Y / Male',
    department: 'Haematology Inpatient Ward',
    collectionTime: 'Today, 10:00',
    clinicalHistory: 'Spontaneous mucosal bleeding, epistaxis, extensive skin petechiae, fever, and profound pancytopenia on analyzer.',
    analyzerIndices: {
      wbc: 2.1,
      rbc: 2.35,
      hgb: 6.9,
      hct: 20.8,
      mcv: 88.5,
      mch: 29.4,
      mchc: 33.2,
      plt: 24,
      flags: ['CRITICAL PANCYTOPENIA', 'BLASTS / SUSPECTED LEUKAEMIA', 'THROMBOCYTOPENIA < 50', 'ANAEMIA ALERT'],
    },
    rbcGrading: {
      anisocytosis: 2,
      poikilocytosis: 2,
      hypochromia: 1,
      polychromasia: 1,
      targetCells: 0,
      schistocytes: 1,
      spherocytes: 0,
      sickleCells: 0,
      teardropCells: 1,
      howellJollyBodies: 1,
    },
    plateletEstimation: {
      averagePerField100x: 1.5,
      estimatedCount: 22,
      morphologyNote: 'Severe thrombocytopenia',
    },
    reviewStatus: 'In Review',
    technicianName: 'S. Poulton (Senior MLT)',
    technicianComments: 'CRITICAL VALUE ALERT: 52% Myeloblasts with delicate chromatin, multiple nucleoli, and Auer rods. Pathologist immediate page triggered.',
    cells: generateCellCohort('case4', [
      { classId: 'blast', count: 52, confidenceRange: [0.88, 0.99] },
      { classId: 'promyelocyte', count: 4, confidenceRange: [0.80, 0.92], borderlineMistake: 'blast' },
      { classId: 'segmented_neutrophil', count: 18, confidenceRange: [0.88, 0.98] },
      { classId: 'lymphocyte', count: 20, confidenceRange: [0.92, 0.99] },
      { classId: 'monocyte', count: 5, confidenceRange: [0.85, 0.94] },
      { classId: 'smudge_cell', count: 1, confidenceRange: [0.82, 0.90] },
    ]),
  },
  {
    id: 'case-normal-05',
    accessionNumber: 'ACC-89104',
    patientName: 'Marcus Wright',
    patientAgeGender: '34Y / Male',
    department: 'Occupational Health',
    collectionTime: 'Today, 11:20',
    clinicalHistory: 'Annual executive physical examination. Asymptomatic, non-smoker.',
    analyzerIndices: {
      wbc: 6.8,
      rbc: 4.85,
      hgb: 15.2,
      hct: 44.8,
      mcv: 92.4,
      mch: 31.3,
      mchc: 33.9,
      plt: 245,
      flags: ['NORMAL SCAN', 'NO ABNORMAL FLAGS'],
    },
    rbcGrading: {
      anisocytosis: 0,
      poikilocytosis: 0,
      hypochromia: 0,
      polychromasia: 0,
      targetCells: 0,
      schistocytes: 0,
      spherocytes: 0,
      sickleCells: 0,
      teardropCells: 0,
      howellJollyBodies: 0,
    },
    plateletEstimation: {
      averagePerField100x: 16.0,
      estimatedCount: 240,
      morphologyNote: 'Normal morphology',
    },
    reviewStatus: 'Verified',
    technicianName: 'S. Poulton (Senior MLT)',
    technicianComments: 'Normal peripheral blood smear morphology. Normal leukocyte distribution with unremarkable RBC and platelet morphology.',
    cells: generateCellCohort('case5', [
      { classId: 'segmented_neutrophil', count: 62, confidenceRange: [0.92, 0.99] },
      { classId: 'band_neutrophil', count: 2, confidenceRange: [0.85, 0.94] },
      { classId: 'lymphocyte', count: 27, confidenceRange: [0.94, 0.99] },
      { classId: 'monocyte', count: 6, confidenceRange: [0.88, 0.96] },
      { classId: 'eosinophil', count: 2, confidenceRange: [0.93, 0.99] },
      { classId: 'basophil', count: 1, confidenceRange: [0.91, 0.97] },
    ]),
  },
];
