const { withAndroidManifest } = require(
  require.resolve("@expo/config-plugins", {
    paths: [require.resolve("expo/package.json").replace("package.json", "")],
  }),
);

const NOTIFICATION_SERVICE_CLASS =
  "com.lesimoes.androidnotificationlistener.RNAndroidNotificationListener";

module.exports = function withYapeNotificationListener(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application[0];

    // Inicializa el array de servicios si no existe
    if (!application.service) {
      application.service = [];
    }

    // Evita agregar el servicio dos veces
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
