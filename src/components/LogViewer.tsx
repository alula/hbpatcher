import { useState } from "react";
import { ChevronDown, ChevronRight, Terminal } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface LogViewerProps {
  logs: string[];
  defaultExpanded?: boolean;
}

export function LogViewer({ logs, defaultExpanded = false }: LogViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-switch-popup hover:bg-switch-hover-bg transition-colors border-b border-switch-line-sep"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-switch-text">
          <Terminal className="w-4 h-4" />
          <span className="font-medium">Patch Log</span>
          <span className="text-xs text-switch-text-info px-2 py-0.5 rounded-full bg-switch-selected-bg">
            {logs.length} entries
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-black/20 max-h-60 overflow-y-auto font-mono text-xs text-switch-text-info space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="break-all">
              <span className="text-switch-text-selected opacity-50 mr-2">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              {log}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
