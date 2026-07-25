export const PROGRESSION_SHARD_COUNT = 16;

/** Stable FNV-1a bucket selection shared by generation and browser loading. */
export const progressionShardIndexForKey = (key: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % PROGRESSION_SHARD_COUNT;
};
