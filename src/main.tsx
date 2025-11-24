import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Set initial theme before React renders to avoid flash
function initializeTheme() {
  const saved = localStorage.getItem("theme");
  let effectiveTheme: "dark" | "light";

  if (saved === "light" || saved === "dark") {
    effectiveTheme = saved;
  } else {
    // Default to automatic (system preference)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    effectiveTheme = prefersDark ? "dark" : "light";
  }

  document.documentElement.setAttribute("data-theme", effectiveTheme);
}

initializeTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
