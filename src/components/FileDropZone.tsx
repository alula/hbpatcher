import { FileDown } from "lucide-react";
import { useRef, useState } from "react";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
}

export function FileDropZone({ onFileSelected }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const nroFile = files.find((file) => file.name.endsWith(".nro"));

    if (nroFile) {
      onFileSelected(nroFile);
    } else if (files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`
        border-2 border-dashed rounded-[2px] p-12 text-center cursor-pointer
        transition-all duration-200 outline-none switch-focus-ring
        ${
          isDragging
            ? "border-text-selected bg-switch-selected-bg shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
            : "border-switch-line-sep bg-switch-selected-bg/50 hover:border-text-selected hover:bg-switch-selected-bg"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".nro"
        onChange={handleFileInput}
        className="hidden"
      />
      <div className="space-y-4 pointer-events-none">
        <div className="flex items-center justify-center mb-4 text-switch-text-selected">
          <FileDown size={48} strokeWidth={1.5} />
        </div>
        <h3 className="text-switch-text text-xl font-normal">
          {isDragging ? "Drop file now" : "Select NRO File"}
        </h3>
        <p className="text-switch-text-info">Drag & drop or click to browse</p>
      </div>
    </div>
  );
}
