// ================================================================
// 👤  src/components/ClienteSelector.js
// Selector de cliente en forma de chips/píldoras tocables.
// ================================================================

import React from "react";
import { Text, TouchableOpacity, ScrollView } from "react-native";

export default function ClienteSelector({ clientes, seleccionado, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 gap-2 flex-row"
    >
      {clientes.map((nombre) => {
        const activo = seleccionado === nombre;
        return (
          <TouchableOpacity
            key={nombre}
            className={`px-4 py-2 rounded-full border-[1.5px] ${
              activo
                ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
                : "bg-divider dark:bg-dark-divider border-border dark:border-dark-border"
            }`}
            onPress={() => onChange(nombre)}
            activeOpacity={0.75}
          >
            <Text
              className={`text-sm font-bold ${
                activo ? "text-white" : "text-textMuted dark:text-dark-textMuted"
              }`}
            >
              {nombre}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
