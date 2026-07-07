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

  const match = cuerpo.match(REGEX_FORMATO_B) || cuerpo.match(REGEX_FORMATO_A);
  if (!match) return null;

  const nombreCompleto = match[1].trim().replace(/\*/g, ""); // quita el *
  const monto = parseFloat(match[2]);

  if (isNaN(monto) || monto <= 0) return null;

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

  const { api } = require("../api/googleSheet");
  const { generarId } = require("../context/PaymentsContext");

  let pagoExistentePendiente = null;
  try {
    const pagosExistentes = await api.getPayments();
    if (Array.isArray(pagosExistentes)) {
      pagoExistentePendiente = pagosExistentes.find(
        (p) =>
          p.cliente === clienteEncontrado &&
          p.fecha === fecha &&
          String(p.estado).toLowerCase() === "pendiente",
      );
    }
  } catch (e) {
    console.warn("[Yape] No se pudo consultar pagos existentes:", e.message);
  }

  if (clienteEncontrado) {
    if (pagoExistentePendiente) {
      // ── CASO A: ya había un pendiente hoy → actualizamos ese ──
      await api.updatePayment(pagoExistentePendiente.id, {
        ...pagoExistentePendiente,
        monto,
        metodo: "Yape",
        estado: "Confirmado",
      });

      await mostrarNotificacionLocal(
        "✅ Pago confirmado automáticamente",
        `Pago pendiente de ${clienteEncontrado} actualizado a S/ ${monto.toFixed(2)} vía Yape`,
      );
    } else {
      await api.createPayment({
        id: generarId(),
        fecha,
        monto,
        metodo: "Yape",
        cliente: clienteEncontrado,
        estado: "Confirmado",
      });

      await mostrarNotificacionLocal(
        "✅ Pago registrado automáticamente",
        `${clienteEncontrado} · S/ ${monto.toFixed(2)} vía Yape`,
      );
    }
  } else {
    await api.createPayment({
      id: generarId(),
      fecha,
      monto,
      metodo: "Yape",
      cliente: `${primerNombre} (Yape - revisar)`,
      estado: "Pendiente",
    });

    await mostrarNotificacionLocal(
      "⚠️ Pago de cliente no reconocido",
      `"${primerNombre}" no está en tu lista. Revisa el historial.`,
    );
  }
};

// ── Hook principal ─────────────────────────────────────────────────
export function useYapeListener() {
  if (Platform.OS !== "android") return { permisoOtorgado: false };

  const { crearPago, actualizarPago, pagos } = usePagos();

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

  const procesarNotificacion = useCallback(
    async (notificacion) => {
      try {
        const { title: titulo, text: cuerpo, app } = notificacion;

        const esYape =
          app?.toLowerCase().includes("yape") || titulo === YAPE_TITULO;
        if (!esYape) return;

        const resultado = parsearNotificacionYape(titulo, cuerpo);
        if (!resultado) return;

        const { primerNombre, monto } = resultado;
        const clienteEncontrado = encontrarCliente(primerNombre);
        const fecha = hoyISO();

        if (clienteEncontrado) {
          const pendienteHoy = pagos.find(
            (p) =>
              p.cliente === clienteEncontrado &&
              p.fecha === fecha &&
              String(p.estado).toLowerCase() === "pendiente",
          );

          if (pendienteHoy) {
            // ── CASO A: había pendiente hoy → actualizar ──
            await actualizarPago({
              ...pendienteHoy,
              monto,
              metodo: "Yape",
              estado: "Confirmado",
            });

            await mostrarNotificacionLocal(
              "✅ Pago confirmado automáticamente",
              `Pago pendiente de ${clienteEncontrado} actualizado a S/ ${monto.toFixed(2)} vía Yape`,
            );
          } else {
            // ── CASO B: no había pendiente hoy → crear nuevo ──
            await crearPago({
              fecha,
              cliente: clienteEncontrado,
              monto,
              metodo: "Yape",
              estado: "Confirmado",
            });

            await mostrarNotificacionLocal(
              "✅ Pago registrado automáticamente",
              `${clienteEncontrado} · S/ ${monto.toFixed(2)} vía Yape`,
            );
          }
        } else {
          await crearPago({
            fecha,
            cliente: `${primerNombre} (Yape - revisar)`,
            monto,
            metodo: "Yape",
            estado: "Pendiente",
          });

          await mostrarNotificacionLocal(
            "⚠️ Pago de cliente no reconocido",
            `"${primerNombre}" no está en tu lista. Revisa el historial.`,
          );
        }
      } catch (e) {
        console.error("[Yape] Error procesando notificación:", e.message);
      }
    },
    [crearPago, actualizarPago, pagos],
  );

  useEffect(() => {
    let suscripcion = null;

    const iniciar = async () => {
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

        await RNNotificationListener.default.startListening();

        suscripcion = {
          remove: () => RNNotificationListener.default.stopListening(),
        };

        console.log("[Yape] Listener iniciado correctamente.");
      } catch (e) {
        console.error("[Yape] Error al iniciar listener:", e.message);
      }
    };

    iniciar();

    return () => {
      if (suscripcion) {
        suscripcion.remove();
      }
    };
  }, [solicitarPermiso, procesarNotificacion]);

  return { solicitarPermiso };
}
