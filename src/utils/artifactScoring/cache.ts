export class ByteBudgetLruCache<Value> {
  private readonly values = new Map<string, { value: Value; bytes: number }>();
  private usedBytes = 0;

  constructor(readonly byteBudget: number) {
    if (!Number.isSafeInteger(byteBudget) || byteBudget <= 0) {
      throw new RangeError("LRU byte budget must be a positive safe integer");
    }
  }

  get sizeBytes(): number {
    return this.usedBytes;
  }

  get size(): number {
    return this.values.size;
  }

  get(key: string): Value | undefined {
    const entry = this.values.get(key);
    if (!entry) return undefined;
    this.values.delete(key);
    this.values.set(key, entry);
    return entry.value;
  }

  set(key: string, value: Value, bytes: number): void {
    if (!Number.isSafeInteger(bytes) || bytes < 0) {
      throw new RangeError(
        "LRU entry bytes must be a nonnegative safe integer"
      );
    }
    const previous = this.values.get(key);
    if (previous) {
      this.usedBytes -= previous.bytes;
      this.values.delete(key);
    }
    if (bytes > this.byteBudget) return;
    this.values.set(key, { value, bytes });
    this.usedBytes += bytes;
    while (this.usedBytes > this.byteBudget) {
      const oldest = this.values.entries().next().value as
        | [string, { value: Value; bytes: number }]
        | undefined;
      if (!oldest) break;
      this.values.delete(oldest[0]);
      this.usedBytes -= oldest[1].bytes;
    }
  }

  clear(): void {
    this.values.clear();
    this.usedBytes = 0;
  }
}
