import { AugmentationSettings } from '../types';

export const DEFAULT_AUGMENTATIONS: AugmentationSettings = {
  resizeWidth: 224,
  resizeHeight: 224,
  horizontalFlip: false,
  verticalFlip: false,
  rotationDegrees: 0,
  brightnessJitter: 0.1,
  contrastJitter: 0.1,
  applyNormalization: true,
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
};

export interface TransformedPixelStats {
  meanR: number;
  meanG: number;
  meanB: number;
  stdR: number;
  stdG: number;
  stdB: number;
  normMin: number;
  normMax: number;
}

/**
 * Normalises a 0-1 float RGB value with ImageNet mean and std
 * (val - mean) / std
 */
export function normalizeImageNet(
  r: number,
  g: number,
  b: number,
  mean = [0.485, 0.456, 0.406],
  std = [0.229, 0.224, 0.225]
): [number, number, number] {
  const normR = (r / 255.0 - mean[0]) / std[0];
  const normG = (g / 255.0 - mean[1]) / std[1];
  const normB = (b / 255.0 - mean[2]) / std[2];
  return [normR, normG, normB];
}

/**
 * Inverse normalisation to display normalized tensor back on screen
 */
export function denormalizeImageNet(
  normR: number,
  normG: number,
  normB: number,
  mean = [0.485, 0.456, 0.406],
  std = [0.229, 0.224, 0.225]
): [number, number, number] {
  const r = Math.min(255, Math.max(0, Math.round((normR * std[0] + mean[0]) * 255)));
  const g = Math.min(255, Math.max(0, Math.round((normG * std[1] + mean[1]) * 255)));
  const b = Math.min(255, Math.max(0, Math.round((normB * std[2] + mean[2]) * 255)));
  return [r, g, b];
}

/**
 * Applies CSS filter string based on ColorJitter values
 */
export function getColorJitterCss(brightnessJitter: number, contrastJitter: number): string {
  // brightness 1.0 is neutral, contrast 1.0 is neutral
  const b = 1 + brightnessJitter;
  const c = 1 + contrastJitter;
  return `brightness(${b}) contrast(${c})`;
}
