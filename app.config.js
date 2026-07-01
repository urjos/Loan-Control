// app.config.js
// Este archivo REEMPLAZA a app.json.
// La ventaja sobre app.json (que es JSON estático) es que este
// es JavaScript ejecutable: puede leer process.env en el momento
// del build de EAS y pasarlo a la app vía expo-constants.
//
// Flujo:
//   EAS Build → inyecta EXPO_PUBLIC_API_URL desde el Secret
//   → app.config.js lo lee con process.env
//   → lo embebe en extra.apiUrl dentro del bundle
//   → la app lo lee con Constants.expoConfig.extra.apiUrl
//   → 100% confiable, sin depender de que Metro inline la variable.

export default {
  expo: {
    name: "Control Prestamos",
    slug: "ControlPrestamos",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.josjosjos.ControlPrestamos",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["@react-native-community/datetimepicker"],
    extra: {
      // La URL se lee aquí en tiempo de build y queda embebida en el APK.
      // En desarrollo local la toma del .env; en EAS Build la toma del Secret.
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "a5bb2cdb-423f-421b-b813-91635032e9e2",
      },
    },
  },
};
