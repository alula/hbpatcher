import { BinaryReader } from "./BinaryReader";

export interface NroSection {
  offset: number;
  size: number;
}

export interface NroHeader {
  magic: string;
  version: number;
  size: number;
  flags: number;
  text: NroSection;
  rodata: NroSection;
  data: NroSection;
  bssSize: number;
  moduleId: Uint8Array;
}

export interface Mod0Header {
  magic: string;
  dynamicOffset: number;
  bssStartOffset: number;
  bssEndOffset: number;
  ehFrameHdrStartOffset: number;
  ehFrameHdrEndOffset: number;
  runtimeModuleObjectOffset: number;
  // Homebrew extensions
  lny0Offset?: number; // Offset to LNY0 magic relative to MOD0 start
  lny1Offset?: number; // Offset to LNY1 magic relative to MOD0 start
  lny2Offset?: number; // Offset to LNY2 magic relative to MOD0 start
  lny2Version?: number; // Version of LNY2
  hbpAOffset?: number; // Offset to hbpA magic relative to MOD0 start
}

export class NRO {
  public header: NroHeader;
  public mod0?: Mod0Header;
  public mod0Offset: number = 0;
  private buffer: Uint8Array;

  constructor(buffer: Uint8Array) {
    this.buffer = buffer;
    this.header = this.parseHeader();
    this.parseMod0();
  }

  private parseHeader(): NroHeader {
    const reader = new BinaryReader(this.buffer);

    // Check magic at 0x10
    reader.seek(0x10);
    const magic = reader.readString(4);
    if (magic !== "NRO0") {
      throw new Error("Invalid NRO magic");
    }

    const version = reader.readU32();
    const size = reader.readU32();
    const flags = reader.readU32();

    const text = {
      offset: reader.readU32(),
      size: reader.readU32(),
    };

    const rodata = {
      offset: reader.readU32(),
      size: reader.readU32(),
    };

    const data = {
      offset: reader.readU32(),
      size: reader.readU32(),
    };

    const bssSize = reader.readU32();
    /* const reserved =*/ reader.readU32();

    const moduleId = reader.readBytes(0x20);

    return {
      magic,
      version,
      size,
      flags,
      text,
      rodata,
      data,
      bssSize,
      moduleId,
    };
  }

  private parseMod0() {
    // MOD0 is usually at the start of .text + 4 (after the branch instruction)
    // But we should scan for it in the first few bytes of .text just in case
    const textStart = this.header.text.offset;
    const reader = new BinaryReader(this.buffer);

    // Look for MOD0 magic in the first 0x20 bytes of text section
    // Standard crt0 has it at offset 4 from start of text
    let mod0Found = false;
    let mod0Offset = 0;

    for (let i = 0; i < 0x20; i += 4) {
      reader.seek(textStart + i);
      const magic = reader.readString(4);
      if (magic === "MOD0") {
        mod0Found = true;
        mod0Offset = textStart + i;
        break;
      }
    }

    if (!mod0Found) return;

    this.mod0Offset = mod0Offset;
    reader.seek(mod0Offset + 4); // Skip magic

    const dynamicOffset = reader.readU32();
    const bssStartOffset = reader.readU32();
    const bssEndOffset = reader.readU32();
    const ehFrameHdrStartOffset = reader.readU32();
    const ehFrameHdrEndOffset = reader.readU32();
    const runtimeModuleObjectOffset = reader.readU32();

    const mod0: Mod0Header = {
      magic: "MOD0",
      dynamicOffset,
      bssStartOffset,
      bssEndOffset,
      ehFrameHdrStartOffset,
      ehFrameHdrEndOffset,
      runtimeModuleObjectOffset,
    };

    // Check for LNY0
    const lny0Magic = reader.readString(4);
    if (lny0Magic === "LNY0") {
      mod0.lny0Offset = reader.tell() - 4 - mod0Offset;
      reader.skip(8); // got_start, got_end

      // Check for LNY1
      const lny1Magic = reader.readString(4);
      if (lny1Magic === "LNY1") {
        mod0.lny1Offset = reader.tell() - 4 - mod0Offset;
        reader.skip(8); // relro_start, data_start

        // Check for LNY2
        const lny2Magic = reader.readString(4);
        if (lny2Magic === "LNY2") {
          mod0.lny2Offset = reader.tell() - 4 - mod0Offset;
          mod0.lny2Version = reader.readU32();
          reader.skip(4); // Reserved

          // Check for hbpA (Homebrew Patcher Applied)
          const hbpAMagic = reader.readString(4);
          if (hbpAMagic === "hbpA") {
            mod0.hbpAOffset = reader.tell() - 4 - mod0Offset;
          }
        }
      }
    }

    this.mod0 = mod0;
  }

  get text(): Uint8Array {
    return this.buffer.subarray(
      this.header.text.offset,
      this.header.text.offset + this.header.text.size,
    );
  }

  get rodata(): Uint8Array {
    return this.buffer.subarray(
      this.header.rodata.offset,
      this.header.rodata.offset + this.header.rodata.size,
    );
  }

  get data(): Uint8Array {
    return this.buffer.subarray(
      this.header.data.offset,
      this.header.data.offset + this.header.data.size,
    );
  }

  get fullBuffer(): Uint8Array {
    return this.buffer;
  }
}
