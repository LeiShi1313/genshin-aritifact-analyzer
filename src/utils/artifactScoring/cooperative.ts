export interface CooperativeComputationOptions {
  readonly maxSliceMs?: number;
  readonly shouldCancel?: () => boolean;
  readonly yieldControl?: () => Promise<void>;
}

const monotonicNow = (): number =>
  globalThis.performance?.now?.() ?? Date.now();

const defaultYieldControl = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Keeps expensive exact calculations responsive without coupling the math to a
 * Worker. Call checkpoint inside the smallest meaningful loop; `false` means
 * the caller should abandon the partial result.
 */
export class CooperativeComputation {
  private readonly maxSliceMs: number;
  private readonly shouldCancel?: () => boolean;
  private readonly yieldControl: () => Promise<void>;
  private sliceStart = monotonicNow();
  private checkpointsSinceClockRead = 0;

  constructor(options: CooperativeComputationOptions = {}) {
    const maxSliceMs = options.maxSliceMs ?? 8;
    if (!Number.isFinite(maxSliceMs) || maxSliceMs < 0) {
      throw new RangeError("maxSliceMs must be finite and nonnegative");
    }
    this.maxSliceMs = maxSliceMs;
    this.shouldCancel = options.shouldCancel;
    this.yieldControl = options.yieldControl ?? defaultYieldControl;
  }

  get cancelled(): boolean {
    return this.shouldCancel?.() ?? false;
  }

  isYieldDue(checkEvery: number = 1): boolean {
    if (!Number.isSafeInteger(checkEvery) || checkEvery <= 0) {
      throw new RangeError("checkEvery must be a positive safe integer");
    }
    this.checkpointsSinceClockRead += 1;
    if (this.checkpointsSinceClockRead < checkEvery) return false;
    this.checkpointsSinceClockRead = 0;
    return monotonicNow() - this.sliceStart >= this.maxSliceMs;
  }

  async yield(): Promise<boolean> {
    if (this.cancelled) return false;
    await this.yieldControl();
    this.sliceStart = monotonicNow();
    this.checkpointsSinceClockRead = 0;
    return !this.cancelled;
  }
}

export const useCooperativeComputation = (
  input: CooperativeComputation | CooperativeComputationOptions
): CooperativeComputation =>
  input instanceof CooperativeComputation
    ? input
    : new CooperativeComputation(input);
