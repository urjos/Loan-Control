import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";

export default function ClienteSelector({ clientes, seleccionado, onChange }) {
  const [visible, setVisible] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (Platform.OS === "android") {
    return (
      <View className="flex-row items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border mx-4 px-4 shadow-sm h-[58px]">
        <MaterialIcons
          name="person"
          size={22}
          color={isDark ? "#94A3B8" : "#64748B"}
          style={{ marginRight: 8 }}
        />
        <Picker
          selectedValue={seleccionado}
          onValueChange={(itemValue) => onChange(itemValue)}
          style={{
            flex: 1,
            color: isDark ? "#F8FAFC" : "#0F172A",
          }}
          dropdownIconColor={isDark ? "#94A3B8" : "#64748B"}
          mode="dialog"
        >
          {clientes.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
        <Text className="text-[22px] text-textLight dark:text-dark-textLight font-bold">
          ›
        </Text>
      </View>
    );
  }

  // iOS: Modal con picker inline + botón "Listo" (idéntico al patrón de DatePickerField)
  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border mx-4 px-4 py-4 shadow-sm"
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="person"
          size={22}
          color={isDark ? "#94A3B8" : "#64748B"}
          style={{ marginRight: 8 }}
        />
        <Text className="flex-1 text-base font-bold text-text dark:text-dark-text">
          {seleccionado}
        </Text>
        <Text className="text-[22px] text-textLight dark:text-dark-textLight font-bold">
          ›
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={visible}
          animationType="slide"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/30"
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />
          <SafeAreaView className="bg-surface dark:bg-dark-surface rounded-t-lg shadow-md">
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-border dark:border-dark-border">
              <Text className="text-base font-bold text-text dark:text-dark-text">
                Selecciona un cliente
              </Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="px-2 py-1 bg-primaryLight dark:bg-dark-primaryLight rounded-sm"
              >
                <Text className="text-primary dark:text-dark-primary font-bold text-[15px]">
                  Listo
                </Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={seleccionado}
              onValueChange={(itemValue) => onChange(itemValue)}
              itemStyle={{ color: isDark ? "#F8FAFC" : "#0F172A" }}
            >
              {clientes.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}
