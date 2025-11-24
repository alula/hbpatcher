import { useState } from "react";
import { FileDropZone } from "../components/FileDropZone";
import { FileStatusDisplay } from "../components/FileStatusDisplay";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LogViewer } from "../components/LogViewer";
import { analyzeFile, patchFile } from "../patcher/NROPatcher";
import type { AnalysisResult, PatchResult } from "../types";
import { formatMessage } from "../utils/localization";
import { Check } from "lucide-react";

interface PatcherPageProps {
  appendSuffix: boolean;
}

export function PatcherPage({ appendSuffix }: PatcherPageProps) {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [patchResult, setPatchResult] = useState<PatchResult | null>(null);
  const [isPatching, setIsPatching] = useState(false);
  const [patchError, setPatchError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const handleFileSelected = async (file: File) => {
    setCurrentFile(file);
    setPatchResult(null);
    setPatchError(null);
    setLog([]);

    try {
      const result = await analyzeFile(file);
      setAnalysis(result);
      setLog(result.log);
    } catch {
      setAnalysis({
        state: "invalid",
        fileName: file.name,
        messageKey: "error_analysis_failed",
        log: [],
      } as AnalysisResult);
      setLog([]);
    }
  };

  const handlePatchClick = async () => {
    if (!currentFile) return;

    setIsPatching(true);
    setPatchError(null);

    try {
      const result = await patchFile(currentFile);
      setPatchResult(result);
      setLog(result.log);

      if (result.success && result.patchedData) {
        // Create Blob from Uint8Array for download
        const blob = new Blob([result.patchedData as unknown as BlobPart], {
          type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        let downloadName = currentFile.name;
        if (appendSuffix) {
          const extensionMatch = downloadName.match(/\.(nro|ovl)$/i);
          if (extensionMatch) {
            const ext = extensionMatch[1].toLowerCase();
            downloadName = downloadName.replace(
              new RegExp(`\\.${ext}$`, "i"),
              `_patched.${ext}`,
            );
          } else {
            downloadName += "_patched";
          }
        }

        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (!result.success) {
        setPatchError(
          formatMessage(result.errorKey || "error_unknown", result.errorParams),
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setPatchError(formatMessage("error_unknown", { message: errorMessage }));
      setPatchResult({
        success: false,
        errorKey: "error_unknown",
        errorParams: { message: errorMessage },
        log: [],
      });
    } finally {
      setIsPatching(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="space-y-6">
        <FileDropZone onFileSelected={handleFileSelected} />

        {analysis && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <FileStatusDisplay analysis={analysis} />
          </div>
        )}

        {patchError && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 text-switch-error">Error: {patchError}</div>
          </Card>
        )}

        {analysis && analysis.state === "needs-patching" && currentFile && (
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
            <Button
              size="lg"
              onClick={handlePatchClick}
              isLoading={isPatching}
              className="min-w-[200px]"
            >
              Patch File
            </Button>
          </div>
        )}

        {patchResult && patchResult.success && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 flex items-center gap-3">
              <Check className="w-6 h-6 text-switch-text-selected" />
              <div>
                <h3 className="text-switch-text-selected font-normal text-lg">
                  Success!
                </h3>
                <p className="text-switch-text">File patched and downloaded.</p>
              </div>
            </div>
          </Card>
        )}

        <LogViewer logs={log} />
      </div>
    </div>
  );
}
