```markdown
# HaemHelper: Peripheral Blood Smear Classification

This repository contains the data engineering and PyTorch training infrastructure for HaemHelper, a lightweight multi-class image classification pipeline designed for haematology diagnostics and peripheral blood smear analysis.

## Core Architecture

* **Transfer Learning:** Utilises `ResNet18` (via `torchvision.models`), replacing the final fully connected layer to dynamically map to the number of blood cell classes detected in the dataset.
* **Hardware Acceleration:** The training loops are written to dynamically detect and utilise Apple Silicon's Metal Performance Shaders (`mps`) for high-speed local GPU training without cloud overhead.
* **Morphological Augmentation:** The data loader applies aggressive augmentation (rotations, flips, and color jitter) to simulate real-world variance in laboratory slide preparation and staining intensity.
* **Smart Training Logic:** Implements a `ReduceLROnPlateau` scheduler and strict validation-loss monitoring to save optimal weights before the model overfits to specific institutional data.

## File Structure

```text
├── haematology_loader.py    # ImageNet standardisation, morphological augmentation, and train/val splitting
├── train_haematology.py     # Core production training loop with learning rate scheduling
└── README.md                # Project documentation

```

## Running Locally

To initiate the training sequence locally, ensure your dataset is placed in a `./data/haematology` directory with standard PyTorch `ImageFolder` sub-classing (e.g., one folder per cell type).

```bash
# 1. Install dependencies
pip install torch torchvision

# 2. Boot the training loop
python3 train_haematology.py

```
```
