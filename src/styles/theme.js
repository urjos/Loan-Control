// ================================================================
// 🎨  src/styles/theme.js
// Tokens de diseño centralizados: colores, tipografía, espaciado.
// Cambiar aquí afecta toda la app.
// ================================================================

import { useColorScheme } from "react-native";

export const lightColors = {
  primary: "#2563EB", // Azul principal
  primaryLight: "#EFF6FF", // Fondo azul suave
  primaryBorder: "#BFDBFE",
  primaryMuted: "#93C5FD",

  success: "#059669", // Verde (montos)
  successLight: "#ECFDF5",

  danger: "#DC2626", // Rojo (eliminar)
  dangerLight: "#FEF2F2",

  warning: "#D97706", // Naranja (editar)
  warningLight: "#FFFBEB",

  text: "#0F172A", // Texto principal
  textMuted: "#64748B", // Texto secundario
  textLight: "#94A3B8", // Texto muy suave

  surface: "#FFFFFF", // Fondo de tarjetas
  background: "#F8FAFC", // Fondo de pantallas
  border: "#eef2f7", // Bordes
  borderFocus: "#93C5FD", // Borde al enfocar input
  divider: "#F1F5F9",
};

export const darkColors = {
  primary: "#2879fa", // Azul ligeramente más brillante para resaltar
  primaryLight: "#1E3A8A", // Fondo azul muy oscuro
  primaryBorder: "#1E40AF",
  primaryMuted: "#2563EB",

  success: "#10B981",
  successLight: "#064E3B",

  danger: "#EF4444",
  dangerLight: "#7F1D1D",

  warning: "#F59E0B",
  warningLight: "#78350F",

  text: "#F8FAFC", // Texto principal blanco/gris claro
  textMuted: "#94A3B8",
  textLight: "#475569",

  surface: "#2b323d",
  background: "#0e0f0f",
  border: "#2c333d00",
  borderFocus: "#3a81f3",
  divider: "#1f2430",
};

export const colors = lightColors;

export const useAppTheme = () => {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const font = {
  regular: "400",
  medium: "500",
  bold: "700",
  black: "800",
};

// Sombras predefinidas para tarjetas
export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  primary: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
};
