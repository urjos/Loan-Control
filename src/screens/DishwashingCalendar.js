import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme, font, spacing, radius, shadow } from "../styles/theme";

// --- Lógica del Calendario ---

const MY_NAME = "Josué";
const BROTHER_NAME = "David";
const CYCLE_START_DATE = new Date("2024-01-01T00:00:00");

// --- Lista de tareas del hogar ---

// Las tareas con `assignByCalendar: true` se asignan a quien le toque
// según el turno del calendario (Josué o David).
const HOUSEWORK_TASKS = [
  { id: "barrer", label: "Barrer", icon: "cleaning-services" },
  {
    id: "trapear",
    label: "Trapear",
    icon: "water-drop",
    assignByCalendar: true,
  },
  {
    id: "limpiar_cocina",
    label: "Limpiar cocina",
    icon: "countertops",
    assignByCalendar: true,
  },
  { id: "ordenar_ropero", label: "Ordenar ropero", icon: "checkroom" },
  {
    id: "limpiar_repisas",
    label: "Limpiar repisas de muebles",
    icon: "shelves",
  },
];

const TASKS_STORAGE_PREFIX = "tareasHogar";

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

// Devuelve el nombre de la persona a la que le toca el turno hoy,
// usando la misma rotación de 4 días que pinta el calendario.
const getTodayAssignee = () => {
  const today = new Date();
  const dayDiff = getDayDifference(today, CYCLE_START_DATE);
  const cyclePosition = ((dayDiff % 4) + 4) % 4;
  const isMyTurn = cyclePosition === 0 || cyclePosition === 1;
  return isMyTurn ? MY_NAME : BROTHER_NAME;
};

// Fecha local en formato YYYY-MM-DD (para la clave de guardado diario).
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function DishwashingCalendar() {
  const themeColors = useAppTheme();

  const colorScheme = useColorScheme();

  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const MY_TURN_COLOR = themeColors.primary;
  const BROTHER_TURN_COLOR = themeColors.success;

  // Persona responsable del turno de hoy (Barrer/Trapear/Limpiar cocina)
  const assigneeName = useMemo(() => getTodayAssignee(), []);
  const assigneeColor =
    assigneeName === MY_NAME ? MY_TURN_COLOR : BROTHER_TURN_COLOR;

  // --- Estado de la lista de tareas (se reinicia cada día) ---
  const todayKey = `${TASKS_STORAGE_PREFIX}_${toLocalDateString(new Date())}`;
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    let activo = true;
    const cargarTareas = async () => {
      try {
        const guardado = await AsyncStorage.getItem(todayKey);
        if (activo && guardado) setCompletedTasks(JSON.parse(guardado));
      } catch (error) {
        console.log("Error al cargar las tareas:", error);
      }
    };
    cargarTareas();
    return () => {
      activo = false;
    };
  }, [todayKey]);

  const toggleTask = useCallback(
    async (taskId) => {
      setCompletedTasks((prev) => {
        const nuevo = { ...prev, [taskId]: !prev[taskId] };
        AsyncStorage.setItem(todayKey, JSON.stringify(nuevo)).catch((error) =>
          console.log("Error al guardar las tareas:", error),
        );
        return nuevo;
      });
    },
    [todayKey],
  );

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
      const dateString = toLocalDateString(d);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Lista de tareas */}
        <View style={styles.tasksCard}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Lista de tareas</Text>
            <Text style={styles.tasksSubtitle}>
              Trapear y limpiar cocina según el turno de hoy:{" "}
              <Text
                style={[styles.tasksSubtitleStrong, { color: assigneeColor }]}
              >
                {assigneeName}
              </Text>
            </Text>
          </View>

          {HOUSEWORK_TASKS.map((task, index) => {
            const done = !!completedTasks[task.id];
            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskRow,
                  index < HOUSEWORK_TASKS.length - 1 && styles.taskRowDivider,
                ]}
                activeOpacity={0.7}
                onPress={() => toggleTask(task.id)}
              >
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done && (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  )}
                </View>

                <MaterialIcons
                  name={task.icon}
                  size={20}
                  color={done ? themeColors.textLight : themeColors.textMuted}
                  style={styles.taskIcon}
                />

                <Text style={[styles.taskLabel, done && styles.taskLabelDone]}>
                  {task.label}
                </Text>

                {task.assignByCalendar && (
                  <View
                    style={[
                      styles.assigneeBadge,
                      {
                        backgroundColor: `${assigneeColor}1A`,
                        borderColor: assigneeColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.assigneeBadgeText,
                        { color: assigneeColor },
                      ]}
                    >
                      {assigneeName}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    scrollContent: {
      paddingBottom: spacing.xxl,
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
      height: 370,
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
    tasksCard: {
      marginHorizontal: spacing.md,
      marginTop: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      ...shadow.md,
    },
    tasksHeader: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    tasksTitle: {
      fontSize: 18,
      fontWeight: font.black,
      color: colors.text,
    },
    tasksSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 18,
    },
    tasksSubtitleStrong: {
      fontWeight: font.bold,
    },
    taskRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    taskRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    checkboxDone: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    taskIcon: {
      marginRight: spacing.sm,
    },
    taskLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      fontWeight: font.medium,
    },
    taskLabelDone: {
      color: colors.textLight,
      textDecorationLine: "line-through",
    },
    assigneeBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
      borderWidth: 1,
      marginLeft: spacing.sm,
    },
    assigneeBadgeText: {
      fontSize: 12,
      fontWeight: font.bold,
    },
  });
