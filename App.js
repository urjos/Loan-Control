import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RegisterPayment from "./src/screens/RegisterPayment";
import Historial from "./src/screens/Historial";
import EditPayment from "./src/screens/EditPayment";

import { colors, font } from "./src/styles/theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Tabs interiores ──────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "ios" ? 40 : 8,
          height: Platform.OS === "ios" ? 80 : 62,
          height: Platform.OS === "android" ? 70 : 62,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: font.bold,
        },
      }}
    >
      <Tab.Screen
        name="Registrar"
        component={RegisterPayment}
        options={{
          tabBarLabel: "Registrar Pago",
          tabBarIcon: () => (
            <MaterialIcons name="add-circle" size={28} color={colors.primary} />
          ),
        }}
      />

      <Tab.Screen
        name="Historial"
        component={Historial}
        options={{
          tabBarLabel: "Historial",
          tabBarIcon: () => (
            <MaterialIcons name="history" size={28} color={colors.primary} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Ícono emoji para los tabs ────────────────────────────────
function TabIcon({ label }) {
  return <Text style={{ fontSize: 22 }}>{label}</Text>;
}

// ── Root Stack: Tabs + pantalla modal de edición ─────────────
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Pantalla principal con las dos tabs */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Pantalla de edición: slide desde abajo en iOS, push en Android */}
        <Stack.Screen
          name="EditarPago"
          component={EditPayment}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
