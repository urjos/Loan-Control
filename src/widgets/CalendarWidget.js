"use no memo";

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

import { darkColors, lightColors } from "../styles/theme";
import {
  BROTHER_NAME,
  MY_NAME,
  getAssigneeName,
  isMyTurn,
} from "../utils/turnos";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Semana que empieza en lunes.
const WEEKDAYS = ["LU", "MA", "MI", "JU", "VI", "SÁ", "DO"];

// Construye las semanas del mes con huecos (null) para alinear el día 1.
const buildMonthWeeks = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = lunes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks = [];
  let week = Array(firstWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
};

export function CalendarWidget({ width = 320, height = 220, theme = "light" }) {
  const isDark = theme === "dark";
  const colors = isDark ? darkColors : lightColors;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const weeks = buildMonthWeeks(today);
  const myTurnColor = colors.primary;
  const brotherTurnColor = colors.success;
  const todayAssignee = getAssigneeName(today);
  const todayColor = todayAssignee === MY_NAME ? myTurnColor : brotherTurnColor;

  // Tamaños proporcionales al tamaño real reportado por el launcher.
  const padding = width < 280 ? 8 : 12;
  const titleFont = Math.max(12, Math.round(width / 24));
  const headerFont = Math.max(8, Math.min(10, Math.round(width / 34)));
  const dayFont = Math.max(
    9,
    Math.min(Math.round(width / 27), Math.round(height / 20)),
  );
  const dotSize = dayFont >= 12 ? 4 : 3;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`Calendario de turnos de ${MONTHS[month]} ${year}. Hoy le toca a ${todayAssignee}.`}
      style={{
        width: "match_parent",
        height: "match_parent",
        flexDirection: "column",
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding,
      }}
    >
      {/* Encabezado: mes + turno de hoy */}
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <TextWidget
          text={`${MONTHS[month]} ${year}`}
          maxLines={1}
          style={{
            fontSize: titleFont,
            fontWeight: "700",
            color: colors.text,
          }}
        />

        <FlexWidget
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <FlexWidget
            style={{
              width: dotSize + 1,
              height: dotSize + 1,
              borderRadius: (dotSize + 1) / 2,
              marginRight: 4,
              backgroundColor: todayColor,
            }}
          />
          <TextWidget
            text={`Hoy: ${todayAssignee}`}
            maxLines={1}
            style={{
              fontSize: headerFont,
              fontWeight: "700",
              color: todayColor,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Días de la semana */}
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          marginBottom: 2,
        }}
      >
        {WEEKDAYS.map((label) => (
          <FlexWidget
            key={label}
            style={{ flex: 1, alignItems: "center" }}
          >
            <TextWidget
              text={label}
              style={{
                fontSize: headerFont,
                fontWeight: "700",
                color: colors.textMuted,
              }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>

      {/* Semanas del mes */}
      {weeks.map((week, weekIndex) => (
        <FlexWidget
          key={`week-${weekIndex}`}
          style={{
            flex: 1,
            width: "match_parent",
            flexDirection: "row",
          }}
        >
          {week.map((day, dayIndex) => {
            if (day === null) {
              return (
                <FlexWidget
                  key={`empty-${weekIndex}-${dayIndex}`}
                  style={{ flex: 1 }}
                />
              );
            }

            const cellDate = new Date(year, month, day);
            const dotColor = isMyTurn(cellDate)
              ? myTurnColor
              : brotherTurnColor;
            const isToday = day === todayDate;

            return (
              <FlexWidget
                key={`day-${day}`}
                style={{
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  ...(isToday
                    ? { backgroundColor: colors.primaryLight }
                    : {}),
                }}
              >
                <TextWidget
                  text={String(day)}
                  style={{
                    fontSize: dayFont,
                    fontWeight: isToday ? "800" : "500",
                    color: isToday ? colors.primary : colors.text,
                  }}
                />
                <FlexWidget
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    marginTop: 1,
                    backgroundColor: dotColor,
                  }}
                />
              </FlexWidget>
            );
          })}
        </FlexWidget>
      ))}

      {/* Leyenda */}
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 4,
        }}
      >
        <Legend color={myTurnColor} label={MY_NAME} fontSize={headerFont} textColor={colors.textMuted} />
        <FlexWidget style={{ width: 10 }} />
        <Legend color={brotherTurnColor} label={BROTHER_NAME} fontSize={headerFont} textColor={colors.textMuted} />
      </FlexWidget>
    </FlexWidget>
  );
}

function Legend({ color, label, fontSize, textColor }) {
  return (
    <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
      <FlexWidget
        style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          marginRight: 3,
          backgroundColor: color,
        }}
      />
      <TextWidget
        text={label}
        style={{ fontSize, fontWeight: "700", color: textColor }}
      />
    </FlexWidget>
  );
}

export default CalendarWidget;
