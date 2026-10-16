import * as ort from 'onnxruntime-web';
import { softmax } from './resnet18Model';

const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

let cachedSession: ort.InferenceSession | null = null;

export async function runRealOnnxInference(imageSource: HTMLImageElement | HTMLCanvasElement) {
  if (!cachedSession) {
    cachedSession = await ort.InferenceSession.create('/models/haem_resnet18.onnx', {
      executionProviders: ['wasm'],
    });
  }

  // Resize image to 224x224 and extract RGB pixels
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  ctx.drawImage(imageSource, 0, 0, 224, 224);
  const { data } = ctx.getImageData(0, 0, 224, 224);

  // Convert RGBA [H, W, 4] to normalized Float32 CHW [1, 3, 224, 224]
  const float32Data = new Float32Array(3 * 224 * 224);
  const stride = 224 * 224;

  for (let i = 0; i < stride; i++) {
    const r = data[i * 4] / 255.0;
    const g = data[i * 4 + 1] / 255.0;
    const b = data[i * 4 + 2] / 255.0;

    float32Data[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    float32Data[stride + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    float32Data[2 * stride + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }

  const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, 224, 224]);
  const outputMap = await cachedSession.run({ input: inputTensor });
  const rawLogits = Array.from(outputMap.logits.data as Float32Array);
  const probabilities = softmax(rawLogits);

  return { rawLogits, probabilities };
}