import "react-native-url-polyfill/auto";
import { AppRegistry } from "react-native";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import App from "./App";
import { widgetTaskHandler } from "./src/widgets/widgetTaskHandler";

AppRegistry.registerComponent("main", () => App);

// Tarea en segundo plano que pinta/actualiza el widget del calendario.
registerWidgetTaskHandler(widgetTaskHandler);
