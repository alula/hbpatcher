export class BinaryReader {
  private view: DataView;
  private offset: number = 0;

  constructor(buffer: ArrayBuffer | Uint8Array) {
    if (buffer instanceof Uint8Array) {
      this.view = new DataView(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength,
      );
    } else {
      this.view = new DataView(buffer);
    }
  }

  seek(offset: number) {
    this.offset = offset;
  }

  skip(count: number) {
    this.offset += count;
  }

  tell(): number {
    return this.offset;
  }

  readU8(): number {
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readU16(): number {
    const val = this.view.getUint16(this.offset, true); // Little Endian
    this.offset += 2;
    return val;
  }

  readU32(): number {
    const val = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readU64(): bigint {
    const val = this.view.getBigUint64(this.offset, true);
    this.offset += 8;
    return val;
  }

  readBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(
      this.view.buffer,
      this.view.byteOffset + this.offset,
      length,
    );
    this.offset += length;
    // Return a copy to avoid issues if the underlying buffer changes or if we want to modify it
    return new Uint8Array(bytes);
  }

  readString(length: number): string {
    const bytes = this.readBytes(length);
    const decoder = new TextDecoder();
    // Remove null termination if present
    let end = 0;
    while (end < bytes.length && bytes[end] !== 0) end++;
    return decoder.decode(bytes.subarray(0, end));
  }
}
