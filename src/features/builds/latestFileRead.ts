export interface LatestFileReadGuard {
  begin(): number;
  invalidate(): void;
  isCurrent(token: number): boolean;
}

export const createLatestFileReadGuard = (): LatestFileReadGuard => {
  let generation = 0;

  return {
    begin: () => {
      generation += 1;
      return generation;
    },
    invalidate: () => {
      generation += 1;
    },
    isCurrent: (token) => token === generation,
  };
};
