// ================================================================
// ✏️  src/screens/EditarPagoScreen.js
// Pantalla modal: permite editar los datos de un pago existente.
// Se navega aquí desde TarjetaPago al tocar "Editar".
// ================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClienteSelector from "../components/ClienteSelector";
import DatePickerField from "../components/DatePickerField";
import { usePagos } from "../hooks/usePagos";
import { CLIENTES, MONEDA } from "../config/constants";
import { colors, spacing, radius, font, shadow } from "../styles/theme";

export default function EditarPagoScreen({ route, navigation }) {
  // El pago original llega como parámetro de navegación
  const { pago } = route.params;

  const { actualizarPago, guardando } = usePagos();

  // Estado local inicializado con los valores actuales del pago
  const [cliente, setCliente] = useState(pago.cliente);
  const [monto, setMonto] = useState(String(pago.monto));
  const [fecha, setFecha] = useState(pago.fecha);

  const handleGuardar = async () => {
    const montoNum = parseFloat(monto);
    if (!monto.trim() || isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a 0.");
      return;
    }

    const resultado = await actualizarPago({
      id: pago.id,
      fecha,
      cliente,
      monto: montoNum,
    });

    if (resultado.ok) {
      Alert.alert("✅ ¡Actualizado!", "El pago fue modificado correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert(
        "❌ Error",
        resultado.message || "No se pudo actualizar. Verifica tu internet.",
      );
    }
  };

  return (
    <SafeAreaView style={estilos.contenedor} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Encabezado ── */}
        <View style={estilos.encabezado}>
          {/* Botón volver */}
          <TouchableOpacity
            style={estilos.botonVolver}
            onPress={() => navigation.goBack()}
          >
            <Text style={estilos.textoVolver}>‹ Volver</Text>
          </TouchableOpacity>

          <Text style={estilos.emoji}>✏️</Text>
          <Text style={estilos.titulo}>Editar Pago</Text>
          <Text style={estilos.subtitulo}>Modifica los datos y guarda</Text>
        </View>

        {/* ── Banner con ID del pago (referencia) ── */}
        <View style={estilos.idBanner}>
          <Text style={estilos.idTexto}>ID: {pago.id}</Text>
        </View>

        {/* ── Cliente ── */}
        <Text style={estilos.etiqueta}>Cliente</Text>
        <ClienteSelector
          clientes={CLIENTES}
          seleccionado={cliente}
          onChange={setCliente}
        />

        {/* ── Monto ── */}
        <Text style={[estilos.etiqueta, { marginTop: spacing.lg }]}>Monto</Text>
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

        {/* ── Fecha ── */}
        <View style={{ marginTop: spacing.lg }}>
          <DatePickerField
            label="Fecha del pago"
            value={fecha}
            onChange={setFecha}
          />
        </View>

        {/* ── Botones ── */}
        <TouchableOpacity
          style={[
            estilos.botonGuardar,
            guardando && estilos.botonDeshabilitado,
          ]}
          onPress={handleGuardar}
          disabled={guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={estilos.textoBoton}>Guardar cambios →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.botonCancelar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Text style={estilos.textoCancelar}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
  },
  encabezado: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  botonVolver: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  textoVolver: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: font.bold,
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  titulo: {
    fontSize: 24,
    fontWeight: font.black,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  idBanner: {
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  idTexto: {
    fontSize: 11,
    color: colors.textLight,
    fontFamily: Platform?.OS === "ios" ? "Courier" : "monospace",
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
  botonGuardar: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
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
  botonCancelar: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  textoCancelar: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: font.bold,
  },
});
