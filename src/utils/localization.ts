export const MESSAGES: Record<string, string> = {
  status_invalid_nro: "This file does not appear to be a valid NRO file.",
  status_needs_patching: "This file uses the old ABI and can be patched.",
  status_new_abi:
    "This file already uses the new ABI and does not need patching.",
  status_no_pattern:
    "This file is a valid NRO but does not contain the expected ABI pattern. It may not need patching.",
  pattern_legacy_abi: "Legacy ABI",
  pattern_crt0_lny2: "Missing LNY2 (CRT0)",
  error_analysis_failed: "Failed to analyze file. Please try again.",
  error_already_patched: "File is already patched.",
  error_pattern_not_found: "Could not find the ABI pattern to patch.",
  error_unknown: "Unknown error occurred: {message}",
};

export function formatMessage(
  key: string,
  params?: Record<string, string | number>,
): string {
  let message = MESSAGES[key] || key;
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      let displayValue = String(paramValue);
      if (typeof paramValue === "string" && MESSAGES[paramValue]) {
        displayValue = MESSAGES[paramValue];
      }
      message = message.replace(`{${paramKey}}`, displayValue);
    });
  }
  return message;
}
