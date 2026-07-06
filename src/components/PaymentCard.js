import { MaterialIcons, Entypo } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import ModalAlert from "./ModalAlert";
import { spacing, radius, font, shadow, useAppTheme } from "../styles/theme";
import { MONEDA } from "../config/constants";

// Formatea 'YYYY-MM-DD' → 'DD/MM/YYYY'
const formatearFecha = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
};
export default function PaymentCard({ pago, onEditar, onEliminar, isPending }) {
  const [eliminando, setEliminando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const themeColors = useAppTheme();
  const styles = useMemo(() => crearEstilos(themeColors), [themeColors]);

  const estadoPago =
    pago.estado || (parseFloat(pago.monto) === 0 ? "Pendiente" : "Confirmado");
  const confirmarEliminacion = () => setModalVisible(true);

  return (
    <View style={styles.tarjeta}>
      {isPending && (
        <View style={styles.bannerOffline}>
          <MaterialIcons name="wifi-off" size={12} color="#92400e" />
          <Text style={styles.bannerOfflineTexto}>
            Pendiente de sincronizar
          </Text>
        </View>
      )}
      <View style={styles.filaSuperior}>
        <View style={styles.avatarContenedor}>
          <Text style={styles.avatarLetra}>
            {pago.cliente?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.nombreCliente}>{pago.cliente}</Text>

          <Text style={styles.fecha}>
            {formatearFecha(pago.fecha)}{" "}
            {pago.registrado_en?.split(" ")[1] || ""} •{" "}
            {pago.metodo || "Efectivo"}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={[
              styles.monto,
              estadoPago === "Pendiente" && { color: themeColors.warning },
            ]}
          >
            {MONEDA} {parseFloat(pago.monto || 0).toFixed(2)}
          </Text>
          {estadoPago === "Pendiente" && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: themeColors.warning,
                marginTop: 2,
              }}
            >
              PENDIENTE
            </Text>
          )}
        </View>
      </View>

      {/* ── Divisor ── */}
      <View style={styles.divisor} />

      {/* ── Acciones: Editar / Eliminar ── */}
      <View style={styles.acciones}>
        <TouchableOpacity
          style={[styles.botonAccion, styles.botonEditar]}
          onPress={() => onEditar(pago)}
          activeOpacity={0.75}
        >
          <Text style={styles.textoEditar}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botonAccion, styles.botonEliminar]}
          onPress={confirmarEliminacion}
          disabled={eliminando}
          activeOpacity={0.75}
        >
          {eliminando ? (
            <ActivityIndicator size="small" color={themeColors.danger} />
          ) : (
            <Text style={styles.textoEliminar}>Eliminar</Text>
          )}
        </TouchableOpacity>
      </View>
      <ModalAlert
        visible={modalVisible}
        icono={
          <MaterialIcons name="warning" size={48} color={themeColors.danger} />
        }
        titulo="¿Eliminar pago?"
        mensaje="Esta acción no se puede deshacer."
        botones={[
          {
            texto: "Cancelar",
            onPress: () => setModalVisible(false),
            estilo: {
              backgroundColor: themeColors.surface,
              borderWidth: 1,
              borderColor: themeColors.border,
            },
            estiloTexto: { color: themeColors.text },
          },
          {
            texto: "Eliminar",
            onPress: async () => {
              setModalVisible(false);
              setEliminando(true);
              await onEliminar(pago.id);
              setEliminando(false);
            },
            estilo: { backgroundColor: themeColors.danger },
            estiloTexto: { color: "#FFF" },
          },
        ]}
      />
    </View>
  );
}

const crearEstilos = (colors) =>
  StyleSheet.create({
    tarjeta: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      marginBottom: spacing.sm,
      overflow: "hidden",
      ...shadow.sm,
    },

    // ── Fila superior ──
    filaSuperior: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    avatarContenedor: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.primaryBorder,
    },
    avatarLetra: {
      fontSize: 18,
      fontWeight: font.black,
      color: colors.primary,
    },
    info: {
      flex: 1,
    },
    nombreCliente: {
      fontSize: 15,
      fontWeight: font.black,
      color: colors.text,
    },
    fecha: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    timestamp: {
      fontSize: 11,
      color: colors.textLight,
      marginTop: 1,
    },
    monto: {
      fontSize: 20,
      fontWeight: font.black,
      color: colors.success,
    },

    // ── Divisor ──
    divisor: {
      height: 1,
      backgroundColor: colors.divider,
      marginHorizontal: spacing.md,
    },

    // ── Acciones ──
    acciones: {
      flexDirection: "row",
    },
    botonAccion: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      alignItems: "center",
      justifyContent: "center",
    },
    botonEditar: {
      borderRightWidth: 1,
      borderRightColor: colors.divider,
    },
    botonEliminar: {},
    textoEditar: {
      fontSize: 13,
      fontWeight: font.bold,
      color: colors.warning,
    },
    textoEliminar: {
      fontSize: 13,
      fontWeight: font.bold,
      color: colors.danger,
    },
    bannerOffline: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FEF3C7",
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: "#FDE68A",
    },
    bannerOfflineTexto: {
      fontSize: 11,
      fontWeight: font.bold,
      color: "#92400e",
    },
  });
