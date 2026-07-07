// app.config.js
export default {
  expo: {
    name: "Control Prestamos",
    slug: "ControlPrestamos",
    version: "3.0.0",
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
      versionCode: 3,
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
    plugins: [
      "@react-native-community/datetimepicker",
      "./plugins/withYapeNotificationListener",
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "a5bb2cdb-423f-421b-b813-91635032e9e2",
      },
    },
  },
};
