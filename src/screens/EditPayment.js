import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClienteSelector from "../components/ClienteSelector";
import DatePickerField from "../components/DatePickerField";
import { usePagos } from "../context/PaymentsContext";
import { CLIENTES, MONEDA } from "../config/constants";

export default function EditPayment({ route, navigation }) {
  const { pago } = route.params;
  const { actualizarPago, guardando } = usePagos();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [cliente, setCliente] = useState(pago.cliente);
  const [monto, setMonto] = useState(String(pago.monto));
  const [fecha, setFecha] = useState(pago.fecha);
  const [metodo, setMetodo] = useState(pago.metodo || "Efectivo");
  const METODOS = ["Efectivo", "Yape", "Otro"];

  const handleGuardar = async () => {
    const montoNum = monto.trim() === "" ? 0 : parseFloat(monto);
    const estado = montoNum === 0 ? "Pendiente" : "Confirmado";

    if (isNaN(montoNum) || montoNum < 0) {
      return;
    }

    const resultado = await actualizarPago({
      id: pago.id,
      fecha,
      cliente,
      monto: montoNum,
      metodo,
      estado,
    });

    if (resultado.ok) {
      navigation.goBack();
    } else {
      Alert.alert(
        "Error al Guardar",
        resultado.message || "Ocurrió un error inesperado.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Encabezado ── */}
        <View className="pt-6 pb-4 px-6">
          {/* Botón volver */}
          <TouchableOpacity
            className="self-start mb-2 py-1"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-base text-primary dark:text-dark-primary font-bold">
              ‹ Volver
            </Text>
          </TouchableOpacity>

          <Text className="text-3xl font-extrabold text-text dark:text-dark-text tracking-tight py-2">
            Editar Pago
          </Text>
          <Text className="text-[13px] text-textMuted dark:text-dark-textMuted mt-1">
            Modifica los datos y guarda
          </Text>
        </View>

        {/* ── Banner con ID del pago (referencia) ── */}
        <View className="bg-divider dark:bg-dark-divider mx-4 rounded-sm py-1 px-4 mb-2">
          <Text
            className="text-[11px] text-textLight dark:text-dark-textLight"
            style={{ fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" }}
          >
            ID: {pago.id}
          </Text>
        </View>

        {/* ── Cliente ── */}
        <Text className="text-sm font-extrabold text-text dark:text-dark-text mb-2 px-4">
          Cliente
        </Text>
        <ClienteSelector
          clientes={CLIENTES}
          seleccionado={cliente}
          onChange={setCliente}
        />

        {/* ── Monto ── */}
        <Text className="text-sm font-extrabold text-text dark:text-dark-text mb-2 px-4 mt-6">
          Monto
        </Text>
        <View className="flex-row items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border mx-4 px-4 shadow-sm">
          <Text className="text-xl font-extrabold text-primary dark:text-dark-primary mr-2">
            {MONEDA}
          </Text>
          <TextInput
            className="flex-1 text-[28px] font-extrabold text-text dark:text-dark-text py-4"
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
          />
        </View>

        {/* ── Sección: Método de Pago ── */}
        <Text className="text-sm font-extrabold text-text dark:text-dark-text mb-2 px-4 mt-6">
          Método de pago
        </Text>
        <View className="flex-row mx-4 gap-2">
          {METODOS.map((item) => (
            <TouchableOpacity
              key={item}
              className={`flex-1 py-2.5 rounded-md border-[1.5px] items-center ${
                metodo === item
                  ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
                  : "bg-surface dark:bg-dark-surface border-border dark:border-dark-border"
              }`}
              onPress={() => setMetodo(item)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-bold ${
                  metodo === item
                    ? "text-white"
                    : "text-textMuted dark:text-dark-textMuted"
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Fecha ── */}
        <View className="mt-6">
          <DatePickerField
            label="Fecha del pago"
            value={fecha}
            onChange={setFecha}
          />
        </View>

        {/* ── Botones ── */}
        <TouchableOpacity
          className={`rounded-lg py-3.5 mx-4 mt-8 items-center shadow-md ${
            guardando
              ? "bg-primaryMuted dark:bg-dark-primaryMuted"
              : "bg-primary dark:bg-dark-primary"
          }`}
          onPress={handleGuardar}
          disabled={guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white text-[17px] font-extrabold tracking-wide">
              Guardar →
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-lg py-4 mx-4 mt-2 items-center border-[1.5px] border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Text className="text-textMuted dark:text-dark-textMuted text-base font-bold">
            Cancelar
          </Text>
        </TouchableOpacity>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
