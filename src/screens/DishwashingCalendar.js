import React, { useMemo } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme, font, spacing, radius, shadow } from "../styles/theme";

// --- Lógica del Calendario ---

const MY_NAME = "Josué";
const BROTHER_NAME = "David";
const CYCLE_START_DATE = new Date("2024-01-01T00:00:00");

const getDayDifference = (date1, date2) => {
  const date1UTC = Date.UTC(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate(),
  );
  const date2UTC = Date.UTC(
    date2.getFullYear(),
    date2.getMonth(),
    date2.getDate(),
  );
  return Math.floor((date1UTC - date2UTC) / (1000 * 60 * 60 * 24));
};

export default function DishwashingCalendar() {
  const themeColors = useAppTheme();

  const colorScheme = useColorScheme();

  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const MY_TURN_COLOR = themeColors.primary;
  const BROTHER_TURN_COLOR = themeColors.success;

  const markedDates = useMemo(() => {
    const markings = {};
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 1, 0, 1);
    const endDate = new Date(today.getFullYear() + 1, 11, 31);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split("T")[0];
      const dayDiff = getDayDifference(d, CYCLE_START_DATE);
      const cyclePosition = ((dayDiff % 4) + 4) % 4;

      const dot =
        cyclePosition === 0 || cyclePosition === 1
          ? { key: "myTurn", color: MY_TURN_COLOR }
          : { key: "brotherTurn", color: BROTHER_TURN_COLOR };

      markings[dateString] = { dots: [dot] };
    }
    return markings;
  }, [MY_TURN_COLOR, BROTHER_TURN_COLOR]);

  const calendarTheme = useMemo(
    () => ({
      // Fondos explícitos — nunca "transparent"
      backgroundColor: themeColors.surface,
      calendarBackground: themeColors.surface,

      // Textos
      dayTextColor: themeColors.text,
      textDisabledColor: themeColors.calendarTextDisabled,
      monthTextColor: themeColors.text,
      textSectionTitleColor: themeColors.textMuted,

      // Hoy y seleccionado
      todayTextColor: themeColors.primary,
      todayBackgroundColor: `${themeColors.primary}33`, // 20% de opacidad
      selectedDayBackgroundColor: themeColors.primary,
      selectedDayTextColor: "#FFFFFF",

      // Navegación
      arrowColor: themeColors.primary,

      // Tipografía
      textDayFontSize: 16,
      textDayFontWeight: font.regular,
      textMonthFontSize: 18,
      textMonthFontWeight: font.black,
      textDayHeaderFontSize: 13,
      textDayHeaderFontWeight: font.bold,

      "stylesheet.day.basic": {
        today: {
          height: 38,
          width: 38,
          borderRadius: 19,
          backgroundColor: `${themeColors.primary}33`, // Círculo con 20% de opacidad
          alignItems: "center",
        },
        todayText: {
          color: themeColors.primary,
          fontWeight: font.black,
        },
      },
    }),
    [themeColors],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.subtitle}>Organización de tareas del hogar</Text>
      </View>

      {/* Calendario */}
      <View style={styles.calendarContainer}>
        <Calendar
          key={colorScheme}
          style={styles.calendar}
          markingType="multi-dot"
          markedDates={markedDates}
          theme={calendarTheme}
        />
      </View>

      {/* Leyenda */}
      <View style={styles.legendContainer}>
        <LegendItem color={MY_TURN_COLOR} label={MY_NAME} styles={styles} />
        <LegendItem
          color={BROTHER_TURN_COLOR}
          label={BROTHER_NAME}
          styles={styles}
        />
      </View>
    </SafeAreaView>
  );
}

// Sub-componente de leyenda extraído para claridad
function LegendItem({ color, label, styles }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
    },
    title: {
      fontSize: 30,
      fontWeight: font.black,
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
      marginTop: 4,
    },
    calendarContainer: {
      marginHorizontal: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      overflow: "hidden",
      height: 340,
      ...shadow.md,
    },
    calendar: {
      borderRadius: radius.lg,
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.lg,
      gap: spacing.lg,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.sm,
    },
    legendText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: font.bold,
    },
  });
