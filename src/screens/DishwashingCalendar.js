import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme, font, spacing, radius, shadow } from "../styles/theme";

// --- Lógica del Calendario ---

// Define los nombres para la leyenda
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

      let dot;
      if (cyclePosition === 0 || cyclePosition === 1) {
        dot = { key: "myTurn", color: MY_TURN_COLOR };
      } else {
        dot = { key: "brotherTurn", color: BROTHER_TURN_COLOR };
      }

      markings[dateString] = { dots: [dot] };
    }
    return markings;
  }, [MY_TURN_COLOR, BROTHER_TURN_COLOR]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendario de Platos</Text>
        <Text style={styles.subtitle}>Organización de tareas del hogar</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          style={styles.calendar}
          markingType={"multi-dot"}
          markedDates={markedDates}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor: themeColors.textMuted,
            selectedDayBackgroundColor: themeColors.primary,
            selectedDayTextColor: "#ffffff",
            todayTextColor: themeColors.primary,
            dayTextColor: themeColors.text,
            textDisabledColor: themeColors.calendarTextDisabled,
            arrowColor: themeColors.primary,
            monthTextColor: themeColors.text,
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "300",
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: MY_TURN_COLOR }]}
          />
          <Text style={styles.legendText}>{MY_NAME}</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: BROTHER_TURN_COLOR }]}
          />
          <Text style={styles.legendText}>{BROTHER_NAME}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
    },
    title: { fontSize: 30, fontWeight: font.black, color: colors.text },
    subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
    calendarContainer: {
      marginHorizontal: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
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
    legendItem: { flexDirection: "row", alignItems: "center" },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.sm,
    },
    legendText: { fontSize: 14, color: colors.text, fontWeight: font.bold },
  });
