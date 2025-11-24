export const SUPPORTED_EXTENSIONS = [".nro", ".ovl"] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export const GITHUB_URL = "https://github.com/alula/hbpatcher";
export const DIRTY_HACK_DISCORD_SOURCE =
  "https://discord.com/channels/269333940928512010/414949821003202562/1440485257550889221";
export const FW_19_FIX_SOURCE =
  "https://github.com/Atmosphere-NX/Atmosphere/blob/7aa0bed869c7ed642d5503c6c80e3dc337bc56bd/stratosphere/loader/source/ldr_capabilities.cpp#L428";

