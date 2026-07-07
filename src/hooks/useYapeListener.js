// src/hooks/useYapeListener.js
//
// Hook que escucha las notificaciones de Yape en tiempo real,
// parsea el nombre y monto, y registra el pago automáticamente.
//
// REQUISITOS:
//   - react-native-notification-listener  (pnpm add react-native-notification-listener)
//   - expo-notifications                  (npx expo install expo-notifications)
//   - El usuario debe otorgar permiso de "Acceso a notificaciones" en Ajustes de Android
//
// FORMATOS SOPORTADOS (según notificaciones reales de Yape):
//   Formato A: "Cecilia San* te envió un pago por S/ 20. El cód. de seguridad es: 163"
//   Formato B: "Yape! Cecilia  Sanchez Rivera te envió un pago por S/ 500"

import { useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { CLIENTES } from "../config/constants";
import { usePagos } from "../context/PaymentsContext";

// Título exacto que usan las notificaciones de Yape de cobro
const YAPE_TITULO = "Confirmación de Pago";

// ── Parser ────────────────────────────────────────────────────────
//
// Extrae { primerNombre, monto } del texto de la notificación.
// Devuelve null si el texto no corresponde a un pago de Yape.
//
// Regex Formato A: "Cecilia San* te envió un pago por S/ 20..."
//   Captura: grupo 1 = "Cecilia San", grupo 2 = "20"
//
// Regex Formato B: "Yape! Cecilia  Sanchez Rivera te envió un pago por S/ 500"
//   Captura: grupo 1 = "Cecilia  Sanchez Rivera", grupo 2 = "500"
//
const parsearNotificacionYape = (titulo, cuerpo) => {
  if (!titulo || !cuerpo) return null;
  if (titulo.trim() !== YAPE_TITULO) return null;

  const REGEX_FORMATO_A = /^(.+?)\*?\s+te envió un pago por S\/\s*([\d.]+)/i;
  const REGEX_FORMATO_B =
    /^Yape!\s+(.+?)\s+te envió un pago por S\/\s*([\d.]+)/i;

  // Intenta Formato B primero (nombre completo, más info)
  const match = cuerpo.match(REGEX_FORMATO_B) || cuerpo.match(REGEX_FORMATO_A);
  if (!match) return null;

  const nombreCompleto = match[1].trim().replace(/\*/g, ""); // quita el *
  const monto = parseFloat(match[2]);

  if (isNaN(monto) || monto <= 0) return null;

  // Extrae solo el primer nombre (sin apellidos)
  // "Cecilia Sanchez Rivera" → "Cecilia"
  // "Cecilia San" → "Cecilia"
  const primerNombre = nombreCompleto.split(/\s+/)[0];

  return { primerNombre, monto };
};

// ── Matching de cliente ───────────────────────────────────────────
//
// Compara el primer nombre del pagador con la lista de CLIENTES,
// ignorando mayúsculas y tildes.
// "cecilia" === "Cecilia" ✓   "vilma" === "Vilma" ✓
//
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .trim();

const encontrarCliente = (primerNombre) => {
  const nombreNorm = normalizar(primerNombre);
  return (
    CLIENTES.find((cliente) => {
      // Compara con el primer nombre del cliente en la app
      const primerNombreCliente = cliente.split(" ")[0];
      return normalizar(primerNombreCliente) === nombreNorm;
    }) || null
  );
};

// ── Fecha de hoy en YYYY-MM-DD ────────────────────────────────────
const hoyISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ── Notificación local ─────────────────────────────────────────────
const mostrarNotificacionLocal = async (titulo, cuerpo) => {
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo, sound: true },
    trigger: null, // inmediata
  });
};

// ── Función exportada para HeadlessJS (index.js) ─────────────────
// Se ejecuta cuando llega una notificación con la app en segundo plano.
// No puede usar hooks — llama a la API directamente.
export const parsearYRegistrarPagoYape = async (notificacion) => {
  const { title: titulo, text: cuerpo } = notificacion;

  const esYape =
    notificacion.app?.toLowerCase().includes("yape") || titulo === YAPE_TITULO;
  if (!esYape) return;

  const resultado = parsearNotificacionYape(titulo, cuerpo);
  if (!resultado) return;

  const { primerNombre, monto } = resultado;
  const clienteEncontrado = encontrarCliente(primerNombre);
  const fecha = hoyISO();

  const nuevoPago = {
    fecha,
    monto,
    metodo: "Yape",
    cliente: clienteEncontrado || `${primerNombre} (Yape - revisar)`,
    estado: clienteEncontrado ? "Confirmado" : "Pendiente",
  };

  // Importamos la API directamente (sin contexto de React)
  const { api } = require("../api/googleSheet");
  const { generarId } = require("../context/PaymentsContext");
  await api.createPayment({ ...nuevoPago, id: generarId() });

  await mostrarNotificacionLocal(
    clienteEncontrado
      ? "✅ Pago registrado automáticamente"
      : "⚠️ Pago de cliente no reconocido",
    clienteEncontrado
      ? `${clienteEncontrado} · S/ ${monto.toFixed(2)} vía Yape`
      : `"${primerNombre}" no está en tu lista. Revisa el historial.`,
  );
};

export function useYapeListener() {
  if (Platform.OS !== "android") return { permisoOtorgado: false };

  const { crearPago } = usePagos();

  const solicitarPermiso = useCallback(async () => {
    try {
      const RNNotificationListener = require("react-native-notification-listener");
      const hasPermission =
        await RNNotificationListener.default.hasPermission();

      if (!hasPermission) {
        Alert.alert(
          "Permiso requerido",
          'Para registrar pagos de Yape automáticamente, activa "Acceso a notificaciones" para esta app en Ajustes de Android.',
          [
            { text: "Ahora no", style: "cancel" },
            {
              text: "Ir a Ajustes",
              // requestPermission abre directamente la pantalla de Android
              onPress: () => RNNotificationListener.default.requestPermission(),
            },
          ],
        );
        return false;
      }
      return true;
    } catch (e) {
      console.warn("useYapeListener: error verificando permiso:", e.message);
      return false;
    }
  }, []);

  // Procesar una notificación de Yape recibida
  const procesarNotificacion = useCallback(
    async (notificacion) => {
      try {
        const { title: titulo, text: cuerpo, app } = notificacion;

        // Filtramos solo notificaciones de Yape
        // El package name de Yape en Android es pe.com.bcp.innovacxion.yapeapp
        const esYape =
          app?.toLowerCase().includes("yape") || titulo === YAPE_TITULO;

        if (!esYape) return;

        const resultado = parsearNotificacionYape(titulo, cuerpo);
        if (!resultado) return;

        const { primerNombre, monto } = resultado;
        const clienteEncontrado = encontrarCliente(primerNombre);

        // ── Caso 1: cliente conocido → registrar pago confirmado ──
        if (clienteEncontrado) {
          const nuevoPago = {
            fecha: hoyISO(),
            cliente: clienteEncontrado,
            monto: monto,
            metodo: "Yape",
            estado: "Confirmado",
          };

          await crearPago(nuevoPago);

          await mostrarNotificacionLocal(
            "✅ Pago registrado automáticamente",
            `${clienteEncontrado} · S/ ${monto.toFixed(2)} vía Yape`,
          );

          console.log(
            `[Yape] Pago registrado: ${clienteEncontrado} S/ ${monto}`,
          );
        }

        // ── Caso 2: cliente desconocido → registrar con aviso ──
        else {
          const nombreConAviso = `${primerNombre} (Yape - revisar)`;
          const nuevoPago = {
            fecha: hoyISO(),
            cliente: nombreConAviso,
            monto: monto,
            metodo: "Yape",
            estado: "Pendiente",
          };

          await crearPago(nuevoPago);

          await mostrarNotificacionLocal(
            "⚠️ Pago de cliente no reconocido",
            `"${primerNombre}" no está en tu lista. Revisa el historial.`,
          );

          console.log(
            `[Yape] Cliente no reconocido: "${primerNombre}" S/ ${monto}`,
          );
        }
      } catch (e) {
        console.error("[Yape] Error procesando notificación:", e.message);
      }
    },
    [crearPago],
  );

  // Iniciar el listener al montar la app
  useEffect(() => {
    let suscripcion = null;

    const iniciar = async () => {
      // Configura expo-notifications para mostrar alertas en primer plano
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const tienePermiso = await solicitarPermiso();
      if (!tienePermiso) return;

      try {
        const RNNotificationListener = require("react-native-notification-listener");

        // startListening arranca el servicio en segundo plano
        await RNNotificationListener.default.startListening();

        // getNotifications no es event-driven en este paquete:
        // usa un HeadlessJS task. Necesitamos registrar la tarea
        // directamente en index.js (ver instrucciones abajo).
        // Aquí solo guardamos referencia para el cleanup.
        suscripcion = {
          remove: () => RNNotificationListener.default.stopListening(),
        };

        console.log("[Yape] Listener iniciado correctamente.");
      } catch (e) {
        console.error("[Yape] Error al iniciar listener:", e.message);
      }
    };

    iniciar();

    // Limpieza al desmontar
    return () => {
      if (suscripcion) {
        suscripcion.remove();
      }
    };
  }, [solicitarPermiso, procesarNotificacion]);

  return { solicitarPermiso };
}
