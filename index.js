import { AppRegistry } from "react-native";
import App from "./App";
import { parsearYRegistrarPagoYape } from "./src/hooks/useYapeListener";

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
