import { useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { CLIENTES, YAPE_CLIENT_MAP } from "../config/constants";
import { usePagos } from "../context/PaymentsContext";

const YAPE_TITULO = "Confirmación de Pago";

const parsearNotificacionYape = (titulo, cuerpo) => {
  if (!titulo || !cuerpo) return null;
  if (titulo.trim() !== YAPE_TITULO) return null;

  const REGEX_FORMATO_A =
    /^(.+?)\s+([A-Za-záéíóúÁÉÍÓÚñÑ]+)\*\s+te envió un pago por S\/\s*([\d.]+)/i;
  const REGEX_FORMATO_B =
    /^Yape!\s+(.+?)\s+([A-Za-záéíóúÁÉÍÓÚñÑ]+)\s+\S*\s+te envió un pago por S\/\s*([\d.]+)/i;

  let primerNombre, apellidoPrefijo, monto;

  const matchB = cuerpo.match(REGEX_FORMATO_B);
  const matchA = cuerpo.match(REGEX_FORMATO_A);

  if (matchB) {
    primerNombre = matchB[1].trim();
    apellidoPrefijo = matchB[2].trim();
    monto = parseFloat(matchB[3]);
  } else if (matchA) {
    primerNombre = matchA[1].trim();
    apellidoPrefijo = matchA[2].trim();
    monto = parseFloat(matchA[3]);
  } else {
    return null;
  }

  if (isNaN(monto) || monto <= 0) return null;

  return { primerNombre, apellidoPrefijo, monto };
};

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const encontrarCliente = (primerNombre, apellidoPrefijo) => {
  const nombreNorm = normalizar(primerNombre);
  const apellidoNorm = normalizar(apellidoPrefijo);

  const matchExacto = YAPE_CLIENT_MAP.find(
    (m) =>
      normalizar(m.yapeNombre) === nombreNorm &&
      apellidoNorm.startsWith(normalizar(m.yapeApellidoPrefix)),
  );
  if (matchExacto) return matchExacto.appNombre;

  return (
    CLIENTES.find((c) => normalizar(c.split(" ")[0]) === nombreNorm) || null
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

  const { primerNombre, apellidoPrefijo, monto } = resultado;
  const clienteEncontrado = encontrarCliente(primerNombre, apellidoPrefijo);
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

        const { primerNombre, apellidoPrefijo, monto } = resultado;
        const clienteEncontrado = encontrarCliente(
          primerNombre,
          apellidoPrefijo,
        );
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
