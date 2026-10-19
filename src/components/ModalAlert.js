import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

export default function ModalAlert({
  visible,
  icono,
  titulo,
  mensaje,
  botones = [],
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-surface dark:bg-dark-surface p-8 rounded-lg items-center w-[80%] border-[1.5px] border-border dark:border-dark-border shadow-md">
          {typeof icono === "string" ? (
            <Text className="text-[40px] mb-2">{icono}</Text>
          ) : (
            <View className="mb-2">{icono}</View>
          )}
          <Text className="text-xl font-bold text-text dark:text-dark-text mb-2 text-center">
            {titulo}
          </Text>
          <Text className="text-base text-textMuted dark:text-dark-textMuted text-center mb-6">
            {mensaje}
          </Text>

          <View className="flex-row justify-between w-full gap-2">
            {botones.map((btn, index) => (
              <TouchableOpacity
                key={index}
                className="flex-1 py-2 rounded-md items-center justify-center border border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
                style={btn.estilo}
                onPress={btn.onPress}
              >
                <Text
                  className="font-bold text-base text-text dark:text-dark-text"
                  style={btn.estiloTexto}
                >
                  {btn.texto}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
