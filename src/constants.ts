export const SUPPORTED_EXTENSIONS = [".nro", ".ovl"] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

