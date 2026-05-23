import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { spacing, radius, font, shadow, useAppTheme } from "../styles/theme";

export default function ModalAlert({
  visible,
  icono,
  titulo,
  mensaje,
  botones,
}) {
  const themeColors = useAppTheme();
  const estilos = useMemo(() => crearEstilos(themeColors), [themeColors]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={estilos.modalOverlay}>
        <View style={estilos.modalContenido}>
          <Text style={estilos.modalIcono}>{icono}</Text>
          <Text style={estilos.modalTitulo}>{titulo}</Text>
          <Text style={estilos.modalMensaje}>{mensaje}</Text>

          <View style={estilos.filaBotones}>
            {botones.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[estilos.botonModal, btn.estilo]}
                onPress={btn.onPress}
              >
                <Text style={[estilos.textoBotonModal, btn.estiloTexto]}>
                  {btn.texto}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const crearEstilos = (colors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContenido: {
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: radius.lg,
      alignItems: "center",
      width: "80%",
      borderWidth: 1.5,
      borderColor: colors.border,
      ...shadow.md,
    },
    modalIcono: { fontSize: 40, marginBottom: spacing.sm },
    modalTitulo: {
      fontSize: 20,
      fontWeight: font.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    modalMensaje: {
      fontSize: 16,
      color: colors.textLight,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    filaBotones: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: spacing.sm,
    },
    botonModal: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      alignItems: "center",
    },
    textoBotonModal: { fontWeight: font.bold, fontSize: 16 },
  });
