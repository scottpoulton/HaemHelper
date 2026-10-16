# CellaVision Digital Morphology Workstation Plan

HaemHelper currently operates as an interactive ResNet-18 single-slide inference and PyTorch training simulator. To bring it in line with clinical **CellaVision** systems (DM9600 / DC-1), this plan upgrades the application into an automated digital morphology workstation featuring multi-cell pre-classification galleries, interactive technologist reclassification, whole-slide monolayer navigation, dual-cell comparison with an annotated reference atlas, and a clinical laboratory sign-off report.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed based on the initial technical interview:

- **Confirmed Core Capability:** The primary workflow is the **CellaVision Pre-Classification Cell Gallery with Interactive Reclassification**, allowing hematologists to review 100+ located leukocytes grouped by pre-classified lineages and reclassify misclassified or borderline cells via single-click and keyboard controls.
- **Confirmed Case Management:** The system will support both **curated clinical patient cases** (with full CBC analyzer flags, clinical histories, and annotated cell coordinates) and **custom multi-cell blood smear batch uploads** (processing multi-cell crops with the ResNet-18 model).
- **Confirmed Sign-Off Protocol:** A complete **Laboratory Validation & Pathologist Sign-Off Workflow**, generating pre-classification vs. post-verification audit metrics, technician validation timestamps, pathologist diagnostic remarks, and an exportable/printable clinical hematology report.

---

## 1. Overview & Core Concept

### What It Delivers
A digital hematology workstation that mirrors the clinical workflow of CellaVision automated microscopy:
1. **Slide Case Worklist & Monolayer Map:** Displays patient clinical indications, automated analyzer CBC indices (WBC, RBC, Hb, Platelet flags), and an interactive slide monolayer scan map indicating cell coordinates.
2. **Pre-Classification Gallery (CellaVision Grid):** 100+ segmented WBC micrographs organized by AI pre-classification into distinct category rows (Segmented Neutrophils, Bands, Lymphocytes, Reactive Lymphocytes, Monocytes, Eosinophils, Basophils, Metamyelocytes, Myelocytes, Promyelocytes, Blasts, Smudge Cells).
3. **Interactive Reclassification Workspace:** Technologists can select any cell, inspect high-magnification details, and instantly reclassify it to another category with real-time differential percentage recalculation.
4. **Dual-Cell Comparator & Reference Atlas:** Side-by-side split screen comparing any suspected patient cell against verified gold-standard reference atlas cells.
5. **RBC Morphology & Platelet Estimation Matrix:** Semi-quantitative grading (0 to 3+) for poikilocytosis (schistocytes, spherocytes, target cells) and 100x field platelet estimation.
6. **Pathology Sign-Off & Laboratory Report:** Formal clinical sign-off interface with audit tracking of AI pre-classification accuracy vs. technologist verified counts, comments, and exportable laboratory reports.

### Target Audience & Persona
- Clinical hematology scientists, medical laboratory technologists (MLTs), and hematopathologists reviewing peripheral blood smears.

---

## 2. User Experience & Visual Design

Following the **Science, Space & Biotech** visual design constitution:
- **Aesthetic Tone:** Clinical obsidian dark canvas (`#090D16`) with slate structural panels (`#111827`), crisp 1px hairline dividers (`#1E293B`), and laser-calibrated accents: cell morphology violet (`#A855F7`), clinical rose (`#F43F5E`), and verified emerald (`#10B981`).
- **Typography:** Display titles in `Plus Jakarta Sans`, data metrics, cell counts, coordinates, and CBC values strictly formatted with `JetBrains Mono` and `font-mono tabular-nums`.
- **Zero-Pill Discipline:** Unboxed metadata tags separated by typographic dots (`·`), clean segmented toolbar buttons, and no decorative status pulses.
- **Microscopy Reticle HUD:** High-resolution digital zoom (up to 400x digital inspection) with coordinate probes and oil immersion boundary indicators.

---

## 3. Technical Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CellaVision Workspace Shell                        │
├───────────────────┬────────────────────────────────────────────────────┤
│ Worklist & Cases  │  Active Case: Accession #H-89241 (Sepsis Reaction) │
│ • Patient History │  WBC: 18.4 · RBC: 3.82 · Hgb: 11.2 · Plt: 142      │
├───────────────────┴────────────────────────────────────────────────────┤
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  Pre-Classification Gallery Grid (100+ Cells Grouped by Lineage)   │ │
│ │  [Segs: 58]  [Bands: 12]  [Lymphs: 18]  [Monos: 7]  [Eos: 3]...     │ │
│ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │ │
│ │  │ #01  │ │ #02  │ │ #03  │ │ #04  │ │ #05  │ │ #06  │ ...         │ │
│ │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌───────────────────────────────┬────────────────────────────────────┐ │
│ │ High-Mag Cell Inspector       │ Technologist Reclassification Box  │ │
│ │ • 100x Oil Reticle View       │ • Quick Target Lineage Buttons     │ │
│ │ • Stain & Chromatin Profiles  │ • Keyboard Hotkey Reassigner       │ │
│ │ • Split Reference Comparator  │ • Verification Checkmark           │ │
│ └───────────────────────────────┴────────────────────────────────────┘ │
│                                                                        │
│ ┌───────────────────────────────┬────────────────────────────────────┐ │
│ │ RBC Grading & Platelet Est.   │ Laboratory Sign-Off & Audit Report │ │
│ │ • Anisocytosis / Poikilocyt. │ • Pre-Classified vs Verified Count  │ │
│ │ • Platelet count per 100x HPF │ • Pathologist Signature & Export   │ │
│ └───────────────────────────────┴────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Implementation Steps

1. **Cell & Case Data Model Expansion:**
   - Define multi-cell patient cases with 100+ individual pre-segmented leukocyte tiles with coordinate tracking `(x, y)` on the monolayer.
   - Pre-classification state (`aiPreClassId`, `aiConfidence`, `verifiedClassId`, `isVerified`, `reclassifiedAt`).
2. **CellaVision Gallery Component:**
   - Multi-category segmented tile grid showing all 100+ cells.
   - Category summary headers showing count and differential percentage.
   - Batch selection, multi-cell verification, and quick-move actions.
3. **Interactive Cell Inspector & Reference Comparator:**
   - High-power field modal or split pane with zoom, contrast adjustments, and side-by-side display of the selected cell alongside textbook gold-standard reference cells.
4. **RBC Morphology & Platelet Estimation Panel:**
   - Semi-quantitative grading for microcytosis, macrocytosis, hypochromia, and poikilocytosis variants.
5. **Clinical Sign-Off & Verification Report Generator:**
   - Technologist review and senior pathologist sign-off workflow.
   - Audit view showing model accuracy, confusion delta (where human disagreed with model), and printable diagnostic report.
