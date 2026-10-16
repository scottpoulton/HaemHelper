# HaemHelper: CellaVision Digital Morphology & PyTorch Training Suite

HaemHelper is a clinical digital morphology workstation and interactive PyTorch suite for automated peripheral blood smear analysis, multi-class leukocyte classification, and laboratory differential verification—modeled after clinical **CellaVision** systems.

## Key Workflows & Features

* **CellaVision Pre-Classification Gallery Grid:** Scans and presents 100+ individual localized leukocytes organized by lineage into distinct category groups (Segmented Neutrophils, Bands, Metamyelocytes, Myelocytes, Promyelocytes, Blasts, Reactive Lymphocytes, Monocytes, Eosinophils, Basophils, Plasma Cells, Smudge Cells).
* **Interactive Technologist Reclassification:** 1-click and rapid keyboard hotkey reclassification (`S` for Seg, `B` for Band, `T` for Meta, `Y` for Myelo, `P` for Pro, `X` for Blast, `L` for Lymph, `R` for Reactive Lymph, `M` for Mono, `E` for Eos, `A` for Baso).
* **High-Magnification Cell Inspector & Oil Immersion Reticle:** High-resolution digital zoom with spatial monolayer coordinate tracking `(X, Y in µm)`.
* **Dual-Cell Reference Atlas Comparator:** Side-by-side split screen comparing suspected patient cells against textbook gold-standard reference cells with diagnostic hallmarks and differential pitfalls.
* **Erythrocyte (RBC) Morphology Matrix:** Semi-quantitative grading (0 to 3+) for anisocytosis, poikilocytosis, hypochromia, polychromasia, target cells, schistocytes, spherocytes, teardrops, and Howell-Jolly bodies.
* **Platelet Estimation:** Average platelets per 100x oil field multiplied by laboratory factor to verify against automated hematology analyzer counts and detect pseudothrombocytopenia.
* **Laboratory Validation & Pathologist Sign-Off:** Full audit tracking comparing AI pre-classification accuracy vs. technologist verified counts, senior pathologist diagnostic comments, and exportable/printable reports.
* **Multi-Case Worklist & Custom Upload:** Pre-loaded clinical cases (Septic Left Shift, Accelerated CML, Mononucleosis, Acute Leukaemia Blast Crisis, Normal Adult Screen) and custom multi-cell blood smear import.
* **PyTorch ResNet-18 Infrastructure:** Interactive training studio, `ReduceLROnPlateau` scheduling, morphological data augmentation simulator, model graph layer inspector, and original source exporter.

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```
