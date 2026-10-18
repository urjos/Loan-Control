import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ModalAlert from "./ModalAlert";
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

  const estadoPago =
    pago.estado || (parseFloat(pago.monto) === 0 ? "Pendiente" : "Confirmado");
  const confirmarEliminacion = () => setModalVisible(true);

  return (
    <View className="bg-surface dark:bg-dark-surface rounded-lg mb-2 overflow-hidden shadow-sm">
      {isPending && (
        <View className="flex-row items-center gap-1 bg-amber-100 dark:bg-amber-950 px-4 py-1.5 border-b border-amber-200 dark:border-amber-800">
          <MaterialIcons name="wifi-off" size={12} color="#92400e" />
          <Text className="text-[11px] font-bold text-amber-800 dark:text-amber-200">
            Pendiente de sincronizar
          </Text>
        </View>
      )}
      <View className="flex-row items-center px-4 pt-4 pb-2 gap-2">
        <View className="w-10 h-10 rounded-full bg-primaryLight dark:bg-dark-primaryLight justify-center items-center border-[1.5px] border-primaryBorder dark:border-dark-primaryBorder">
          <Text className="text-lg font-extrabold text-primary dark:text-dark-primary">
            {pago.cliente?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-text dark:text-dark-text">
            {pago.cliente}
          </Text>

          <Text className="text-[13px] text-textMuted dark:text-dark-textMuted mt-0.5">
            {formatearFecha(pago.fecha)}{" "}
            {pago.registrado_en?.split(" ")[1] || ""} •{" "}
            {pago.metodo || "Efectivo"}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className={`text-xl font-extrabold ${
              estadoPago === "Pendiente"
                ? "text-warning dark:text-dark-warning"
                : "text-success dark:text-dark-success"
            }`}
          >
            {MONEDA} {parseFloat(pago.monto || 0).toFixed(2)}
          </Text>
          {estadoPago === "Pendiente" && (
            <Text className="text-xs font-bold text-warning dark:text-dark-warning mt-0.5">
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
          className="flex-1 py-2.5 items-center justify-center border-r border-divider dark:border-dark-divider"
          onPress={() => onEditar(pago)}
          activeOpacity={0.75}
        >
          <Text className="text-[13px] font-bold text-warning dark:text-dark-warning">
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-2.5 items-center justify-center"
          onPress={confirmarEliminacion}
          disabled={eliminando}
          activeOpacity={0.75}
        >
          {eliminando ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Text className="text-[13px] font-bold text-danger dark:text-dark-danger">
              Eliminar
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <ModalAlert
        visible={modalVisible}
        icono={<MaterialIcons name="warning" size={48} color="#DC2626" />}
        titulo="¿Eliminar pago?"
        mensaje="Esta acción no se puede deshacer."
        botones={[
          {
            texto: "Cancelar",
            onPress: () => setModalVisible(false),
          },
          {
            texto: "Eliminar",
            onPress: async () => {
              setModalVisible(false);
              setEliminando(true);
              await onEliminar(pago.id);
              setEliminando(false);
            },
            estilo: { backgroundColor: "#DC2626", borderColor: "#DC2626" },
            estiloTexto: { color: "#FFF" },
          },
        ]}
      />
    </View>
  );
}
