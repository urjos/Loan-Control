// ================================================================
// ✏️  src/screens/EditarPagoScreen.js
// Pantalla modal: permite editar los datos de un pago existente.
// Se navega aquí desde TarjetaPago al tocar "Editar".
// ================================================================

import { MaterialIcons, Feather } from "@expo/vector-icons";
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

import ModalAlert from "../components/ModalAlert";
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
  const [metodo, setMetodo] = useState(pago.metodo || "Efectivo");
  const METODOS = ["Efectivo", "Yape", "Otro"];
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ exito: true, mensaje: "" });

  const handleGuardar = async () => {
    const montoNum = parseFloat(monto);
    if (!monto.trim() || isNaN(montoNum) || montoNum <= 0) {
      setModalData({
        exito: false,
        mensaje: "Ingresa un monto mayor a 0.",
      });
      setModalVisible(true);
      return;
    }

    const resultado = await actualizarPago({
      id: pago.id,
      fecha,
      cliente,
      monto: montoNum,
      metodo,
    });

    if (resultado.ok) {
      setModalData({ exito: true, mensaje: "Pago actualizado correctamente." });
      setModalVisible(true);
    } else {
      setModalData({
        exito: false,
        mensaje: resultado.message || "Error al actualizar.",
      });
      setModalVisible(true);
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

        {/* ── Sección: Método de Pago ── */}
        <Text style={[estilos.etiqueta, { marginTop: spacing.lg }]}>
          Método de pago
        </Text>
        <View style={estilos.filaMetodos}>
          {METODOS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                estilos.chipMetodo,
                metodo === item && estilos.chipMetodoActivo,
              ]}
              onPress={() => setMetodo(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  estilos.chipTextoMetodo,
                  metodo === item && estilos.chipTextoMetodoActivo,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
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
            <Text style={estilos.textoBoton}>Guardar →</Text>
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
      {/* ── Modal Personalizado ── */}
      <ModalAlert
        visible={modalVisible}
        icono={
          modalData.exito ? (
            <Feather name="edit-3" size={48} color={colors.primary} />
          ) : (
            <MaterialIcons name="error" size={48} color={colors.danger} />
          )
        }
        titulo={modalData.exito ? "¡Editado!" : "Error"}
        mensaje={modalData.mensaje}
        botones={[
          {
            texto: "Regresar",
            onPress: () => {
              setModalVisible(false);
              if (modalData.exito) navigation.goBack();
            },
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
  // ── Estilos del Modal ──
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
    ...shadow.md,
  },
  modalIcono: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
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
  botonModal: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  textoBotonModal: {
    color: "#FFF",
    fontWeight: font.bold,
    fontSize: 16,
  },
  // ── Estilos Método Pago ──
  filaMetodos: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chipMetodo: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  chipMetodoActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTextoMetodo: {
    fontSize: 14,
    fontWeight: font.bold,
    color: colors.textMuted,
  },
  chipTextoMetodoActivo: { color: "#FFF" },
});
