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

import ClientSelector from "../components/ClientSelector";
import DatePickerField from "../components/DatePickerField";
import { usePayments } from "../context/PaymentsContext";
import { CLIENTS, CURRENCY } from "../config/constants";

// Fecha de hoy local en YYYY-MM-DD
const hoyISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function RegisterPayment() {
  const { createPayment, isSaving } = usePayments();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [client, setClient] = useState(CLIENTS[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(hoyISO());
  const [method, setMethod] = useState("Efectivo");
  const METODOS = ["Efectivo", "Yape", "Otro"];

  const handleReset = () => {
    setAmount("");
    setDate(hoyISO());
    setClient(CLIENTS[0]);
    setMethod("Efectivo");
  };

  const handleSave = async () => {
    const amountNum = amount.trim() === "" ? 0 : parseFloat(amount);
    const estado = amountNum === 0 ? "Pendiente" : "Confirmado";

    if (isNaN(amountNum) || amountNum < 0) {
      return;
    }

    await createPayment({
      fecha: date,
      cliente: client,
      monto: amountNum,
      metodo: method,
      estado,
    });

    handleReset();
  };

  return (
    <SafeAreaView
      className="flex-1 px-4 bg-background dark:bg-dark-background"
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0e0f0f" : "#F8FAFC"}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Encabezado ── */}
        <View className="flex-row justify-between items-center py-8">
          <View className="flex-1 gap-1">
            <Text className="text-4xl font-extrabold tracking-tight text-text dark:text-dark-text">
              Registrar pago
            </Text>
            <Text className="text-sm text-textMuted dark:text-dark-textMuted">
              Completa los datos del cobro
            </Text>
          </View>
          <TouchableOpacity
            className="justify-center p-1"
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
            <Fontisto
              name="night-clear"
              size={24}
              color={isDark ? "#F8FAFC" : "#0F172A"}
            />
          </TouchableOpacity>
        </View>

        <View className="gap-8">
          {/* ── Sección: Cliente ── */}
          <View className="gap-4">
            <Text className="font-extrabold text-md text-text dark:text-dark-text">
              ¿Quién pagó?
            </Text>
            <ClientSelector
              clients={CLIENTS}
              selected={client}
              onChange={setClient}
            />

            {/* ── Sección: Monto ── */}
            <View className="flex-row items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border px-3 py-2 shadow-sm">
              <Text className="mr-2 text-xl font-extrabold text-primary dark:text-dark-primary">
                {CURRENCY}
              </Text>
              <TextInput
                className="flex-1 px-3 text-3xl font-bold text-text dark:text-dark-text"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
              />
            </View>
          </View>

          <View className="gap-4">
            {/* ── Sección: Método de Pago ── */}
            <Text className="font-extrabold text-md text-text dark:text-dark-text">
              Método de pago
            </Text>
            <View className="flex-row gap-2">
              {METODOS.map((item) => (
                <TouchableOpacity
                  key={item}
                  className={`flex-1 py-3 rounded-md border-[1.5px] items-center ${
                    method === item
                      ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
                      : "bg-surface dark:bg-dark-surface border-border dark:border-dark-border"
                  }`}
                  onPress={() => setMethod(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-md font-bold ${
                      method === item
                        ? "text-white"
                        : "text-textMuted dark:text-dark-textMuted"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Sección: Fecha ── */}
          <DatePickerField
            label="Fecha del pago"
            value={date}
            onChange={setDate}
          />
        </View>

        {/* ── Botón guardar ── */}
        <TouchableOpacity
          className={`rounded-xl py-4 mt-10 items-center shadow-md ${
            isSaving
              ? "bg-primaryMuted dark:bg-dark-primaryMuted"
              : "bg-primary dark:bg-dark-primary"
          }`}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-lg font-extrabold tracking-wide text-white">
              Guardar
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
