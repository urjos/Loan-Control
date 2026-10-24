import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ClientSelector({ clients, selected, onChange }) {
  const [visible, setVisible] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border px-4 py-4 shadow-sm"
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="person"
          size={22}
          color={isDark ? "#2879fa" : "#2563EB"}
          style={{ marginRight: 8 }}
        />
        <Text className="flex-1 text-base font-bold text-text dark:text-dark-text">
          {selected}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={isDark ? "#2879fa" : "#2563EB"}
        />
      </TouchableOpacity>

      {visible && (
        <Modal
          transparent
          visible={visible}
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/30"
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />
          <View className="absolute top-[30%] self-center w-[75%] max-h-[50%] bg-surface dark:bg-dark-surface rounded-md pb-1 shadow-md overflow-hidden border border-border dark:border-dark-border">
            <Text className="py-4 text-base font-bold text-center text-white bg-primary dark:bg-dark-primary">
              Selecciona un cliente
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {clients.map((c) => (
                <TouchableOpacity
                  key={c}
                  className="py-4 border-t border-border dark:border-dark-border"
                  onPress={() => {
                    onChange(c);
                    setVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-[15px] text-center ${
                      selected === c
                        ? "font-bold text-primary dark:text-dark-primary"
                        : "text-text dark:text-dark-text"
                    }`}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}
