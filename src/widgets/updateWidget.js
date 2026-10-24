import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import {
  CALENDAR_WIDGET_NAME,
  renderCalendarWidget,
} from "./widgetTaskHandler";

// Fuerza un refresco del widget (por ejemplo al abrir la app o al cambiar
// el tema), porque el launcher solo lo actualiza cada 30 minutos.
export async function refreshCalendarWidget() {
  if (Platform.OS !== "android") return;

  try {
    await requestWidgetUpdate({
      widgetName: CALENDAR_WIDGET_NAME,
      renderWidget: (widgetInfo) => renderCalendarWidget(widgetInfo),
    });
  } catch (error) {
    // No hay widget en la pantalla de inicio o no es Android: no hacemos nada.
    console.log("refreshCalendarWidget:", error?.message);
  }
}
