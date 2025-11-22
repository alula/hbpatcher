import { Button } from "./ui/Button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: "patcher", label: "Patcher" },
    { id: "about", label: "About" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <aside className="bg-switch-sidebar sidebar-shadow w-full md:w-80 flex flex-col border-r border-transparent py-12 pl-12 shrink-0">
      <nav className="flex-1 pr-5">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <Button
                variant="ghost"
                className={`
                  w-full justify-start text-left text-xl pl-4 py-3 my-0
                  rounded-none transition-none switch-focus-ring relative
                  ${
                    activeTab === tab.id
                      ? "text-switch-text-selected bg-switch-sidebar-focus"
                      : "text-switch-text hover:bg-switch-sidebar-focus/50"
                  }
                `}
                onClick={() => onTabChange(tab.id)}
              >
                {activeTab === tab.id && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-10 bg-switch-text-selected" />
                )}
                <span className="font-normal">{tab.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
