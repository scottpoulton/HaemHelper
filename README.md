# HaemHelper

HaemHelper is a digital peripheral blood smear workstation and PyTorch classification pipeline. It combines an interactive 100-cell leukocyte differential interface (modeled on clinical CellaVision review workflows) with a ResNet-18 training and ONNX browser inference pipeline.

## Overview

The project is split into two parts:
1. **Frontend Morphology Workstation (`src/`):** A React + TypeScript interface for reviewing pre-classified peripheral blood smears, reclassifying leukocytes via keyboard hotkeys or drag-and-drop, grading erythrocyte (RBC) morphology, estimating platelet counts from 100x oil-immersion fields, and comparing cells side-by-side against a reference atlas.
2. **PyTorch Training & ONNX Export (`python/`):** A torchvision `ImageFolder` data loader with orientation/stain augmentations, a fine-tuned ResNet-18 model definition, a training script with `ReduceLROnPlateau` scheduling, and an ONNX exporter for running client-side inference via `onnxruntime-web`.

## Key Features

- **100-Cell Leukocyte Differential:** Group-by-lineage gallery supporting 1-click verification, drag-and-drop bucket reassignment, and keyboard hotkeys (`S` Seg, `B` Band, `T` Meta, `Y` Myelo, `P` Pro, `X` Blast, `L` Lymph, `R` Reactive Lymph, `M` Mono, `E` Eos, `A` Baso).
- **Side-by-Side Reference Comparator:** Inspect patient cells under a 100x oil-immersion reticle alongside reference micrographs, nuclear-to-cytoplasmic (N:C) ratios, chromatin descriptions, and common differential pitfalls.
- **RBC & Platelet Grading:** Semi-quantitative (0 to 3+) grading for anisocytosis, poikilocytosis, schistocytes, teardrops, and polychromasia, plus a 100x field platelet estimator (`average per field × 15`) to cross-check automated analyzer counts.
- **Whole-Slide Monolayer Cropper:** Pan and zoom across peripheral smear scans, click individual leukocytes to crop 160×160px patches via HTML5 canvas, and append them to the active differential.
- **Client-Side ONNX Inference:** Run exported `.onnx` checkpoints directly in the browser using WebAssembly (`onnxruntime-web`), with a deterministic simulation fallback when local weights are not present.

## Repository Structure

```text
├── python/
│   ├── haematology_loader.py   # ImageFolder dataset & stain/rotation augmentations
│   ├── model.py                # ResNet-18 backbone with Dropout(0.5) + Linear head
│   ├── train_haematology.py    # Training loop with ReduceLROnPlateau & checkpointing
│   ├── export_onnx.py          # Exports .pth state_dict to public/models/haem_resnet18.onnx
│   └── requirements.txt        # Python dependencies
├── src/
│   ├── components/             # Workstation UI, cell inspector, RBC/PLT grading,modals
│   ├── data/                   # Pre-loaded clinical cases & reference morphology criteria
│   ├── utils/                  # ONNX runtime wrapper & normalization utilities
│   └── types.ts                # TypeScript interfaces
└── package.json

```

## Getting Started

### 1. Run the Web Workstation

```bash
npm install
npm run dev

```

The application will start at `http://localhost:3000`.

### 2. Train & Export the PyTorch Model (Optional)

To train the ResNet-18 classifier on your own peripheral blood smear dataset (organized by class folders under `python/data/haematology/`) and export it for browser inference:

```bash
cd python
pip install -r requirements.txt

# Train model and save best checkpoint
python train_haematology.py --data-dir ./data/haematology --epochs 50 --out haematology_production.pth

# Export checkpoint (or initialized architecture) to ONNX for the web app
python export_onnx.py --checkpoint haematology_production.pth --out ../public/models/haem_resnet18.onnx

```