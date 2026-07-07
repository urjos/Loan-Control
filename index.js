import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";

import App from "./App";
AppRegistry.registerHeadlessTask(
  "RNAndroidNotificationListenerHeadlessJsTaskService",
  () => YapeNotificationTask,
);

registerRootComponent(App);
