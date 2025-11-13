import { useCallback, useEffect, useRef, useState } from "react";
import { WasmExecutor } from "../gcsim/executors";
import type { ParsedResult, Sample, SimResults } from "../gcsim/types/sim";

export interface UseWasmExecutorOptions {
  wasmPath: string;
  workerCount?: number;
  pollInterval?: number;
}

export interface UseWasmExecutorReturn {
  executor: WasmExecutor | null;
  isReady: boolean;
  isRunning: boolean;
  run: (
    config: string,
    onUpdate: (result: SimResults, hash: string) => void
  ) => Promise<boolean | void>;
  cancel: () => void;
  validate: (config: string) => Promise<ParsedResult>;
  sample: (config: string, seed: string) => Promise<Sample>;
  setWorkerCount: (count: number) => void;
}

/**
 * Custom hook for managing WasmExecutor lifecycle.
 *
 * Handles:
 * - Single executor instance creation and cleanup
 * - Ready/running state polling
 * - Worker count management
 * - Automatic cleanup on unmount
 *
 * @param options Configuration options
 * @returns Executor instance and control methods
 *
 * @example
 * ```tsx
 * const { isReady, isRunning, run, cancel } = useWasmExecutor({
 *   wasmPath: "/gcsim/main.wasm",
 *   workerCount: 3
 * });
 *
 * useEffect(() => {
 *   if (isReady && config) {
 *     run(config, (result, hash) => {
 *       console.log('Result:', result);
 *     });
 *   }
 * }, [isReady, config]);
 * ```
 */
export function useWasmExecutor(
  options: UseWasmExecutorOptions
): UseWasmExecutorReturn {
  const { wasmPath, workerCount = 1, pollInterval = 250 } = options;

  const [isReady, setReady] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Store executor as ref to maintain single instance across renders
  const executorRef = useRef<WasmExecutor | null>(null);

  // Initialize executor once on mount
  useEffect(() => {
    executorRef.current = new WasmExecutor(wasmPath);
    executorRef.current.setWorkerCount(workerCount);

    // Cleanup workers on unmount
    return () => {
      if (executorRef.current) {
        executorRef.current.cancel();
        executorRef.current = null;
      }
    };
  }, [wasmPath]);

  // Update worker count when it changes
  useEffect(() => {
    if (executorRef.current) {
      executorRef.current.setWorkerCount(workerCount);
    }
  }, [workerCount]);

  // Poll ready and running state
  useEffect(() => {
    const interval = setInterval(() => {
      if (executorRef.current) {
        setReady(executorRef.current.ready());
        setIsRunning(executorRef.current.running());
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  // Run simulation
  const run = useCallback(
    (config: string, onUpdate: (result: SimResults, hash: string) => void) => {
      if (!executorRef.current) {
        return Promise.reject(new Error("Executor not initialized"));
      }

      if (executorRef.current.running()) {
        console.warn("Simulation already running, skipping");
        return Promise.resolve(false);
      }

      return executorRef.current.run(config, onUpdate);
    },
    []
  );

  // Cancel simulation
  const cancel = useCallback(() => {
    if (executorRef.current) {
      executorRef.current.cancel();
    }
  }, []);

  // Validate config
  const validate = useCallback((config: string) => {
    if (!executorRef.current) {
      return Promise.reject(new Error("Executor not initialized"));
    }
    return executorRef.current.validate(config);
  }, []);

  // Generate sample
  const sample = useCallback((config: string, seed: string) => {
    if (!executorRef.current) {
      return Promise.reject(new Error("Executor not initialized"));
    }
    return executorRef.current.sample(config, seed);
  }, []);

  // Update worker count
  const setWorkerCount = useCallback((count: number) => {
    if (executorRef.current) {
      executorRef.current.setWorkerCount(count);
    }
  }, []);

  return {
    executor: executorRef.current,
    isReady,
    isRunning,
    run,
    cancel,
    validate,
    sample,
    setWorkerCount,
  };
}
