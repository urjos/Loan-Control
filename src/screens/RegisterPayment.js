import { MaterialIcons, Fontisto } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Appearance,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ClienteSelector from "../components/ClienteSelector";
import DatePickerField from "../components/DatePickerField";
import { usePagos } from "../context/PaymentsContext";
import { CLIENTES, MONEDA } from "../config/constants";

// Fecha de hoy local en YYYY-MM-DD
const hoyISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function RegisterPayment() {
  const { crearPago, guardando } = usePagos();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [cliente, setCliente] = useState(CLIENTES[0]);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [metodo, setMetodo] = useState("Efectivo");
  const METODOS = ["Efectivo", "Yape", "Otro"];

  const limpiar = () => {
    setMonto("");
    setFecha(hoyISO());
    setCliente(CLIENTES[0]);
    setMetodo("Efectivo");
  };

  const handleGuardar = async () => {
    const montoNum = monto.trim() === "" ? 0 : parseFloat(monto);
    const estado = montoNum === 0 ? "Pendiente" : "Confirmado";

    if (isNaN(montoNum) || montoNum < 0) {
      return;
    }

    await crearPago({
      fecha,
      cliente,
      monto: montoNum,
      metodo,
      estado,
    });

    limpiar();
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={["top"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0e0f0f" : "#F8FAFC"}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Encabezado ── */}
        <View className="flex-row items-center justify-between pt-6 pb-4 px-6">
          <View className="flex-1">
            <Text className="text-3xl font-extrabold text-text dark:text-dark-text tracking-tight py-2">
              Registrar Pago
            </Text>
            <Text className="text-[13px] text-textMuted dark:text-dark-textMuted mt-1">
              Completa los datos del cobro
            </Text>
          </View>
          <TouchableOpacity
            className="p-1 justify-center"
            onPress={async () => {
              const esquemaActual = Appearance.getColorScheme();
              const nuevoEsquema = esquemaActual === "dark" ? "light" : "dark";
              Appearance.setColorScheme(nuevoEsquema);
              try {
                await AsyncStorage.setItem("temaApp", nuevoEsquema);
              } catch (error) {
                console.log("Error guardando el tema:", error);
              }
            }}
          >
            <Fontisto name="night-clear" size={24} color={isDark ? "#F8FAFC" : "#0F172A"} />
          </TouchableOpacity>
        </View>

        {/* ── Sección: Cliente ── */}
        <Text className="text-sm font-extrabold text-text dark:text-dark-text mb-2 px-4">
          ¿Quién pagó?
        </Text>
        <ClienteSelector
          clientes={CLIENTES}
          seleccionado={cliente}
          onChange={setCliente}
        />

        {/* ── Sección: Monto ── */}
        <Text className="text-sm font-extrabold text-text dark:text-dark-text mb-2 px-4 mt-6">
          Monto cobrado
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

        {/* ── Sección: Fecha ── */}
        <View className="mt-6">
          <DatePickerField
            label="Fecha del pago"
            value={fecha}
            onChange={setFecha}
          />
        </View>

        {/* ── Botón guardar ── */}
        <TouchableOpacity
          className={`rounded-lg py-3.5 mx-4 mt-6 items-center shadow-md ${
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
              Guardar→
            </Text>
          )}
        </TouchableOpacity>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
