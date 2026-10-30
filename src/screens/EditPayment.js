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
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import ClientSelector from "../components/ClientSelector";
import DatePickerField from "../components/DatePickerField";
import { usePayments } from "../context/PaymentsContext";
import { CLIENTS, CURRENCY } from "../config/constants";
import { useAppTheme } from "../styles/theme";

export default function EditPayment({ route, navigation }) {
  const { pago } = route.params;
  const { updatePayment, isSaving } = usePayments();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = useAppTheme();

  const [client, setClient] = useState(pago.cliente);
  const [amount, setAmount] = useState(String(pago.monto));
  const [date, setDate] = useState(pago.fecha);
  const [method, setMethod] = useState(pago.metodo || "Efectivo");
  const METODOS = ["Efectivo", "Yape", "Otro"];

  const handleSave = async () => {
    const amountNum = amount.trim() === "" ? 0 : parseFloat(amount);
    const estado = amountNum === 0 ? "Pendiente" : "Confirmado";

    if (isNaN(amountNum) || amountNum < 0) {
      return;
    }

    const resultado = await updatePayment({
      id: pago.id,
      fecha: date,
      cliente: client,
      monto: amountNum,
      metodo: method,
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
    <SafeAreaView
      className="flex-1 px-4 bg-background dark:bg-dark-background"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Encabezado ── */}
        <View className="gap-3 py-8">
          <View>
            <Text className="text-4xl font-extrabold text-text dark:text-dark-text">
              Editar pago
            </Text>
            <Text className="mt-1 text-sm text-textMuted dark:text-dark-textMuted">
              Modifica los datos y guarda
            </Text>
          </View>
          <Text className="text-sm text-textLight dark:text-dark-textLight">
            ID: {pago.id}
          </Text>
        </View>

        {/* ── Cliente ── */}
        <View className="gap-8">
          <View className="gap-4">
            <Text className="font-extrabold text-md text-text dark:text-dark-text">
              Cliente
            </Text>
            <ClientSelector
              clients={CLIENTS}
              selected={client}
              onChange={setClient}
            />

            {/* ── Monto ── */}

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

          {/* ── Sección: Método de Pago ── */}
          <View className="gap-4">
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

          {/* ── Fecha ── */}
          <DatePickerField
            label="Fecha del pago"
            value={date}
            onChange={setDate}
          />
        </View>

        {/* ── Botones ── */}
        <View className="gap-4 mt-10">
          <TouchableOpacity
            className={`rounded-xl py-4 items-center shadow-md ${
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
              <Text className="text-lg font-extrabold text-white">Guardar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-4 rounded-xl border-xs border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Text className="text-lg font-bold text-textMuted dark:text-dark-textMuted">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
