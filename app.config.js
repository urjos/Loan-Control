const { withAndroidManifest } = require("expo/config-plugins");

const withAllowBackupFix = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application[0];

    if (!manifest.$["xmlns:tools"]) {
      manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    application.$["tools:replace"] = "android:allowBackup";
    application.$["android:allowBackup"] = "false";

    return config;
  });
};

export default ({ config }) => {
  const appConfig = {
    ...config,
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
      versionCode: 5,
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
      [
        "react-native-android-widget",
        {
          widgets: [
            {
              name: "CalendarWidget",
              label: "Calendario de turnos",
              description: "Muestra el turno de limpieza de cada día del mes.",
              minWidth: "250dp",
              minHeight: "180dp",
              targetCellWidth: 4,
              targetCellHeight: 3,
              resizeMode: "horizontal|vertical",
              // Mínimo permitido por Android: 30 minutos.
              updatePeriodMillis: 30 * 60 * 1000,
            },
          ],
        },
      ],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "a5bb2cdb-423f-421b-b813-91635032e9e2",
      },
    },
  };

  return withAllowBackupFix(appConfig);
};
