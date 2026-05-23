import { useState, useCallback } from "react";
import * as api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function usePagos() {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // ── Lectura ──────────────────────────────────────────────────

  const fetchPagos = useCallback(async () => {
    setError(null);

    try {
      const cache = await AsyncStorage.getItem("@pagos_cache");
      if (cache) {
        setPagos(JSON.parse(cache));
      } else {
        setCargando(true);
      }
    } catch (e) {
      console.log("Error leyendo caché", e);
    }

    try {
      const data = await api.getPagos();
      setPagos(data);

      await AsyncStorage.setItem("@pagos_cache", JSON.stringify(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  // ── Escritura ─────────────────────────────────────────────────

  const crearPago = async (pago) => {
    setGuardando(true);
    setError(null);
    try {
      const respuesta = await api.createPago(pago);

      setPagos((prev) => [
        {
          id: respuesta.id,
          ...pago,
          registrado_en: `_ ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`,
        },
        ...prev,
      ]);

      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, message: e.message };
    } finally {
      setGuardando(false);
    }
  };

  const actualizarPago = async (pago) => {
    setGuardando(true);
    setError(null);
    try {
      await api.updatePago(pago);
      setPagos((prev) =>
        prev.map((p) => (p.id === pago.id ? { ...p, ...pago } : p)),
      );
      print("Pago actualizado localmente:", pago);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, message: e.message };
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPago = async (id) => {
    setGuardando(true);
    setError(null);
    try {
      await api.deletePago(id);
      // Elimina del estado local inmediatamente (optimistic update)
      setPagos((prev) => prev.filter((p) => String(p.id) !== String(id)));
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, message: e.message };
    } finally {
      setGuardando(false);
    }
  };

  return {
    pagos,
    cargando,
    guardando,
    error,
    fetchPagos,
    crearPago,
    actualizarPago,
    eliminarPago,
  };
}
