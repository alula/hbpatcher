import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "automatic";

const DiagonalSplitPreview = () => {
  return (
    <svg
      width="64"
      height="40"
      viewBox="0 0 64 40"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {/* Upper triangle (light) */}
      <polygon points="0,0 64,0 64,40" fill="#ebebeb" />
      {/* Lower triangle (dark) */}
      <polygon points="0,0 0,40 64,40" fill="#2d2d2d" />
    </svg>
  );
};

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
  previewColor: string | "diagonalSplit";
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
        <div className="w-16 h-10 border border-switch-line-sep overflow-hidden">
          {previewColor === "diagonalSplit" ? (
            <DiagonalSplitPreview />
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: previewColor }}
            />
          )}
        </div>

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

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getEffectiveTheme(theme: Theme): "dark" | "light" {
  if (theme === "automatic") {
    return getSystemTheme();
  }
  return theme;
}

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    // Default to "automatic" if no saved preference
    return saved || "automatic";
  });

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen to system theme changes when "automatic" is selected
  useEffect(() => {
    if (theme !== "automatic") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "automatic") {
        const newSystemTheme = getSystemTheme();
        document.documentElement.setAttribute("data-theme", newSystemTheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  return (
    <div className="space-y-0" role="radiogroup" aria-label="Theme Selection">
      <ThemeOption
        value="automatic"
        label="Automatic"
        previewColor="diagonalSplit"
        theme={theme}
        setTheme={setTheme}
      />
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
