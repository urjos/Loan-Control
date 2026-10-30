import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import ModalAlert from "./ModalAlert";
import { CURRENCY } from "../config/constants";

// Formats 'YYYY-MM-DD' → 'DD/MM/YYYY'
const formatDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
};

export default function PaymentCard({ payment, onEdit, onDelete, isPending }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const estadoPago =
    payment.estado ||
    (parseFloat(payment.monto) === 0 ? "Pendiente" : "Confirmado");
  const confirmarEliminacion = () => setIsModalVisible(true);

  return (
    <View className="overflow-hidden mb-2 rounded-lg shadow-sm bg-surface dark:bg-dark-surface">
      {isPending && (
        <View className="flex-row gap-1 items-center px-4 py-1.5 bg-amber-100 border-amber-200 dark:bg-amber-500 dark:border-amber-800">
          <MaterialIcons name="wifi-off" size={12} color="#fef3c7" />
          <Text className="text-xs font-bold text-amber-800 dark:text-amber-100">
            Pendiente de sincronizar
          </Text>
        </View>
      )}
      <View className="flex-row gap-2 items-center px-4 pt-4 pb-2">
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-text dark:text-dark-text">
            {payment.cliente}
          </Text>

          <Text className="text-sm text-textMuted dark:text-dark-textMuted">
            {formatDate(payment.fecha)}{" "}
            {payment.registrado_en?.split(" ")[1] || ""}•{" "}
            {payment.metodo || "Efectivo"}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className={`text-2xl font-extrabold ${
              estadoPago === "Pendiente"
                ? "text-warning dark:text-dark-warning"
                : "text-success dark:text-dark-success"
            }`}
          >
            {CURRENCY} {parseFloat(payment.monto || 0).toFixed(2)}
          </Text>
          {estadoPago === "Pendiente" && (
            <Text className="mt-0.5 text-xs font-bold text-warning dark:text-dark-warning">
              PENDIENTE
            </Text>
          )}
        </View>
      </View>

      {/* ── Divisor ── */}
      <View className="h-[1px] bg-divider dark:bg-dark-divider mx-4" />

      {/* ── Acciones: Editar / Eliminar ── */}
      <View className="flex-row">
        <TouchableOpacity
          className="flex-1 justify-center items-center py-2.5 border-r border-divider dark:border-dark-divider"
          onPress={() => onEdit(payment)}
          activeOpacity={0.75}
        >
          <Text className="text-[13px] font-bold text-warning dark:text-dark-warning">
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 justify-center items-center py-2.5"
          onPress={confirmarEliminacion}
          disabled={isDeleting}
          activeOpacity={0.75}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Text className="text-[13px] font-bold text-danger dark:text-dark-danger">
              Eliminar
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <ModalAlert
        visible={isModalVisible}
        icon={<MaterialIcons name="warning" size={48} color="#DC2626" />}
        title="¿Eliminar pago?"
        message="Esta acción no se puede deshacer."
        buttons={[
          {
            text: "Cancelar",
            onPress: () => setIsModalVisible(false),
          },
          {
            text: "Eliminar",
            onPress: async () => {
              setIsModalVisible(false);
              setIsDeleting(true);
              await onDelete(payment.id);
              setIsDeleting(false);
            },
            style: { backgroundColor: "#DC2626", borderColor: "#DC2626" },
            textStyle: { color: "#FFF" },
          },
        ]}
      />
    </View>
  );
}
