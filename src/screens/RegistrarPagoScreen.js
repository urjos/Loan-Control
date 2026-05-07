// ================================================================
// 📝  src/screens/RegistrarPagoScreen.js
// Pantalla 1: Formulario para registrar un pago nuevo.
// ================================================================

import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ModalAlert from "../components/ModalAlert";
import ClienteSelector from "../components/ClienteSelector";
import DatePickerField from "../components/DatePickerField";
import { usePagos } from "../hooks/usePagos";
import { CLIENTES, MONEDA } from "../config/constants";
import { colors, spacing, radius, font, shadow } from "../styles/theme";

// Fecha de hoy en YYYY-MM-DD
const hoyISO = () => new Date().toISOString().split("T")[0];

export default function RegistrarPagoScreen() {
  const { crearPago, guardando } = usePagos();

  const [cliente, setCliente] = useState(CLIENTES[0]);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ exito: true, mensaje: "" });

  const limpiar = () => {
    setMonto("");
    setFecha(hoyISO());
    setCliente(CLIENTES[0]);
  };

  const handleGuardar = async () => {
    // ── Validación ──
    const montoNum = parseFloat(monto);
    if (!monto.trim() || isNaN(montoNum) || montoNum <= 0) {
      setModalData({
        exito: false,
        mensaje: "Ingresa un monto mayor a 0.",
      });
      setModalVisible(true);
      return;
    }

    const resultado = await crearPago({ fecha, cliente, monto: montoNum });

    if (resultado.ok) {
      setModalData({
        exito: true,
        mensaje: `Pago de ${MONEDA} ${montoNum.toFixed(2)} de ${cliente} registrado.`,
      });
      setModalVisible(true);
      limpiar();
    } else {
      setModalData({
        exito: false,
        mensaje:
          resultado.message || "No se pudo guardar. Verifica tu internet.",
      });
      setModalVisible(true);
    }
  };

  const montoValido = monto.trim().length > 0 && parseFloat(monto) > 0;

  return (
    <SafeAreaView style={estilos.contenedor} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Encabezado ── */}
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>Registrar Pago</Text>
          <Text style={estilos.subtitulo}>Completa los datos del cobro</Text>
        </View>

        {/* ── Sección: Cliente ── */}
        <Text style={estilos.etiqueta}>¿Quién pagó?</Text>
        <ClienteSelector
          clientes={CLIENTES}
          seleccionado={cliente}
          onChange={setCliente}
        />

        {/* ── Sección: Monto ── */}
        <Text style={[estilos.etiqueta, { marginTop: spacing.lg }]}>
          Monto cobrado
        </Text>
        <View style={estilos.inputMontoContenedor}>
          <Text style={estilos.prefijo}>{MONEDA}</Text>
          <TextInput
            style={estilos.inputMonto}
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* ── Sección: Fecha ── */}
        <View style={{ marginTop: spacing.lg }}>
          <DatePickerField
            label="Fecha del pago"
            value={fecha}
            onChange={setFecha}
          />
        </View>

        {/* ── Resumen antes de guardar ── */}
        {montoValido && (
          <View style={estilos.resumen}>
            <Text style={estilos.resumenTitulo}>Resumen del pago</Text>
            <Row label="Cliente:" value={cliente} />
            <Row
              label="Monto:"
              value={`${MONEDA} ${parseFloat(monto).toFixed(2)}`}
              highlight
            />
            <Row label="Fecha:" value={fecha.split("-").reverse().join("/")} />
          </View>
        )}

        {/* ── Botón guardar ── */}
        <TouchableOpacity
          style={[estilos.boton, guardando && estilos.botonDeshabilitado]}
          onPress={handleGuardar}
          disabled={guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={estilos.textoBoton}>Guardar→</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <ModalAlert
        visible={modalVisible}
        icono={
          modalData.exito ? (
            <MaterialIcons
              name="check-circle"
              size={48}
              color={colors.primary}
            />
          ) : (
            <MaterialIcons name="error" size={48} color={colors.danger} />
          )
        }
        titulo={modalData.exito ? "¡Guardado!" : "Error"}
        mensaje={modalData.mensaje}
        botones={[
          {
            texto: "Regresar",
            onPress: () => setModalVisible(false),
            estilo: {
              backgroundColor: modalData.exito ? colors.primary : colors.danger,
            },
            estiloTexto: { color: "#FFF" },
          },
        ]}
      />
    </SafeAreaView>
  );
}

// Sub-componente de fila del resumen
function Row({ label, value, highlight }) {
  return (
    <View style={estilos.resumenFila}>
      <Text style={estilos.resumenLabel}>{label}</Text>
      <Text
        style={[estilos.resumenValor, highlight && { color: colors.success }]}
      >
        {value}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
  },
  encabezado: {
    alignItems: "right",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emoji: {
    fontSize: 44,
    marginBottom: spacing.xs,
  },
  titulo: {
    fontSize: 30,
    fontWeight: font.black,
    color: colors.text,
    letterSpacing: -0.5,
    paddingVertical: spacing.sm,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: font.black,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputMontoContenedor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadow.sm,
  },
  prefijo: {
    fontSize: 20,
    fontWeight: font.black,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  inputMonto: {
    flex: 1,
    fontSize: 28,
    fontWeight: font.black,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  resumen: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  resumenTitulo: {
    fontSize: 13,
    fontWeight: font.black,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  resumenFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  resumenLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  resumenValor: {
    fontSize: 14,
    fontWeight: font.bold,
    color: colors.text,
  },
  boton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    alignItems: "center",
    ...shadow.primary,
  },
  botonDeshabilitado: {
    backgroundColor: colors.primaryMuted,
    ...shadow.sm,
  },
  textoBoton: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: font.black,
    letterSpacing: 0.3,
  },
});
