const { withAndroidManifest } = require("@expo/config-plugins");

const NOTIFICATION_SERVICE_CLASS =
  "com.lesimoes.androidnotificationlistener.RNAndroidNotificationListener";

const withYapeNotificationListener = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application[0];

    if (!application.service) application.service = [];

    const yaExiste = application.service.some(
      (s) => s.$["android:name"] === NOTIFICATION_SERVICE_CLASS,
    );

    if (!yaExiste) {
      application.service.push({
        $: {
          "android:name": NOTIFICATION_SERVICE_CLASS,
          "android:label": "@string/app_name",
          "android:permission":
            "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name":
                    "android.service.notification.NotificationListenerService",
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};

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
    plugins: ["@react-native-community/datetimepicker"],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "a5bb2cdb-423f-421b-b813-91635032e9e2",
      },
    },
  };

  return withAllowBackupFix(withYapeNotificationListener(appConfig));
};
