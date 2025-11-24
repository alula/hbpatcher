import { Card, CardContent } from "../components/ui/Card";
import { GITHUB_URL } from "../constants";
import AboutPageWriteup from "./AboutPageWriteup.mdx";

export function AboutPage() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">Disclaimer</h3>
            <p className="text-switch-text-info text-sm font-bold">
              This tool may or may not work correctly. It is not the responsibility of the author of this tool or the
              author of the homebrew. Users should obtain the latest version of homebrew recompiled against the latest
              libnx if possible over using this tool. This tool is only an assist for unmaintained homebrew to reduce
              the impact of kernel changes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-switch-text-info text-sm ml-2">
              <li>
                Drag and drop your homebrew <span className="font-mono text-switch-text">.nro</span> file into the
                patcher tab.
              </li>
              <li>The tool will analyze the file to see if it uses the old ABI.</li>
              <li>If patching is needed, click the "Patch File" button.</li>
              <li>The patched file will be downloaded automatically.</li>
              <li>Copy the patched file to your Switch SD card.</li>
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">Found Incompatible Homebrew?</h3>
            <p className="text-switch-text-info text-sm leading-relaxed">
              If you encounter unmaintained and closed-source homebrew that doesn't work with this patcher, please{" "}
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
              <strong>Note:</strong> I do not offer support for patching piracy-related homebrew (such as DBI).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-base font-normal">For Developers</h3>
            <div className="text-red-400 text-base font-bold">
              Do not rely on this tool. Please recompile your homebrew with <code>libnx v4.10.0</code> (or newer).
            </div>
            <div className="text-switch-text-info text-sm leading-relaxed">
              <p>
                The updated library resolves the memory conflict and stays backward compatible with older Atmosphère
                versions and firmwares.
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
              This project is licensed under the GNU General Public License v2.0 or later (GPL-2.0-or-later). See the{" "}
              <a href={GITHUB_URL + "/blob/master/LICENSE"} target="_blank" rel="noopener noreferrer">
                LICENSE
              </a>{" "}
              file for details.
            </p>
          </CardContent>
        </Card>
        <section className="switch-prose">
          <AboutPageWriteup />
        </section>
      </div>
    </div>
  );
}
