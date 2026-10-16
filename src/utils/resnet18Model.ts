import { HAEMATOLOGY_CLASSES } from '../data/bloodCellsData';
import { ModelPrediction, InferenceResult } from '../types';

export interface ResNetLayerInfo {
  name: string;
  type: string;
  inputShape: string;
  outputShape: string;
  params: string;
  description: string;
}

export const RESNET18_LAYERS: ResNetLayerInfo[] = [
  {
    name: 'Input Layer',
    type: 'Tensor [B, 3, 224, 224]',
    inputShape: '(3, 224, 224)',
    outputShape: '(3, 224, 224)',
    params: '0',
    description: '3-channel RGB peripheral blood smear patch, normalized with ImageNet statistics.'
  },
  {
    name: 'conv1 & bn1 & relu',
    type: 'Conv2d (7x7, 64, stride=2, padding=3)',
    inputShape: '(3, 224, 224)',
    outputShape: '(64, 112, 112)',
    params: '9,408',
    description: 'Initial receptive field capturing low-level cell borders, stain gradients, and nuclear boundaries.'
  },
  {
    name: 'maxpool',
    type: 'MaxPool2d (3x3, stride=2, padding=1)',
    inputShape: '(64, 112, 112)',
    outputShape: '(64, 56, 56)',
    params: '0',
    description: 'Spatial downsampling to preserve prominent cytoplasmic and nuclear contours.'
  },
  {
    name: 'layer1 (Residual Block 1)',
    type: '2 x BasicBlock [64 channels]',
    inputShape: '(64, 56, 56)',
    outputShape: '(64, 56, 56)',
    params: '147,456',
    description: 'Extracts primary texture: granularity (lilac vs orange-red granules), chromatin condensation.'
  },
  {
    name: 'layer2 (Residual Block 2)',
    type: '2 x BasicBlock [128 channels, stride=2]',
    inputShape: '(64, 56, 56)',
    outputShape: '(128, 28, 28)',
    params: '524,288',
    description: 'Discovers intermediate structural patterns: nuclear lobulation, nucleoli indentations.'
  },
  {
    name: 'layer3 (Residual Block 3)',
    type: '2 x BasicBlock [256 channels, stride=2]',
    inputShape: '(128, 28, 28)',
    outputShape: '(256, 14, 14)',
    params: '2,097,152',
    description: 'High-level semantic features: Nucleus-to-Cytoplasm ratio, vacuolization, folded monocyte contours.'
  },
  {
    name: 'layer4 (Residual Block 4)',
    type: '2 x BasicBlock [512 channels, stride=2]',
    inputShape: '(256, 14, 14)',
    outputShape: '(512, 7, 7)',
    params: '8,388,608',
    description: 'Comprehensive haematological abstraction combining lineage-specific signatures.'
  },
  {
    name: 'avgpool',
    type: 'AdaptiveAvgPool2d((1, 1))',
    inputShape: '(512, 7, 7)',
    outputShape: '(512, 1, 1)',
    params: '0',
    description: 'Spatial pooling compressing feature maps into a 512-dimensional bottleneck vector.'
  },
  {
    name: 'fc.0 (Custom Dropout)',
    type: 'nn.Dropout(p=0.5)',
    inputShape: '(512)',
    outputShape: '(512)',
    params: '0',
    description: 'Added by HaemHelper: randomly drops 50% of connections to prevent institutional slide overfitting.'
  },
  {
    name: 'fc.1 (Custom Linear Head)',
    type: 'nn.Linear(512, num_classes)',
    inputShape: '(512)',
    outputShape: `(num_classes)`,
    params: '512 x num_classes',
    description: 'Replaced classification layer outputting unnormalized raw logits for each blood cell type.'
  }
];

export function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(z => Math.exp(z - maxLogit));
  const sumExps = exps.reduce((acc, v) => acc + v, 0);
  return exps.map(v => v / sumExps);
}

/**
 * Simulates a forward pass through the modified ResNet18 model
 */
export function runResNet18Inference(
  targetClassId: string,
  device = 'mps',
  temperature = 1.0
): InferenceResult {
  const targetIndex = HAEMATOLOGY_CLASSES.findIndex(c => c.id === targetClassId);
  const activeClass = HAEMATOLOGY_CLASSES[targetIndex] || HAEMATOLOGY_CLASSES[0];

  // Generate a realistic 512-dim feature embedding vector preview (first 16 values)
  const featureVectorPreview: number[] = [];
  for (let i = 0; i < 16; i++) {
    // Feature activations centered around realistic values
    const seed = (targetIndex + 1) * 31 + i * 17;
    const val = Math.sin(seed) * 2.8 + Math.cos(seed * 0.7) * 1.5;
    featureVectorPreview.push(Number(val.toFixed(3)));
  }

  // Generate logits where target class has the highest score with realistic noise
  const rawLogits: number[] = HAEMATOLOGY_CLASSES.map((c, i) => {
    if (c.id === activeClass.id) {
      // Strong positive logit for ground-truth class
      return Number((3.8 + Math.random() * 0.6).toFixed(3));
    } else if (
      (activeClass.id === 'neutrophil' && c.id === 'eosinophil') ||
      (activeClass.id === 'lymphocyte' && c.id === 'monocyte') ||
      (activeClass.id === 'monocyte' && c.id === 'myeloblast')
    ) {
      // Biologically related cell types get secondary logits
      return Number((0.6 + Math.random() * 0.5).toFixed(3));
    } else {
      // Dissimilar cell types get negative or low logits
      return Number((-1.5 - Math.random() * 1.2).toFixed(3));
    }
  });

  // Scale by temperature
  const scaledLogits = rawLogits.map(l => l / temperature);
  const probabilities = softmax(scaledLogits);

  const allPredictions: ModelPrediction[] = HAEMATOLOGY_CLASSES.map((c, idx) => ({
    classId: c.id,
    className: c.name,
    category: c.category,
    logit: rawLogits[idx],
    probability: probabilities[idx],
  })).sort((a, b) => b.probability - a.probability);

  return {
    topPrediction: allPredictions[0],
    allPredictions,
    tensorShape: [1, 3, 224, 224],
    featureVectorPreview,
    rawLogits,
    computationDevice: device.toUpperCase(),
    timestamp: new Date().toLocaleTimeString(),
  };
}
