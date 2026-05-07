import { MaterialIcons, Entypo } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { colors, spacing, radius, font, shadow } from "../styles/theme";
import { MONEDA } from "../config/constants";

// Formatea 'YYYY-MM-DD' → 'DD/MM/YYYY'
const formatearFecha = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
};

export default function TarjetaPago({ pago, onEditar, onEliminar }) {
  const [eliminando, setEliminando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const confirmarEliminacion = () => setModalVisible(true);

  return (
    <View style={estilos.tarjeta}>
      {/* ── Fila superior: nombre + monto ── */}
      <View style={estilos.filaSuperior}>
        <View style={estilos.avatarContenedor}>
          <Text style={estilos.avatarLetra}>
            {pago.cliente?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>

        <View style={estilos.info}>
          <Text style={estilos.nombreCliente}>{pago.cliente}</Text>

          <Text style={estilos.fecha}>
            {formatearFecha(pago.fecha)}{" "}
            {pago.registrado_en?.split(" ")[1] || ""} •{" "}
            {pago.metodo || "Efectivo"}
          </Text>
        </View>

        <Text style={estilos.monto}>
          {MONEDA} {parseFloat(pago.monto || 0).toFixed(2)}
        </Text>
      </View>

      {/* ── Divisor ── */}
      <View style={estilos.divisor} />

      {/* ── Acciones: Editar / Eliminar ── */}
      <View style={estilos.acciones}>
        <TouchableOpacity
          style={[estilos.botonAccion, estilos.botonEditar]}
          onPress={() => onEditar(pago)}
          activeOpacity={0.75}
        >
          <Text style={estilos.textoEditar}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[estilos.botonAccion, estilos.botonEliminar]}
          onPress={confirmarEliminacion}
          disabled={eliminando}
          activeOpacity={0.75}
        >
          {eliminando ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Text style={estilos.textoEliminar}>Eliminar</Text>
          )}
        </TouchableOpacity>
      </View>
      <ModalAlert
        visible={modalVisible}
        icono={<MaterialIcons name="warning" size={48} color={colors.danger} />}
        titulo="¿Eliminar pago?"
        mensaje="Esta acción no se puede deshacer."
        botones={[
          {
            texto: "Cancelar",
            onPress: () => setModalVisible(false),
            estilo: {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            },
            estiloTexto: { color: colors.text },
          },
          {
            texto: "Eliminar",
            onPress: async () => {
              setModalVisible(false);
              setEliminando(true);
              await onEliminar(pago.id);
              setEliminando(false);
            },
            estilo: { backgroundColor: colors.danger },
            estiloTexto: { color: "#FFF" },
          },
        ]}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
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
});
