import { ThemeSelector } from "../components/ThemeSelector";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Switch } from "../components/ui/Switch";

interface SettingsPageProps {
  appendSuffix: boolean;
  onAppendSuffixChange: (value: boolean) => void;
}

interface SettingsRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsRow({ title, description, children }: SettingsRowProps) {
  return (
    <div className="mb-6">
      <div className="group relative flex items-center justify-between py-4 border-y border-switch-line-sep switch-focus-within hover:bg-switch-selected-bg/10 transition-colors">
        <h3 className="text-xl text-switch-text font-normal">{title}</h3>
        <div className="rounded-[2px] group-focus-within:outline-none">
          {children}
        </div>
      </div>
      {description && (
        <p className="mt-2 text-switch-text-info text-sm">{description}</p>
      )}
    </div>
  );
}

export function SettingsPage({
  appendSuffix,
  onAppendSuffixChange,
}: SettingsPageProps) {
  return (
    <div className="w-full animate-in fade-in duration-300 px-2">
      <div className="space-y-8">
        <div>
          <SectionHeader>Themes</SectionHeader>
          <ThemeSelector />
        </div>

        <SectionHeader>Miscellaneous</SectionHeader>
        <SettingsRow
          title="Output Filename"
          description="Automatically append '_patched' to the filename of the patched NRO."
        >
          <Switch
            checked={appendSuffix}
            onCheckedChange={onAppendSuffixChange}
          />
        </SettingsRow>
      </div>
    </div>
  );
}
