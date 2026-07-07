// plugins/withYapeNotificationListener.js
//
// Plugin de Expo que inyecta el servicio NotificationListenerService
// en el AndroidManifest.xml durante el build de EAS.
//
// Sin este plugin, Android no le dará acceso a la app para leer
// las notificaciones de otras apps (como Yape).
//
// Se ejecuta automáticamente cuando corres: eas build -p android

const { withAndroidManifest } = require("@expo/config-plugins");

// Clase Java del servicio dentro de react-native-notification-listener.
// Si el build falla con "ClassNotFoundException", corre este comando
// para verificar el nombre exacto:
//   find node_modules/react-native-notification-listener/android -name "*.java" | head -5
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
