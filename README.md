# hbpatcher

A tool for patching Nintendo Switch homebrew (`.nro` files) to use the new ABI, resolving compatibility issues with Atmosphère 1.10.0+ and Firmware 21.0.0+.

## Disclaimer

**This tool may or may not work correctly.** It is not the responsibility of the author of this tool or the author of the homebrew. Users should obtain the latest version of homebrew recompiled against the latest libnx if possible over using this tool. This tool is only an assist for unmaintained homebrew to reduce the impact of kernel changes.

## Instructions

1. Drag and drop your homebrew `.nro` file into the patcher interface.
2. The tool will analyze the file to see if it uses the old ABI.
3. If patching is needed, click the "Patch File" button.
4. The patched file will be downloaded automatically.
5. Copy the patched file to your Switch SD card.

## For Developers

**Do not rely on this tool.** Please recompile your homebrew with `libnx v4.10.0` (or newer).

The updated library resolves the memory conflict and stays backward compatible with older Atmosphère versions and firmwares.
