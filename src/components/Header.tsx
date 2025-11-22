import { Drill } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 flex items-center mx-4 px-6 border-b border-switch-text bg-switch-bg shrink-0 z-20 relative">
      <div className="flex items-center gap-3">
        <Drill size={32} />
        <h1 className="text-xl text-switch-text font-normal tracking-wide">
          libnx ABI Patcher
        </h1>
      </div>
    </header>
  );
}
