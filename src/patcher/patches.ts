import { NRO } from "./NRO";
import { nhex, PatternMatcher, type Pattern } from "./utils";

export class PatchContext {
  appliedPatches = new Set<string>();
  nro: NRO;
  errorLog: string[] = [];
  _currentPatch: Patch | null = null;

  constructor(nro: NRO) {
    this.nro = nro;
  }

  // track current patch
  _onPatchStart(patch: Patch) {
    this._currentPatch = patch;
  }

  _onPatchEnd() {
    this._currentPatch = null;
  }

  log(message: string) {
    if (this._currentPatch) {
      this.errorLog.push(`${this._currentPatch.id}: ${message}`);
    } else {
      this.errorLog.push(`${message}`);
    }
  }
}

export abstract class Patch {
  abstract readonly id: string;

  abstract check(context: PatchContext): boolean;

  // When this is called, the patch can safely assume that check() was called and returned true.
  abstract apply(context: PatchContext): boolean;
}

export class LegacyAbiPatch extends Patch {
  readonly id = "pattern_legacy_abi";

  private readonly threadTlsGetOrig = PatternMatcher.parse(
    "61 D0 3B D5 " + // mrs x1, TPIDRRO_EL0;
      "20 CC 20 8B " + // add x0, x1, w0,sxtw#3;
      "00 84 40 F9 " + // ldr x0, [x0,#0x108];
      "C0 03 5F D6", // ret
  );

  private readonly threadTlsGetPatch = PatternMatcher.parse(
    "61 D0 3B D5 " + // mrs x1, TPIDRRO_EL0;
      "20 CC 20 8B " + // add x0, x1, w0,sxtw#3;
      "00 C0 40 F9 " + // ldr x0, [x0,#0x180];
      "C0 03 5F D6", // ret
  );

  private readonly threadTlsSetOrig = PatternMatcher.parse(
    "62 D0 3B D5 " + // mrs x2, TPIDRRO_EL0;
      "40 CC 20 8B " + // add x0, x2, w0,sxtw#3;
      "01 84 00 F9 " + // str x1, [x0,#0x108];
      "C0 03 5F D6", // ret
  );

  private readonly threadTlsSetPatch = PatternMatcher.parse(
    "62 D0 3B D5 " + // mrs x2, TPIDRRO_EL0;
      "40 CC 20 8B " + // add x0, x2, w0,sxtw#3;
      "01 C0 00 F9 " + // str x1, [x0,#0x180];
      "C0 03 5F D6", // ret
  );

  // all of this needs somewhat complex disassembly to patch reliably
  // though those stupid patches should work in most cases
  private readonly threadEntryOrigGCC15O2 = PatternMatcher.parse(
    "01 0C 40 F9 " + // ldr	x1, [x0, #24]
      "A1 FA 00 F9 " + // str	x1, [x21, #496]
      "01 00 00 90 " + // adrp	x1, 0
      "A3 F6 00 F9 " + // str	x3, [x21, #488]
      "B5 22 04 91 " + // add	x21, x21, #0x108
      "21 00 40 F9 ", // ldr	x1, [x1]
  );
  private readonly threadEntryPatchGCC15O2 = PatternMatcher.parse(
    "01 0C 40 F9 " + // ldr	x1, [x0, #24]
      "A1 FA 00 F9 " + // str	x1, [x21, #496]
      "01 00 00 90 " + // adrp	x1, 0
      "A3 F6 00 F9 " + // str	x3, [x21, #488]
      "B5 02 06 91 " + // add	x21, x21, #0x180
      "21 00 40 F9 ", // ldr	x1, [x1]
  );
  private readonly threadEntryOrigGCC14O2 = PatternMatcher.parse(
    "75 D0 3B D5 " + // mrs	x21, tpidrro_el0
      "64 8A 41 A9 " + // ldp	x4, x2, [x19, #24]
      "A1 82 07 91 " + // add	x1, x21, #0x1e0
      "A5 E6 01 B9 " + // str	w5, [x21, #484]
      "B5 22 04 91", // add	x21, x21, #0x108
  );
  private readonly threadEntryPatchGCC14O2 = PatternMatcher.parse(
    "75 D0 3B D5 " + // mrs	x21, tpidrro_el0
      "64 8A 41 A9 " + // ldp	x4, x2, [x19, #24]
      "A1 82 07 91 " + // add	x1, x21, #0x1e0
      "A5 E6 01 B9 " + // str	w5, [x21, #484]
      "B5 02 06 91", // add	x21, x21, #0x180
  );
  // this pattern seems consistent back to GCC 9?
  private readonly threadEntryOrigGCC13 = PatternMatcher.parse(
    "75 D0 3B D5 " + // mrs	x21, tpidrro_el0
      "A2 E2 01 B9 " + // str	w2, [x21, #480]
      "A5 E6 01 B9 " + // str	w5, [x21, #484]
      "A3 92 1E A9 " + // stp	x3, x4, [x21, #488]
      "B5 22 04 91 ", // add	x21, x21, #0x108
  );
  private readonly threadEntryPatchGCC13 = PatternMatcher.parse(
    "75 D0 3B D5 " + // mrs	x21, tpidrro_el0
      "A2 E2 01 B9 " + // str	w2, [x21, #480]
      "A5 E6 01 B9 " + // str	w5, [x21, #484]
      "A3 92 1E A9 " + // stp	x3, x4, [x21, #488]
      "B5 02 06 91", // add	x21, x21, #0x180
  );

  // this seems consistent at -O1 level and below
  private readonly threadEntryOrigGCC15O1 = PatternMatcher.parse(
    "60 02 40 F9 " + // ldr	x0, [x19]
      "B5 22 04 91 " + // add	x21, x21, #0x108
      "15 10 00 F9 " + // str	x21, [x0, #32]
      "60 02 40 F9 " + // ldr	x0, [x19]
      "81 22 00 91 " + // add	x1, x20, #0x8
      "01 18 00 F9 " + // str	x1, [x0, #48]
      "61 02 40 F9 " + // ldr	x1, [x19]
      "80 06 40 F9 " + // ldr	x0, [x20, #8]
      "20 14 00 F9 ", // str	x0, [x1, #40]
  );
  private readonly threadEntryPatchGCC15O1 = PatternMatcher.parse(
    "60 02 40 F9 " + // ldr	x0, [x19]
      "B5 02 06 91 " + // add	x21, x21, #0x180
      "15 10 00 F9 " + // str	x21, [x0, #32]
      "60 02 40 F9 " + // ldr	x0, [x19]
      "81 22 00 91 " + // add	x1, x20, #0x8
      "01 18 00 F9 " + // str	x1, [x0, #48]
      "61 02 40 F9 " + // ldr	x1, [x19]
      "80 06 40 F9 " + // ldr	x0, [x20, #8]
      "20 14 00 F9", // str	x0, [x1, #40]
  );
  private readonly threadEntryOrigLibNx1 = PatternMatcher.parse(
    "84 E2 01 B9 " + // str w4, [x20, #0x1e0]
      "64 0E 40 F9 " + // ldr x4, [x19, #0x18]
      "83 F6 00 F9 " + // str x3, [x20, #0x1e8]
      "63 00 40 B9 " + // ldr w3, [x3]
      "42 40 00 D1 " + // sub x2, x2, #0x10
      "84 0A 1F A9 " + // stp x4, x2, [x20, #0x1f0]
      "94 22 04 91 " + // add x20, x20, #0x108
      "83 DE 00 B9", // str w3, [x20, #0xdc]
  );

  private readonly threadEntryPatchLibNx1 = PatternMatcher.parse(
    "84 E2 01 B9 " + // str w4, [x20, #0x1e0]
      "64 0E 40 F9 " + // ldr x4, [x19, #0x18]
      "83 F6 00 F9 " + // str x3, [x20, #0x1e8]
      "63 00 40 B9 " + // ldr w3, [x3]
      "42 40 00 D1 " + // sub x2, x2, #0x10
      "84 0A 1F A9 " + // stp x4, x2, [x20, #0x1f0]
      "94 02 06 91 " + // add x20, x20, #0x180
      "83 DE 00 B9", // str w3, [x20, #0xdc]
  );

  private readonly threadEntryOrigLibNx2 = PatternMatcher.parse(
    "02 02 80 d2 " + // movz x2, #0x10
      "f3 53 01 a9 " + // stp  x19, x20, [sp, #0x10]
      "f3 03 00 aa " + // mov  x19, x0
      "74 d0 3b d5 " + // mrs  x20, tpidrro_el0
      "94 22 04 91 " + // add  x20, x20, #0x108
      "03 00 40 f9 " + // ldr  x3, [x0]
      "f5 13 00 f9 " + // str  x21, [sp, #0x20]
      "81 da 00 b9 " + // str  w1, [x20, #0xd8]
      "01 0c 40 f9 " + // ldr  x1, [x0, #0x18]
      "83 72 00 f9 " + // str  x3, [x20, #0xe0]
      "81 76 00 f9 " + // str  x1, [x20, #0xe8]
      "?? ?? ?? ?? " +
      "?? ?? ?? ?? " +
      "21 00 40 f9 " + // ldr  x1, [x1]
      "3f 40 00 f1 " + // cmp  x1, #0x10
      "21 20 82 9a " + // csel x1, x1, x2, hs
      "02 10 40 f9 " + // ldr  x2, [x0, #0x20]
      "?? ?? ?? ?? " +
      "?? ?? ?? ?? " +
      "41 00 01 cb " + // sub  x1, x2, x1
      "81 7a 00 f9 " + // str  x1, [x20, #0xf0]
      "61 00 40 b9 " + // ldr  w1, [x3]
      "81 de 00 b9 ", // str  w1, [x20, #0xdc]
  );
  private readonly threadEntryPatchLibNx2 = PatternMatcher.parse(
    "02 02 80 d2 " + //movz x2, #0x10
      "f3 53 01 a9 " + // stp  x19, x20, [sp, #0x10]
      "f3 03 00 aa " + // mov  x19, x0
      "74 d0 3b d5 " + // mrs  x20, tpidrro_el0
      "94 02 06 91 " + // add  x20, x20, #0x108+0x78
      "03 00 40 f9 " + // ldr  x3, [x0]
      "f5 13 00 f9 " + // str  x21, [sp, #0x20]
      "81 62 00 b9 " + // str  w1, [x20, #0xd8-0x78]
      "01 0c 40 f9 " + // ldr  x1, [x0, #0x18]
      "83 36 00 f9 " + // str  x3, [x20, #0xe0-0x78]
      "81 3a 00 f9 " + // str  x1, [x20, #0xe8-0x78]
      "?? ?? ?? ?? " +
      "?? ?? ?? ?? " +
      "21 00 40 f9 " + // ldr  x1, [x1]
      "3f 40 00 f1 " + // cmp  x1, #0x10
      "21 20 82 9a " + // csel x1, x1, x2, hs
      "02 10 40 f9 " + // ldr  x2, [x0, #0x20]
      "?? ?? ?? ?? " +
      "?? ?? ?? ?? " +
      "41 00 01 cb " + // sub  x1, x2, x1
      "81 3e 00 f9 " + // str  x1, [x20, #0xf0-0x78]
      "61 00 40 b9 " + // ldr  w1, [x3]
      "81 66 00 b9 ", // str  w1, [x20, #0xdc-0x78]
  );

  private readonly patchesOrig = [
    this.threadTlsGetOrig,
    this.threadTlsSetOrig,
    this.threadEntryOrigGCC15O2,
    this.threadEntryOrigGCC14O2,
    this.threadEntryOrigGCC13,
    this.threadEntryOrigGCC15O1,
    this.threadEntryOrigLibNx1,
    this.threadEntryOrigLibNx2,
  ];

  // prettier-ignore
  private readonly patchesPatch: Array<{o: Pattern, p: Pattern, cmt: string}> = [
    {o: this.threadTlsGetOrig, p: this.threadTlsGetPatch, cmt: "threadTlsGet()"},
    {o: this.threadTlsSetOrig, p: this.threadTlsSetPatch, cmt: "threadTlsSet()"},
    {o: this.threadEntryOrigGCC15O2, p: this.threadEntryPatchGCC15O2, cmt: "threadEntry() GCC 15 -O2"},
    {o: this.threadEntryOrigGCC14O2, p: this.threadEntryPatchGCC14O2, cmt: "threadEntry() GCC 14 -O2"},
    {o: this.threadEntryOrigGCC13, p: this.threadEntryPatchGCC13, cmt: "threadEntry() GCC 13 and below -O2"},
    {o: this.threadEntryOrigGCC15O1, p: this.threadEntryPatchGCC15O1, cmt: "threadEntry() GCC 15 and below -O1"},
    {o: this.threadEntryOrigLibNx1, p: this.threadEntryPatchLibNx1, cmt: "threadEntry() LibNX patch 1"},
    {o: this.threadEntryOrigLibNx2, p: this.threadEntryPatchLibNx2, cmt: "threadEntry() LibNX patch 2"},
  ];

  check(context: PatchContext): boolean {
    return this.patchesOrig.some((pattern) => {
      if (typeof pattern === "string") {
        pattern = PatternMatcher.parse(pattern);
      }
      return PatternMatcher.find(context.nro.text, pattern) !== -1;
    });
  }

  apply(context: PatchContext): boolean {
    let anyApplied = false;
    for (const { o, p, cmt } of this.patchesPatch) {
      const offset = PatternMatcher.find(context.nro.text, o);
      if (offset !== -1) {
        context.log(`Found pattern ${cmt} at offset ${nhex(offset)}`);
        PatternMatcher.applyPattern(context.nro.text, offset, p);
        context.appliedPatches.add(this.id);
        anyApplied = true;
      } else {
        // context.log(`Pattern ${cmt} not found`);
      }
    }

    return anyApplied;
  }
}

// TODO: What approach should we take here to add a LNY2 marker?
// I personally think it's wiser to just leave it as is so that hbmenu keeps the red warning visible - the whole method is a massive hack anyway.
// There's not enough space in the MOD0 header, so the best solution I'm thinking of is to move it to the end of file if possible.

// export class Crt0Lny2Patch extends Patch {
//   readonly id = "pattern_crt0_lny2";

//   check(context: PatchContext): boolean {
//     const { nro } = context;
//     return false;
//   }

//   apply(context: PatchContext): boolean {
//     return false;
//   }
// }

export const PATCHES: Patch[] = [
  new LegacyAbiPatch(),
  // new Crt0Lny2Patch()
];
