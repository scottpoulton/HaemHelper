import React, { useState } from 'react';
import { Code2, Copy, Check, Download, FileCode } from 'lucide-react';

const HAEMATOLOGY_LOADER_PY = `import os
import copy
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split

def get_haem_dataloaders(data_dir="./data/haematology", batch_size=32):
    print("Initialising Haematology ImageFolder pipeline...")
    
    # 1. Define the mathematical filters (Same as your histology model!)
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(90),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 2. Load the dataset automatically from the folder structure
    try:
        full_dataset = datasets.ImageFolder(root=data_dir, transform=train_transforms)
        classes = full_dataset.classes
        print(f"Successfully mapped {len(classes)} cell types: {classes}")
    except Exception as e:
        print(f"Error loading images. Did you download them to {data_dir} yet?")
        return None, None, None

    # 3. Split the data (80% Training, 20% Validation)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
    
    val_dataset.dataset = copy.copy(full_dataset)
    
    # Safely overrides ONLY the validation data
    val_dataset.dataset.transform = val_transforms

    # 4. Build the DataLoaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    print(f"Blood Smear DataLoaders ready! Train batches: {len(train_loader)} | Val batches: {len(val_loader)}")
    
    return train_loader, val_loader, classes

if __name__ == "__main__":
    get_haem_dataloaders()
`;

const MODEL_PY = `import torch
import torch.nn as nn
from torchvision import models

def get_histo_model(num_classes=2):
    """
    Loads a pre-trained ResNet18 model and modifies the final layer
    for our specific binary/multi-class classification task.
    """
    print("Downloading pre-trained ResNet18 weights...")
    # 1. Load the pre-trained ResNet18 architecture
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    
    # 2. Find out how many inputs the final Fully Connected (fc) layer takes
    num_ftrs = model.fc.in_features
    
    # 3. Replace the final layer with a new one that outputs exactly 'num_classes'
    model.fc = nn.Sequential(
        nn.Dropout(p=0.5), # Randomly drops 50% of connections to prevent overfitting
        nn.Linear(num_ftrs, num_classes)
    )
    
    return model

if __name__ == "__main__":
    print("--- Initializing HistoHelper Architecture MVP ---")
    
    # Instantiate our modified model
    histo_model = get_histo_model(num_classes=2)
    
    # Create a dummy "batch" of 8 images (just like the ones from our DataLoader)
    # Shape: (Batch Size=8, Channels=3, Height=224, Width=224)
    dummy_tensor = torch.randn(8, 3, 224, 224)
    
    print("\\nFeeding dummy batch to the network...")
    
    # Pass the dummy images through the model
    predictions = histo_model(dummy_tensor)
    
    print("\\n--- Network Output ---")
    print(f"Output Tensor Shape: {predictions.shape}")
    print("   -> (Batch Size, Number of Classes)")
    print("\\nExample raw 'logits' for the first image:", predictions[0].detach().numpy())
    print("(These numbers will be fed into a probability function later!)")
`;

const TRAIN_HAEMATOLOGY_PY = `import torch
import torch.nn as nn
import torch.optim as optim
from haematology_loader import get_haem_dataloaders
from model import get_histo_model

# --- Configuration ---
BATCH_SIZE = 32
EPOCHS = 100
LEARNING_RATE = 0.0001      # Slightly lower than before for stability with massive datasets

def train_model():
    print("--- Starting Haematology Production Training ---")
    
    # 1. Hardware Check
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Utilizing Compute Device: {device.type.upper()}")

    # 2. Load DataLoaders (from our haematology pipeline)
    print("Loading DataLoaders...")
    train_loader, val_loader, classes = get_haem_dataloaders(batch_size=BATCH_SIZE)
    
    if train_loader is None:
        print("Aborting training: No data found.")
        return
        
    print(f"Initializing Model for {len(classes)} classes...")
    model = get_histo_model(num_classes=len(classes)).to(device)

    # 3. Define the Teacher (Loss) and the Mechanic (Optimizer)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=3)

    # Track the best validation score to prevent overfitting
    best_val_loss = float('inf')

    print("\\n--- Beginning Training Phase ---")
    for epoch in range(EPOCHS):
        # 1. TRAINING PHASE (Learning)
        model.train() # Unfreeze weights
        running_train_loss = 0.0
        
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_train_loss += loss.item()
            
            if (batch_idx + 1) % 50 == 0:
                print(f"Epoch [{epoch+1}/{EPOCHS}] | Train Batch [{batch_idx+1}/{len(train_loader)}] | Loss: {loss.item():.4f}")

        avg_train_loss = running_train_loss / len(train_loader)

        # 2. VALIDATION PHASE (Testing)
        print("\\n--- Evaluating on Validation Set ---")
        model.eval() # Freeze weights
        running_val_loss = 0.0
        correct_preds = 0
        total_preds = 0
        
        with torch.no_grad():
            for val_idx, (val_images, val_labels) in enumerate(val_loader):
                val_images, val_labels = val_images.to(device), val_labels.to(device)
                val_outputs = model(val_images)
                
                v_loss = criterion(val_outputs, val_labels)
                running_val_loss += v_loss.item()
                
                _, predicted = torch.max(val_outputs.data, 1)
                total_preds += val_labels.size(0)
                correct_preds += (predicted == val_labels).sum().item()

        avg_val_loss = running_val_loss / len(val_loader)
        val_accuracy = 100 * correct_preds / total_preds

        scheduler.step(avg_val_loss)

        print(f"-> Epoch {epoch+1} Summary:")
        print(f"   Train Loss: {avg_train_loss:.4f}")
        print(f"   Val Loss:   {avg_val_loss:.4f} | Val Accuracy: {val_accuracy:.2f}%")

        # 3. SAVE THE BEST BRAIN
        if avg_val_loss < best_val_loss:
            print(f"Validation loss improved from {best_val_loss:.4f} to {avg_val_loss:.4f}. Saving weights!")
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), "haematology_production.pth")
        else:
            print("Validation loss did not improve. Weights not saved to prevent overfitting.")
        print("-" * 50 + "\\n")

if __name__ == "__main__":
    train_model()
`;

export const PyTorchSourceView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'loader' | 'model' | 'train'>('train');
  const [copied, setCopied] = useState(false);

  const files = {
    loader: {
      name: 'src/haematology_loader.py',
      code: HAEMATOLOGY_LOADER_PY,
      description: 'ImageNet standardisation, morphological augmentation, and 80/20 train/val splitting',
    },
    model: {
      name: 'src/model.py',
      code: MODEL_PY,
      description: 'Feature extractor backbone (ResNet18) with custom Dropout(0.5) and Linear head',
    },
    train: {
      name: 'src/train_haematology.py',
      code: TRAIN_HAEMATOLOGY_PY,
      description: 'Core production training loop with ReduceLROnPlateau and checkpoint saving',
    },
  };

  const active = files[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([active.code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = active.name.split('/').pop() || 'script.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Exact PyTorch & TorchVision Implementation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Original PyTorch Source Code
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Inspect, copy, or export the original Python source files powering the HaemHelper data loaders and training pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* File selector tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        {(Object.keys(files) as Array<'loader' | 'model' | 'train'>).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedFile(key)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
              selectedFile === key
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{files[key].name}</span>
          </button>
        ))}
      </div>

      {/* Code Editor Frame */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{active.name} — {active.description}</span>
          <span className="text-[10px] text-slate-500">Python 3.10+ • PyTorch / torchvision</span>
        </div>
        <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[600px] scrollbar-thin">
          <code>{active.code}</code>
        </pre>
      </div>
    </div>
  );
};
