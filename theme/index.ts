import { Flavor } from "../config/config";

// Re-export colors and content
export * from "./colors";
export * from "./content";

// Re-export helper functions from their modules (using proper syntax)
export { getTheme, Theme, themeColors } from "./colors";
export { flavorContent, getFlavorContent } from "./content";

// Helper to get the full theme object (colors + content)
export function getFullTheme(flavor: Flavor, mode: "light" | "dark") {
  const theme = getTheme(flavor, mode);
  const content = getFlavorContent(flavor);
  return {
    ...theme,
    content,
  };
}
