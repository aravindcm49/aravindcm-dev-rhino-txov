export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function resolveInitialTheme(
  stored: string | null,
  systemPrefersDark: boolean
): Theme {
  if (stored === "dark" || stored === "light") return stored;
  return systemPrefersDark ? "dark" : "light";
}

// Inline IIFE injected into <head> before first paint. Kept as a string so it
// executes synchronously without an import graph. The logic mirrors
// resolveInitialTheme; the duplication is intentional — it is the cost of
// avoiding a flash of unstyled theme on reload. Any change to the resolution
// rule must be made in both places.
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=(s==="dark"||s==="light")?s:(d?"dark":"light");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;
