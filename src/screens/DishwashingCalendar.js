import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme, font } from "../styles/theme";
import {
  MY_NAME,
  BROTHER_NAME,
  getCyclePosition,
  getTodayAssignee,
  toLocalDateString,
} from "../utils/turnos";

LocaleConfig.locales["es"] = {
  monthNames: [
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
  ],
  monthNamesShort: [
    "Ene.",
    "Feb.",
    "Mar.",
    "Abr.",
    "May.",
    "Jun.",
    "Jul.",
    "Ago.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dic.",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

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

export default function DishwashingCalendar() {
  const themeColors = useAppTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      const cyclePosition = getCyclePosition(d);

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
          color: MY_TURN_COLOR,
          fontWeight: font.black,
        },
      },
    }),
    [themeColors],
  );

  return (
    <SafeAreaView
      className="flex-1 px-4 bg-background dark:bg-dark-background"
      edges={["top"]}
    >
      <ScrollView
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View className="py-8">
          <Text className="text-4xl font-extrabold text-text dark:text-dark-text">
            Calendario
          </Text>
          <Text className="text-sm text-textMuted dark:text-dark-textMuted">
            Organización de tareas del hogar
          </Text>
        </View>

        <View className="gap-6">
          {/* Calendario */}
          <View className="gap-2">
            <View className=" rounded-lg bg-surface dark:bg-dark-surface overflow-hidden h-[370px] shadow-md">
              <Calendar
                key={colorScheme}
                markingType="multi-dot"
                markedDates={markedDates}
                theme={calendarTheme}
                firstDay={1}
              />
            </View>

            {/* Leyenda */}
            <View className="flex-row gap-6 justify-center items-center">
              <LegendItem color={MY_TURN_COLOR} label={MY_NAME} />
              <LegendItem color={BROTHER_TURN_COLOR} label={BROTHER_NAME} />
            </View>
          </View>

          {/* Lista de tareas */}
          <View className="gap-2">
            <Text className="text-2xl font-extrabold text-text dark:text-dark-text">
              Lista de tareas
            </Text>
            <View className="px-4 py-2 rounded-lg shadow-md bg-surface dark:bg-dark-surface">
              {HOUSEWORK_TASKS.map((task, index) => {
                const done = !!completedTasks[task.id];
                return (
                  <TouchableOpacity
                    key={task.id}
                    className={`flex-row items-center py-4 ${
                      index < HOUSEWORK_TASKS.length - 1
                        ? "border-b border-divider dark:border-dark-divider"
                        : ""
                    }`}
                    activeOpacity={0.7}
                    onPress={() => toggleTask(task.id)}
                  >
                    <View
                      className={`w-6 h-6 rounded-sm border-2 items-center justify-center mr-4 ${
                        done
                          ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
                          : "border-primaryMuted dark:border-dark-primaryMuted"
                      }`}
                    >
                      {done && (
                        <MaterialIcons name="check" size={16} color="#FFFFFF" />
                      )}
                    </View>

                    <MaterialIcons
                      name={task.icon}
                      size={20}
                      color={
                        done
                          ? isDark
                            ? "#475569"
                            : "#94A3B8"
                          : isDark
                            ? "#94A3B8"
                            : "#64748B"
                      }
                      className="mr-2"
                    />

                    <Text
                      className={`flex-1 text-[15px] font-medium ${
                        done
                          ? "line-through text-textLight dark:text-dark-textLight"
                          : "text-text dark:text-dark-text"
                      }`}
                    >
                      {task.label}
                    </Text>

                    {task.assignByCalendar && (
                      <View
                        className="px-2 py-[3px] rounded-full border ml-2"
                        style={{
                          backgroundColor: `${assigneeColor}1A`,
                          borderColor: assigneeColor,
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: assigneeColor }}
                        >
                          {assigneeName}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ color, label }) {
  return (
    <View className="flex-row items-center">
      <View
        className="mr-2 w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="text-xs font-bold text-textMuted dark:text-dark-textMuted">
        {label}
      </Text>
    </View>
  );
}
