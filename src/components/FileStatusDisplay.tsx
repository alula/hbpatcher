import type { AnalysisResult } from "../types";
import { Card } from "./ui/Card";
import { formatMessage } from "../utils/localization";

interface FileStatusDisplayProps {
  analysis: AnalysisResult | null;
}

export function FileStatusDisplay({ analysis }: FileStatusDisplayProps) {
  if (!analysis) {
    return null;
  }

  const getStatusColor = () => {
    switch (analysis.state) {
      case "invalid":
        return "text-switch-error";
      case "new-abi":
        return "text-switch-highlight-1";
      case "patched":
        return "text-switch-text-selected";
      case "needs-patching":
        return "text-switch-text";
      default:
        return "text-switch-text-info";
    }
  };

  const getStatusTitle = () => {
    switch (analysis.state) {
      case "invalid":
        return "Invalid File";
      case "new-abi":
        return "No Patching Required";
      case "patched":
        return "Already Patched";
      case "needs-patching":
        return "Ready to Patch";
      default:
        return "Unknown Status";
    }
  };

  return (
    <Card className="mt-6">
      <div className="p-6 flex flex-col gap-2">
        <h3 className={`text-xl font-normal ${getStatusColor()}`}>
          {getStatusTitle()}
        </h3>
        <div className="h-px bg-switch-line-sep w-full my-2"></div>
        <p className="text-switch-text-info text-sm">
          File:{" "}
          <span className="text-switch-text font-mono ml-2">
            {analysis.fileName}
          </span>
        </p>
        <p className="text-switch-text">
          {formatMessage(analysis.messageKey, analysis.messageParams)}
        </p>
      </div>
    </Card>
  );
}
