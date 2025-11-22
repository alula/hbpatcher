export type FileState =
  | "none"
  | "invalid"
  | "new-abi"
  | "patched"
  | "needs-patching";

export interface AnalysisResult {
  state: FileState;
  fileName: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  log: string[];
}

export interface PatchResult {
  success: boolean;
  patchedData?: Uint8Array;
  errorKey?: string;
  errorParams?: Record<string, string | number>;
  log: string[];
}
