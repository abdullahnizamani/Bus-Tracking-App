import { Platform } from "react-native";

export const BusNaamaColors = {
  primary: "#006B5E",
  primaryDark: "#004D40",
  accent: "#FF9800",
  accentLight: "#FFB74D",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceVariant: "#F5F5F5",
  error: "#D32F2F",
  success: "#388E3C",
  textPrimary: "#212121",
  textSecondary: "#757575",
  textDisabled: "#BDBDBD",
  divider: "#E0E0E0",
};

const tintColorLight = BusNaamaColors.primary;
const tintColorDark = "#00897B";

export const Colors = {
  light: {
    text: BusNaamaColors.textPrimary,
    textPrimary: BusNaamaColors.textPrimary,
    textSecondary: BusNaamaColors.textSecondary,
    buttonText: "#FFFFFF",
    tabIconDefault: BusNaamaColors.textSecondary,
    tabIconSelected: tintColorLight,
    link: BusNaamaColors.primary,
    primary: BusNaamaColors.primary,
    primaryDark: BusNaamaColors.primaryDark,
    accent: BusNaamaColors.accent,
    success: BusNaamaColors.success,
    error: BusNaamaColors.error,
    backgroundRoot: BusNaamaColors.background,
    backgroundDefault: BusNaamaColors.surface,
    backgroundSecondary: BusNaamaColors.surfaceVariant,
    textDisabled: BusNaamaColors.textDisabled,

    backgroundTertiary: "#EEEEEE",
    divider: BusNaamaColors.divider,
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: tintColorDark,
    primary: tintColorDark,
    primaryDark: "#00695C",
    accent: "#FFB74D",
    success: "#4CAF50",
    error: "#EF5350",
    backgroundRoot: "#1F2123",
    backgroundDefault: "#2A2C2E",
    backgroundSecondary: "#353739",
    backgroundTertiary: "#404244",
    divider: "#404244",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRaised: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
