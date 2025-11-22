export function unhex(hex: string): Uint8Array {
  // Remove all spaces and parse every two hex characters as a byte
  const clean = hex.replace(/\s+/g, "");
  if (clean.length % 2 !== 0)
    throw new Error("Hex string must have even length");
  const arr = [];
  for (let i = 0; i < clean.length; i += 2) {
    arr.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return new Uint8Array(arr);
}

export function nhex(num: number | bigint): string {
  return `0x${num.toString(16).padStart(8, "0")}`;
}

export interface Pattern {
  bytes: Uint8Array;
  mask: Uint8Array;
}

export class PatternMatcher {
  /**
   * Parses a pattern string into a structure for matching.
   * Supports hex bytes (e.g. "AA") and wildcards ("??").
   * Spaces are ignored.
   */
  static parse(pattern: string): Pattern {
    const cleanPattern = pattern.replace(/\s+/g, "");
    if (cleanPattern.length % 2 !== 0) {
      throw new Error("Invalid pattern length");
    }

    const length = cleanPattern.length / 2;
    const bytes = new Uint8Array(length);
    const mask = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      const byteStr = cleanPattern.substr(i * 2, 2);
      if (byteStr === "??") {
        bytes[i] = 0;
        mask[i] = 0;
      } else {
        bytes[i] = parseInt(byteStr, 16);
        mask[i] = 0xff;
      }
    }

    return { bytes, mask };
  }

  /**
   * Finds the first occurrence of the pattern in the data.
   * Returns the offset or -1 if not found.
   */
  static find(data: Uint8Array, pattern: Pattern): number {
    const { bytes, mask } = pattern;

    // Optimization: if no wildcards, use simpler search
    let hasWildcards = false;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] !== 0xff) {
        hasWildcards = true;
        break;
      }
    }

    if (!hasWildcards) {
      return this.findExact(data, bytes);
    }

    return this.findWithWildcards(data, bytes, mask);
  }

  private static findExact(data: Uint8Array, pattern: Uint8Array): number {
    const len = pattern.length;
    const end = data.length - len;

    for (let i = 0; i <= end; i++) {
      let found = true;
      for (let j = 0; j < len; j++) {
        if (data[i + j] !== pattern[j]) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
    return -1;
  }

  private static findWithWildcards(
    data: Uint8Array,
    pattern: Uint8Array,
    mask: Uint8Array,
  ): number {
    const len = pattern.length;
    const end = data.length - len;

    for (let i = 0; i <= end; i++) {
      let found = true;
      for (let j = 0; j < len; j++) {
        if (mask[j] === 0xff && data[i + j] !== pattern[j]) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
    return -1;
  }

  /**
   * Applies a patch pattern to a target buffer, skipping wildcards ('??').
   * Wildcard bytes (mask value 0x00) are not written into the data array.
   *
   * @param data Target Uint8Array to patch (will be mutated).
   * @param offset Offset in data at which to write the pattern.
   * @param pattern Patch bytes (with wildcards matching any value).
   * @param mask Uint8Array mask (0xFF for bytes to write, 0x00 for wildcards/'??').
   */
  static applyPattern(
    data: Uint8Array,
    offset: number,
    pattern: Pattern,
  ): void {
    const { bytes, mask } = pattern;
    const len = Math.min(bytes.length, mask.length, data.length - offset);
    for (let i = 0; i < len; i++) {
      if (mask[i] === 0xff) {
        data[offset + i] = bytes[i];
      }
      // if mask[i] === 0x00, skip (wildcard, preserve existing byte)
    }
  }
}
