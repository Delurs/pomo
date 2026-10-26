export type ThemeColor =
  | "green"
  | "red"
  | "orange"
  | "yellow"
  | "blue"
  | "indigo"
  | "violet";

export interface ColorThemeDefinition {
  id: ThemeColor;
  label: string;
  dotColor: string;
  // Accent color in light mode and dark mode
  accent: string;
  accentDark: string;
  // Deep/text shade for contrast (like #256959)
  deep: string;
  deepDark: string;
  // App background tint
  bgLight: string;
  bgDark: string;
  // Card/surface background tint
  cardLight: string;
  cardDark: string;
  // Subtle surface tint (e.g. inner cards)
  subtleLight: string;
  subtleDark: string;
  // Active task card highlight
  activeLight: string;
  activeDark: string;
  // Hover tint
  subtleHoverLight: string;
  // Borders and ring
  ring: string;
}

export const THEME_COLORS: Record<ThemeColor, ColorThemeDefinition> = {
  green: {
    id: "green",
    label: "Green",
    dotColor: "#adf1dc",
    accent: "#adf1dc",
    accentDark: "#adf1dc",
    deep: "#256959",
    deepDark: "#adf1dc",
    bgLight: "#f1fcf4",
    bgDark: "#141e19",
    cardLight: "#ffffff",
    cardDark: "#1f2725",
    subtleLight: "#ebf6ef",
    subtleDark: "#161b1a",
    activeLight: "#e5f8ee",
    activeDark: "#162720",
    subtleHoverLight: "#dfeee5",
    ring: "#adf1dc",
  },
  red: {
    id: "red",
    label: "Red",
    dotColor: "#fca5a5",
    accent: "#fca5a5",
    accentDark: "#fca5a5",
    deep: "#991b1b",
    deepDark: "#fca5a5",
    bgLight: "#fdf2f2",
    bgDark: "#1f1414",
    cardLight: "#ffffff",
    cardDark: "#271f1f",
    subtleLight: "#fde8e8",
    subtleDark: "#1c1515",
    activeLight: "#fde2e2",
    activeDark: "#2d1616",
    subtleHoverLight: "#fbd5d5",
    ring: "#fca5a5",
  },
  orange: {
    id: "orange",
    label: "Orange",
    dotColor: "#fdba74",
    accent: "#fdba74",
    accentDark: "#fdba74",
    deep: "#9a3412",
    deepDark: "#fdba74",
    bgLight: "#fff7ed",
    bgDark: "#1f1813",
    cardLight: "#ffffff",
    cardDark: "#27221d",
    subtleLight: "#ffedd5",
    subtleDark: "#1c1713",
    activeLight: "#fed7aa",
    activeDark: "#2e1c12",
    subtleHoverLight: "#fdba7440",
    ring: "#fdba74",
  },
  yellow: {
    id: "yellow",
    label: "Yellow",
    dotColor: "#fde047",
    accent: "#fde047",
    accentDark: "#fde047",
    deep: "#854d0e",
    deepDark: "#fde047",
    bgLight: "#fefce8",
    bgDark: "#1f1e12",
    cardLight: "#ffffff",
    cardDark: "#27261a",
    subtleLight: "#fef9c3",
    subtleDark: "#1b1a10",
    activeLight: "#fef08a",
    activeDark: "#2c2a13",
    subtleHoverLight: "#fde04740",
    ring: "#fde047",
  },
  blue: {
    id: "blue",
    label: "Blue",
    dotColor: "#93c5fd",
    accent: "#93c5fd",
    accentDark: "#93c5fd",
    deep: "#1e40af",
    deepDark: "#93c5fd",
    bgLight: "#eff6ff",
    bgDark: "#121926",
    cardLight: "#ffffff",
    cardDark: "#1b2333",
    subtleLight: "#dbeafe",
    subtleDark: "#131b29",
    activeLight: "#bfdbfe",
    activeDark: "#152238",
    subtleHoverLight: "#bfdbfe",
    ring: "#93c5fd",
  },
  indigo: {
    id: "indigo",
    label: "Indigo",
    dotColor: "#a5b4fc",
    accent: "#a5b4fc",
    accentDark: "#a5b4fc",
    deep: "#4338ca",
    deepDark: "#a5b4fc",
    bgLight: "#eef2ff",
    bgDark: "#131428",
    cardLight: "#ffffff",
    cardDark: "#1c1e36",
    subtleLight: "#e0e7ff",
    subtleDark: "#16172e",
    activeLight: "#c7d2fe",
    activeDark: "#1f2247",
    subtleHoverLight: "#c7d2fe",
    ring: "#a5b4fc",
  },
  violet: {
    id: "violet",
    label: "Violet",
    dotColor: "#c4b5fd",
    accent: "#c4b5fd",
    accentDark: "#c4b5fd",
    deep: "#5b21b6",
    deepDark: "#c4b5fd",
    bgLight: "#f5f3ff",
    bgDark: "#171424",
    cardLight: "#ffffff",
    cardDark: "#221d30",
    subtleLight: "#ede9fe",
    subtleDark: "#161221",
    activeLight: "#ddd6fe",
    activeDark: "#221636",
    subtleHoverLight: "#ddd6fe",
    ring: "#c4b5fd",
  },
};

export const ORDERED_THEME_COLORS: ThemeColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
];
