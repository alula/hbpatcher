import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const ThemeOption = ({
  value,
  label,
  previewColor,
  theme,
  setTheme,
  isLast,
}: {
  value: Theme;
  label: string;
  previewColor: string;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLast?: boolean;
}) => {
  const isSelected = theme === value;

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => setTheme(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setTheme(value);
        }
      }}
      className={`
        group relative flex items-center justify-between py-4 
        cursor-pointer outline-none transition-all duration-200
        border-t border-switch-line-sep ${isLast ? "border-b" : ""}
        switch-focus-ring hover:bg-switch-selected-bg/10
      `}
    >
      <div className="flex items-center gap-6">
        {/* Preview Box */}
        <div
          className="w-16 h-10 border border-switch-line-sep shadow-sm"
          style={{ backgroundColor: previewColor }}
        />

        {/* Label */}
        <span className="text-xl font-normal text-switch-text">{label}</span>
      </div>

      {/* Radio Indicator */}
      <div
        className={`
        w-6 h-6 rounded-full flex items-center justify-center
        ${
          isSelected
            ? "bg-switch-text-selected"
            : "border-2 border-switch-text-info"
        }
      `}
      >
        {isSelected && (
          <div className="w-2.5 h-2.5 bg-switch-bg rounded-full" />
        )}
      </div>
    </div>
  );
};

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="space-y-0" role="radiogroup" aria-label="Theme Selection">
      <ThemeOption
        value="light"
        label="Basic White"
        previewColor="#ebebeb"
        theme={theme}
        setTheme={setTheme}
      />
      <ThemeOption
        value="dark"
        label="Basic Black"
        previewColor="#2d2d2d"
        theme={theme}
        setTheme={setTheme}
        isLast
      />
    </div>
  );
}
