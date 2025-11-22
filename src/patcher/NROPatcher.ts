import { NRO } from "./NRO";
import type { AnalysisResult, PatchResult } from "../types";
import { PatchContext, PATCHES } from "./patches";

/**
 * Analyzes an NRO file to determine its state.
 */
export async function analyzeFile(file: File): Promise<AnalysisResult> {
  let nro: NRO;

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    nro = new NRO(buffer);
  } catch (error) {
    console.error("Error parsing NRO:", error);
    return {
      state: "invalid",
      fileName: file.name,
      messageKey: "status_invalid_nro",
      log: [],
    };
  }
  const context = new PatchContext(nro);

  // Check for any pattern that needs patching
  let needsPatching = false;
  for (const patch of PATCHES) {
    context._onPatchStart(patch);
    if (patch.check(context)) {
      needsPatching = true;
    }
    context._onPatchEnd();
  }

  if (needsPatching) {
    return {
      state: "needs-patching",
      fileName: file.name,
      messageKey: "status_needs_patching",
      log: context.errorLog,
    };
  }

  // If we are here, no patterns matched, meaning it's compatible.
  // Now we check if it was patched by THIS tool (hbpA marker) or if it's just compatible (recompiled).

  if (nro.mod0 && nro.mod0.hbpAOffset) {
    return {
      state: "patched",
      fileName: file.name,
      messageKey: "status_already_patched",
      log: context.errorLog,
    };
  }

  if (!nro.mod0?.lny2Offset) {
    return {
      state: "new-abi",
      fileName: file.name,
      messageKey: "status_no_pattern",
      log: context.errorLog,
    };
  }

  return {
    state: "new-abi",
    fileName: file.name,
    messageKey: "status_new_abi",
    log: context.errorLog,
  };
}

/**
 * Patches an NRO file to use the new ABI.
 */
export async function patchFile(file: File): Promise<PatchResult> {
  let log: string[] = [];
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const nro = new NRO(buffer);
    const context = new PatchContext(nro);
    log = context.errorLog;

    for (const patch of PATCHES) {
      context._onPatchStart(patch);
      if (patch.check(context)) {
        const success = patch.apply(context);
        if (success) {
          context.appliedPatches.add(patch.id);
        }
      }
      context._onPatchEnd();
    }

    if (context.appliedPatches.size === 0) {
      return {
        success: false,
        errorKey: "error_pattern_not_found",
        log,
      };
    }

    // Return the modified buffer directly
    return {
      success: true,
      patchedData: buffer,
      log,
    };
  } catch (error) {
    console.error("Error patching file:", error);
    return {
      success: false,
      errorKey: "error_unknown",
      errorParams: {
        message: error instanceof Error ? error.message : String(error),
      },
      log,
    };
  }
}
