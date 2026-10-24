// ================================================================
// 📅  src/components/DatePickerField.js
// Selector de fecha con calendario nativo (Android & iOS).
// Android: abre un diálogo de sistema.
// iOS:     muestra un picker en un modal inferior.
// ================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// Convierte Date → string 'YYYY-MM-DD'
const toISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Formatea 'YYYY-MM-DD' → 'DD/MM/YYYY' para mostrar
const formatear = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export default function DatePickerField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  const scheme = useColorScheme();

  // La fecha actual como objeto Date (para el picker)
  const fechaDate = value ? new Date(value + "T12:00:00") : new Date();

  const handleChange = (event, selectedDate) => {
    // Android cierra el diálogo solo; iOS necesita el modal
    if (Platform.OS === "android") setVisible(false);

    if (event.type === "dismissed") return; // Usuario canceló
    if (selectedDate) onChange(toISO(selectedDate));
  };

  const cerrarIOS = () => setVisible(false);

  return (
    <View className="gap-4">
      {label && (
        <Text className="font-bold text-md text-text dark:text-dark-text">
          {label}
        </Text>
      )}

      {/* ── Botón que muestra la fecha y abre el picker ── */}
      <TouchableOpacity
        className="flex-row items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border px-4 py-4 shadow-sm"
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text className="flex-1 text-base font-bold text-text dark:text-dark-text">
          {formatear(value)}
        </Text>
        <Text className="text-[22px] text-textLight dark:text-dark-textLight font-bold">
          ›
        </Text>
      </TouchableOpacity>

      {/* ── Android: DateTimePicker directo (se muestra como diálogo nativo) ── */}
      {Platform.OS === "android" && visible && (
        <DateTimePicker
          value={fechaDate}
          mode="date"
          display="calendar"
          onChange={handleChange}
          locale="es-PE"
          themeVariant={scheme === "dark" ? "dark" : "light"}
        />
      )}

      {/* ── iOS: Modal con picker inline + botón "Listo" ── */}
      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={visible}
          animationType="slide"
          onRequestClose={cerrarIOS}
        >
          <TouchableOpacity
            className="flex-1 bg-black/30"
            activeOpacity={1}
            onPress={cerrarIOS}
          />
          <SafeAreaView className="rounded-t-lg shadow-md bg-surface dark:bg-dark-surface">
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-border dark:border-dark-border">
              <Text className="text-base font-bold text-text dark:text-dark-text">
                Selecciona una fecha
              </Text>
              <TouchableOpacity
                onPress={cerrarIOS}
                className="px-2 py-1 rounded-sm bg-primaryLight dark:bg-dark-primaryLight"
              >
                <Text className="text-primary dark:text-dark-primary font-bold text-[15px]">
                  Listo
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={fechaDate}
              mode="date"
              display="inline" // Muestra un mini-calendario completo en iOS
              onChange={handleChange}
              locale="es-PE"
              className="self-center"
              accentColor={scheme === "dark" ? "#2879fa" : "#2563EB"}
              themeVariant={scheme === "dark" ? "dark" : "light"}
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}
