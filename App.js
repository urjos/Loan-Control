import "./global.css";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Platform,
  Text,
  useColorScheme,
  Appearance,
  AppState,
  LogBox,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RegisterPayment from "./src/screens/RegisterPayment";
import Historial from "./src/screens/Historial";
import EditPayment from "./src/screens/EditPayment";
import DishwashingCalendar from "./src/screens/DishwashingCalendar";

import { font, useAppTheme } from "./src/styles/theme";
import { PaymentsProvider } from "./src/context/PaymentsContext";
import { refreshCalendarWidget } from "./src/widgets/updateWidget";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

LogBox.ignoreLogs([
  "ImageBackground is deprecated",
]);

function MainTabs() {
  const themeColors = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          paddingBottom: Platform.OS === "ios" ? 40 : 8,
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
          tabBarLabel: "Registrar",
          tabBarIcon: () => (
            <MaterialIcons
              name="add-circle"
              size={28}
              color={themeColors.primary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Historial"
        component={Historial}
        options={{
          tabBarLabel: "Historial",
          tabBarIcon: () => (
            <MaterialIcons
              name="history"
              size={28}
              color={themeColors.primary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarioPlatos"
        component={DishwashingCalendar}
        options={{
          tabBarLabel: "Calendario",
          tabBarIcon: () => (
            <MaterialIcons
              name="kitchen"
              size={28}
              color={themeColors.primary}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();

  // Refresca el widget del calendario al abrir la app y al volver a primer plano
  // (el launcher solo lo actualiza automáticamente cada 30 minutos).
  useEffect(() => {
    refreshCalendarWidget();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshCalendarWidget();
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const cargarTema = async () => {
      try {
        const temaGuardado = await AsyncStorage.getItem("temaApp");
        if (temaGuardado) Appearance.setColorScheme(temaGuardado);
      } catch (error) {
        console.log("Error al cargar el tema:", error);
      }
    };
    cargarTema();
  }, []);

  const navigationTheme =
    scheme === "dark"
      ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: "#0F172A" } }
      : {
          ...DefaultTheme,
          colors: { ...DefaultTheme.colors, background: "#F8FAFC" },
        };

  return (
    <PaymentsProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="EditarPago"
            component={EditPayment}
            options={{ presentation: "card", animation: "slide_from_right" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaymentsProvider>
  );
}
