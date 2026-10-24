import React from "react";

import { CalendarWidget } from "./CalendarWidget";

export const CALENDAR_WIDGET_NAME = "CalendarWidget";

// Devuelve las variantes clara y oscura del widget.
export const renderCalendarWidget = ({ width, height }) => ({
  light: <CalendarWidget width={width} height={height} theme="light" />,
  dark: <CalendarWidget width={width} height={height} theme="dark" />,
});

const WIDGET_RENDER_ACTIONS = ["WIDGET_ADDED", "WIDGET_UPDATE", "WIDGET_RESIZED"];

export async function widgetTaskHandler(props) {
  const { widgetInfo, widgetAction, renderWidget } = props;

  if (widgetInfo.widgetName !== CALENDAR_WIDGET_NAME) return;

  if (WIDGET_RENDER_ACTIONS.includes(widgetAction)) {
    renderWidget(renderCalendarWidget(widgetInfo));
  }

  // "OPEN_APP" y "OPEN_URI" los maneja la librería de forma nativa.
}
