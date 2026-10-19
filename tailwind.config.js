/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        primaryLight: "#EFF6FF",
        primaryBorder: "#BFDBFE",
        primaryMuted: "#93C5FD",

        success: "#059669",
        successLight: "#ECFDF5",

        danger: "#DC2626",
        dangerLight: "#FEF2F2",

        warning: "#D97706",
        warningLight: "#FFFBEB",

        text: "#0F172A",
        textMuted: "#64748B",
        textLight: "#94A3B8",

        calendarTextDisabled: "#A0AEC0",

        surface: "#FFFFFF",
        background: "#F8FAFC",
        border: "#eef2f7",
        borderFocus: "#93C5FD",
        divider: "#F1F5F9",

        dark: {
          primary: "#2879fa",
          primaryLight: "#1E3A8A",
          primaryBorder: "#1E40AF",
          primaryMuted: "#2563EB",

          success: "#10B981",
          successLight: "#064E3B",

          danger: "#EF4444",
          dangerLight: "#7F1D1D",

          warning: "#F59E0B",
          warningLight: "#78350F",

          text: "#F8FAFC",
          textMuted: "#94A3B8",
          textLight: "#475569",

          calendarTextDisabled: "#475569",

          surface: "#1e2229",
          background: "#0e0f0f",
          border: "#2c333d00",
          borderFocus: "#3a81f3",
          divider: "#161922",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        card: "16px",
        full: "9999px",
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        bold: "700",
        black: "800",
      },
    },
  },
  plugins: [],
};
