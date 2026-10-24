import { AppRegistry } from "react-native";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import App from "./App";
import { parsearYRegistrarPagoYape } from "./src/hooks/useYapeListener";
import { widgetTaskHandler } from "./src/widgets/widgetTaskHandler";

const YapeNotificationTask = async (notification) => {
  try {
    await parsearYRegistrarPagoYape(notification);
  } catch (e) {
    console.error("[HeadlessJS] Error:", e.message);
  }
};

AppRegistry.registerHeadlessTask(
  "RNAndroidNotificationListenerHeadlessJsTaskService",
  () => YapeNotificationTask,
);

AppRegistry.registerComponent("main", () => App);

// Tarea en segundo plano que pinta/actualiza el widget del calendario.
registerWidgetTaskHandler(widgetTaskHandler);
