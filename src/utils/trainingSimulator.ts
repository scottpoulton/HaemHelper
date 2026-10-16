import { EpochRecord, TrainingHyperparameters } from '../types';

export const DEFAULT_HYPERPARAMETERS: TrainingHyperparameters = {
  batchSize: 32,
  epochs: 25, // default interactive run
  learningRate: 0.0001,
  device: 'mps',
  schedulerPatience: 3,
  schedulerFactor: 0.5,
  trainSplitRatio: 0.8,
};

export class TrainingSimulator {
  private params: TrainingHyperparameters;
  private currentEpoch: number = 0;
  private currentLr: number;
  private bestValLoss: number = Infinity;
  private patienceCounter: number = 0;
  private history: EpochRecord[] = [];
  private totalImages: number = 4200; // Simulated haematology dataset size

  constructor(params: Partial<TrainingHyperparameters> = {}) {
    this.params = { ...DEFAULT_HYPERPARAMETERS, ...params };
    this.currentLr = this.params.learningRate;
  }

  public getHyperparameters(): TrainingHyperparameters {
    return this.params;
  }

  public updateHyperparameters(params: Partial<TrainingHyperparameters>) {
    this.params = { ...this.params, ...params };
    this.currentLr = this.params.learningRate;
  }

  public reset() {
    this.currentEpoch = 0;
    this.currentLr = this.params.learningRate;
    this.bestValLoss = Infinity;
    this.patienceCounter = 0;
    this.history = [];
  }

  public getHistory(): EpochRecord[] {
    return this.history;
  }

  public getBestValLoss(): number {
    return this.bestValLoss;
  }

  public getCurrentLr(): number {
    return this.currentLr;
  }

  public stepEpoch(): { record: EpochRecord; logMessages: string[] } {
    this.currentEpoch++;
    const epoch = this.currentEpoch;
    const logMessages: string[] = [];

    const trainBatches = Math.floor((this.totalImages * this.params.trainSplitRatio) / this.params.batchSize);
    const valBatches = Math.floor((this.totalImages * (1 - this.params.trainSplitRatio)) / this.params.batchSize);

    // Realistic loss curves modeled after transfer-learning ResNet18 fine-tuning
    // As epoch increases, loss drops exponentially then plateaus with subtle noise
    const baseProgress = 1 - Math.exp(-epoch / 6.0);
    const jitter = (Math.random() - 0.5) * 0.04;
    
    // Train loss decreases steadily
    const idealTrainLoss = Math.max(0.08, 1.95 * Math.exp(-epoch / 5.2) + 0.12 + jitter);
    const trainLoss = Number(idealTrainLoss.toFixed(4));

    // Val loss decreases then might fluctuate/plateau slightly above train loss
    const overfittingDrift = epoch > 14 ? (epoch - 14) * 0.008 : 0;
    const valNoise = (Math.random() - 0.45) * 0.05;
    const idealValLoss = Math.max(0.14, 2.1 * Math.exp(-epoch / 4.8) + 0.16 + overfittingDrift + valNoise);
    const valLoss = Number(idealValLoss.toFixed(4));

    // Val accuracy starts around ~45% and scales towards ~97%
    const baseAcc = 45 + baseProgress * 52;
    const accJitter = (Math.random() - 0.5) * 1.5;
    const valAccuracy = Number(Math.min(98.8, Math.max(40, baseAcc + accJitter)).toFixed(2));

    // ReduceLROnPlateau logic: mode='min', factor=0.5, patience=3
    let checkpointSaved = false;
    let isBestLoss = false;

    if (valLoss < this.bestValLoss) {
      logMessages.push(`Validation loss improved from ${this.bestValLoss === Infinity ? 'inf' : this.bestValLoss.toFixed(4)} to ${valLoss.toFixed(4)}. Saving weights!`);
      this.bestValLoss = valLoss;
      checkpointSaved = true;
      isBestLoss = true;
      this.patienceCounter = 0;
    } else {
      this.patienceCounter++;
      logMessages.push(`Validation loss did not improve (${valLoss.toFixed(4)} >= ${this.bestValLoss.toFixed(4)}). Weights not saved to prevent overfitting.`);
      
      if (this.patienceCounter >= this.params.schedulerPatience) {
        const oldLr = this.currentLr;
        this.currentLr = Number((this.currentLr * this.params.schedulerFactor).toExponential(5));
        logMessages.push(`ReduceLROnPlateau triggered: Learning rate adjusted from ${oldLr} to ${this.currentLr} (Patience: ${this.params.schedulerPatience})`);
        this.patienceCounter = 0;
      }
    }

    const record: EpochRecord = {
      epoch,
      trainLoss,
      valLoss,
      valAccuracy,
      lr: this.currentLr,
      isBestLoss,
      checkpointSaved,
      batchesCompleted: trainBatches,
      totalBatches: trainBatches,
    };

    this.history.push(record);
    return { record, logMessages };
  }
}
