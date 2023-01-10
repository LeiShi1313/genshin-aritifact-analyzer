const HEX_STRINGS = "0123456789abcdef";
const MAP_HEX = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
  7: 7, 8: 8, 9: 9, a: 10, b: 11, c: 12, d: 13,
  e: 14, f: 15, A: 10, B: 11, C: 12, D: 13,
  E: 14, F: 15
};

// Fast Uint8Array to hex
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes || [])
    .map((b) => HEX_STRINGS[b >> 4] + HEX_STRINGS[b & 15])
    .join("");
}

// Mimics Buffer.from(x, 'hex') logic
// Stops on first non-hex string and returns
// https://github.com/nodejs/node/blob/v14.18.1/src/string_bytes.cc#L246-L261
export function fromHex(hexString: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor((hexString || "").length / 2));
  let i: number;
  for (i = 0; i < bytes.length; i++) {
    const a = MAP_HEX[hexString[i * 2]];
    const b = MAP_HEX[hexString[i * 2 + 1]];
    if (a === undefined || b === undefined) {
      break;
    }
    bytes[i] = (a << 4) | b;
  }
  return i === bytes.length ? bytes : bytes.slice(0, i);
}