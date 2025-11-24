import { Card, CardContent } from "../components/ui/Card";
import { MemoryLayout } from "../components/MemoryLayout";

const GITHUB_URL = "https://github.com/alula/hbpatcher";
const DIRTY_HACK_DISCORD_SOURCE =
  "https://discord.com/channels/269333940928512010/414949821003202562/1440485257550889221";
const FW_19_FIX_SOURCE =
  "https://github.com/Atmosphere-NX/Atmosphere/blob/7aa0bed869c7ed642d5503c6c80e3dc337bc56bd/stratosphere/loader/source/ldr_capabilities.cpp#L428";

export function AboutPage() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">Disclaimer</h3>
            <p className="text-switch-text-info text-sm font-bold">
              This tool may or may not work correctly. It is not the
              responsibility of the author of this tool or the author of the
              homebrew. Users should obtain the latest version of homebrew
              recompiled against the latest libnx if possible over using this
              tool. This tool is only an assist for unmaintained homebrew to
              reduce the impact of kernel changes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-switch-text-info text-sm ml-2">
              <li>
                Drag and drop your homebrew{" "}
                <span className="font-mono text-switch-text">.nro</span> file
                into the patcher tab.
              </li>
              <li>
                The tool will analyze the file to see if it uses the old ABI.
              </li>
              <li>If patching is needed, click the "Patch File" button.</li>
              <li>The patched file will be downloaded automatically.</li>
              <li>Copy the patched file to your Switch SD card.</li>
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">
              Found Incompatible Homebrew?
            </h3>
            <p className="text-switch-text-info text-sm leading-relaxed">
              If you encounter unmaintained and closed-source homebrew that
              doesn't work with this patcher, please{" "}
              <a
                href={GITHUB_URL + "/issues"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                open an issue on GitHub
              </a>{" "}
              or{" "}
              <a
                href="https://gbatemp.net/members/alula.601460/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                DM me on GBATemp
              </a>
              .
            </p>
            <p className="text-switch-text-info text-sm leading-relaxed">
              <strong>Note:</strong> I do not offer support for patching
              piracy-related homebrew (such as DBI).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">For Developers</h3>
            <div className="text-red-400 text-base font-bold">
              Do not rely on this tool. Please recompile your homebrew with{" "}
              <code>libnx v4.10.0</code> (or newer).
            </div>
            <div className="text-switch-text-info text-sm leading-relaxed">
              <p>
                The updated library resolves the memory conflict and stays
                backward compatible with older Atmosphère versions and
                firmwares.
              </p>
              <p>
                You can find the source code for this tool on{" "}
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">License</h3>
            <p className="text-switch-text-info text-sm">
              This project is licensed under the GNU General Public License v2.0
              or later (GPL-2.0-or-later). See the{" "}
              <a
                href={GITHUB_URL + "/blob/master/LICENSE"}
                target="_blank"
                rel="noopener noreferrer"
              >
                LICENSE
              </a>{" "}
              file for details.
            </p>
          </CardContent>
        </Card>
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-switch-text">TL;DR</h2>
            <p className="text-switch-text-info text-sm leading-relaxed">
              Atmosphère integrates kernel optimizations from Firmware 21.0.0.
              This improves performance but breaks older homebrew compiled with
              libnx versions before v4.10.0, causing crashes that can occur on
              exit, during thread creation, or at runtime. If your homebrew is
              unmaintained, use this tool to patch the <code>.nro</code> files.
              If the app is still active, ask the developer to update it.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-switch-text">
              How this tool works
            </h3>
            <p className="text-switch-text-info text-sm leading-relaxed">
              This tool scans your <code>.nro</code> files to see if they
              contain old libnx code that writes to the conflicting memory
              region. If it detects a conflict, it patches certain{" "}
              <a
                href="https://github.com/switchbrew/libnx/commit/cad06c006e4e0caf9c63755ac6c2a10a52333e27"
                target="_blank"
                rel="noopener noreferrer"
              >
                libnx functions to move their TLS writes
              </a>{" "}
              from the conflicting offset <code>0x108</code> to the safe offset{" "}
              <code>0x180</code>.
            </p>
            <p className="text-switch-text-info text-sm leading-relaxed">
              Note that the patches applied by this tool do <strong>not</strong>{" "}
              move the <code>ThreadVars</code> structure, which resides at the
              very end of the region. Effectively, this reduces (squeezes) the
              available space for TLS slots. While this works for the vast
              majority of homebrew, applications that use an unusually large
              number of TLS slots might overwrite critical thread data (and
              cause crashes - this is an edge case, patching this is out of
              scope for this tool).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-switch-text">
              Why the breakage happened
            </h3>
            <div className="text-switch-text-info text-sm leading-relaxed space-y-3">
              <p>
                The Thread Local Region is <code>0x200</code> bytes large. The
                first <code>0x180</code> bytes are effectively reserved for the
                kernel, while the last <code>0x80</code> bytes (
                <code>0x180-0x200</code>) are for userland. Official software
                respects this split, placing its TLS data at offset{" "}
                <code>0x180</code>.
              </p>
              <p>
                Previous versions of <code>libnx</code> chose to start user TLS
                slots at <code>0x108</code> (encroaching on the kernel's area)
                to maximize the number of available slots. This was safe until
                Firmware 21.0.0, where Nintendo added{" "}
                <code>cache_maintenance_flag</code> at <code>0x104</code> and{" "}
                <code>thread_cpu_time</code> at <code>0x108</code>.
              </p>
              <p>
                Now, the kernel writes to <code>0x108</code> on every thread
                switch, overwriting the TLS data that old homebrew stored there.
                This corruption causes the crashes.
              </p>
              <MemoryLayout />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-switch-text">
              Why isn't this built into the Homebrew Loader?
            </h3>
            <div className="text-switch-text-info text-sm leading-relaxed space-y-3">
              <p>
                It might seem logical for the Homebrew Loader (<code>hbl</code>)
                to handle this automatically, but that's out of scope for a
                simple program loader. HBL's job is to execute code as-is, not
                to dynamically repair binaries.
              </p>
              <p>
                Trying to patch memory offsets on the fly is invasive and
                fragile; if HBL guesses wrong, it could break otherwise
                functioning homebrew. Furthermore, baking a patcher into the
                loader sets a bad precedent. The maintainers want to encourage
                proper fixes (recompilation) rather than relying on permanent
                "dirty hacks" within the OS itself.{" "}
                <a
                  href={DIRTY_HACK_DISCORD_SOURCE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source: Switchbrew
                </a>
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-switch-text">
              Why Atmosphère didn't add a workaround
            </h3>
            <div className="text-switch-text-info text-sm leading-relaxed space-y-3">
              <p>
                Atmosphère aims to reimplement Nintendo's kernel logic 1:1. When
                Nintendo changes how the kernel works, Atmosphère must follow
                suit to ensure official games run correctly.
              </p>
              <p>
                While the developers have added quiet workarounds in the past
                (like the{" "}
                <a
                  href={FW_19_FIX_SOURCE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FW 19.0.0 debug flags
                </a>
                ), this specific issue was too risky to mask. A workaround here
                would require adding conditional logic to the kernel
                scheduler—the most time-critical part of the system. Adding
                checks for "broken homebrew" during every thread switch would
                add complexity, potentially degrade performance system-wide, and
                could even introduce bugs in official games.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
