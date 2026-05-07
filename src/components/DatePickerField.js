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
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, spacing, radius, font, shadow } from "../styles/theme";

// Convierte Date → string 'YYYY-MM-DD'
const toISO = (date) => date.toISOString().split("T")[0];

// Formatea 'YYYY-MM-DD' → 'DD/MM/YYYY' para mostrar
const formatear = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export default function DatePickerField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);

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
    <View>
      {label && <Text style={estilos.etiqueta}>{label}</Text>}

      {/* ── Botón que muestra la fecha y abre el picker ── */}
      <TouchableOpacity
        style={estilos.campo}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={estilos.texto}>{formatear(value)}</Text>
        <Text style={estilos.chevron}>›</Text>
      </TouchableOpacity>

      {/* ── Android: DateTimePicker directo (se muestra como diálogo nativo) ── */}
      {Platform.OS === "android" && visible && (
        <DateTimePicker
          value={fechaDate}
          mode="date"
          display="calendar"
          onChange={handleChange}
          locale="es-PE"
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
            style={estilos.overlay}
            activeOpacity={1}
            onPress={cerrarIOS}
          />
          <SafeAreaView style={estilos.modal}>
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>Selecciona una fecha</Text>
              <TouchableOpacity onPress={cerrarIOS} style={estilos.botonListo}>
                <Text style={estilos.textoListo}>Listo</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={fechaDate}
              mode="date"
              display="inline" // Muestra un mini-calendario completo en iOS
              onChange={handleChange}
              locale="es-PE"
              style={estilos.pickerIOS}
              accentColor={colors.primary}
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    fontSize: 14,
    fontWeight: font.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadow.sm,
  },
  icono: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  texto: {
    flex: 1,
    fontSize: 16,
    fontWeight: font.bold,
    color: colors.text,
  },
  chevron: {
    fontSize: 22,
    color: colors.textLight,
    fontWeight: font.bold,
  },

  // ── iOS Modal ──
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadow.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: font.bold,
    color: colors.text,
  },
  botonListo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
  },
  textoListo: {
    color: colors.primary,
    fontWeight: font.bold,
    fontSize: 15,
  },
  pickerIOS: {
    alignSelf: "center",
  },
});
