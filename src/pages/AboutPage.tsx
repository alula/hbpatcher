import { Card, CardContent } from "../components/ui/Card";

const GITHUB_URL = "https://github.com/alula/hbpatcher";

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
            <h3 className="text-base font-normal">For Developers</h3>
            <div className="text-red-400 text-base font-bold">
              Do not rely on this tool. Please recompile your homebrew with{" "}
              <code>libnx v4.10.0</code> (or newer).
            </div>
            <div className="text-switch-text-info text-base leading-relaxed">
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
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-switch-text">TL;DR</h2>
            <p className="text-switch-text-info text-sm leading-relaxed">
              Atmosphère 1.10.0+ integrates kernel optimizations from Firmware
              21.0.0. This improves performance but breaks older homebrew,
              causing crashes or hangs on exit. If your homebrew is
              unmaintained, use this tool to patch the <code>.nro</code> files.
              If the app is still active, ask the developer to update it.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-switch-text">
              How this tool works
            </h3>
            <p className="text-switch-text-info text-sm leading-relaxed">
              This tool scans your <code>.nro</code> files to see if they rely
              on the old, now-unsafe memory layout. If it detects a conflict, it
              modifies the binary to{" "}
              <a
                href="https://github.com/switchbrew/libnx/commit/cad06c006e4e0caf9c63755ac6c2a10a52333e27"
                target="_blank"
                rel="noopener noreferrer"
              >
                move its Thread Local Storage (TLS)
              </a>{" "}
              from offset <code>0x108</code> to the safe offset{" "}
              <code>0x180</code>. Effectively, it mimics the result of
              recompiling the app with the latest libraries, restoring stability
              without needing the source code.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-switch-text">
              Why isn't this built into the Homebrew Loader?
            </h3>
            <div className="text-switch-text-info text-sm leading-relaxed space-y-3">
              <p>
                It might seem logical for the Homebrew Loader (<code>hbl</code>)
                to handle this automatically, but that's out of scope for a
                simple program loader. HBL’s job is to execute code as-is, not
                to dynamically repair binaries.
              </p>
              <p>
                Trying to patch memory offsets on the fly is invasive and
                fragile; if HBL guesses wrong, it could corrupt the entire
                homebrew environment. Furthermore, baking a patcher into the
                loader sets a bad precedent. The maintainers want to encourage
                proper fixes (recompilation) rather than relying on permanent
                "dirty hacks" within the OS itself.{" "}
                <a
                  href="https://discord.com/channels/269333940928512010/414949821003202562/1440485257550889221"
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
              Why the breakage happened
            </h3>
            <div className="text-switch-text-info text-sm leading-relaxed space-y-3">
              <p>
                This isn't a bug; it's a conflict over real estate. In Firmware
                21.0.0, Nintendo optimized the kernel to write CPU timing data
                to a specific memory address (<code>usertls + 0x108</code>) on
                every thread switch.
              </p>
              <p>
                Previous versions of <code>libnx</code> (the homebrew library)
                assumed this space was unused and stored data there. Official
                software always respected the reservation, so it wasn't
                affected. Now that the kernel—and by extension,
                Atmosphère—actively uses that space, old homebrew gets its
                memory overwritten, leading to immediate crashes.
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
                (like the FW 19.0.0 debug flags), this specific issue was too
                risky to mask. A workaround here would require adding
                conditional logic to the kernel scheduler—the most time-critical
                part of the system. Adding checks for "broken homebrew" during
                every thread switch would add complexity, potentially degrade
                performance system-wide, and could even introduce bugs in
                official games.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
