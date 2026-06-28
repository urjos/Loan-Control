// ================================================================
// 🚀 src/hooks/usePayments.js
// Hook centralizado para gestionar pagos con capacidad offline.
// ================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// --- Simulación de API ---
// En un proyecto real, esto estaría en un archivo separado (ej. src/api/googleSheet.js)
// y la URL estaría en variables de entorno.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = {
  getPayments: async () => {
    const response = await fetch(`${API_URL}?action=get`);
    if (!response.ok) throw new Error("Error al obtener pagos");
    return await response.json();
  },
  createPayment: async (payment) => {
    const response = await fetch(`${API_URL}?action=create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error("Error al crear el pago");
    return await response.json();
  },
  updatePayment: async (id, payment) => {
    const response = await fetch(`${API_URL}?action=update&id=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error("Error al actualizar el pago");
    return await response.json();
  },
  deletePayment: async (id) => {
    const response = await fetch(`${API_URL}?action=delete&id=${id}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Error al eliminar el pago");
    return { ok: true };
  },
};
// --- Fin de simulación de API ---

const OFFLINE_QUEUE_KEY = "offline_payments_queue";

export function usePagos() {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const isSyncing = useRef(false); // Ref para evitar ejecuciones concurrentes de la sincronización.

  useEffect(() => {
    fetchPagos();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncOfflinePayments();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncOfflinePayments = useCallback(async () => {
    // La guardia con useRef es crucial para prevenir ejecuciones múltiples
    // causadas por eventos de red rápidos o re-renders.
    if (isSyncing.current) {
      console.log("Sincronización ya en progreso, omitiendo nueva ejecución.");
      return;
    }

    isSyncing.current = true;
    setSincronizando(true);

    try {
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      let queue = queueStr ? JSON.parse(queueStr) : [];

      if (queue.length === 0) {
        // No hay nada que hacer, salimos y reseteamos los flags.
        isSyncing.current = false;
        setSincronizando(false);
        return;
      }

      console.log(
        `Iniciando sincronización de ${queue.length} pagos pendientes.`,
      );

      const failedPayments = [];
      for (const pago of queue) {
        try {
          // Excluimos las propiedades locales 'id' y 'isPending' antes de enviar a la API.
          const { id, isPending, ...pagoData } = pago;
          await api.createPayment(pagoData);
          console.log(`Pago ${pago.id} sincronizado con éxito.`);
        } catch (error) {
          console.error(
            `Error al sincronizar pago ${pago.id}, se mantendrá en la cola.`,
            error,
          );
          failedPayments.push(pago); // Si falla, lo agregamos a la lista de fallidos.
        }
      }

      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(failedPayments),
      );
      await fetchPagos(); // Recargamos la lista para reflejar los cambios.
    } catch (error) {
      console.error("Error durante el proceso de sincronización:", error);
    } finally {
      isSyncing.current = false;
      setSincronizando(false);
    }
  }, []); // El array vacío asegura que la función es estable y no sufre de 'stale closures'.

  const fetchPagos = useCallback(async () => {
    setCargando(true);
    try {
      const serverData = await api.getPayments();

      // --- Verificación de Robustez ---
      // Nos aseguramos de que la respuesta de la API sea un array.
      // Si la API devuelve un objeto (ej: {data: [...]}) o algo inesperado,
      // evitamos que la app crashee.
      const serverPagos = Array.isArray(serverData) ? serverData : [];
      if (!Array.isArray(serverData)) {
        console.warn(
          "Respuesta inesperada de la API. Se esperaba un array pero se recibió:",
          serverData,
        );
      }

      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = queueStr ? JSON.parse(queueStr) : [];
      const combinedPagos = [
        ...serverPagos,
        ...queue.filter(
          (offlinePago) =>
            !serverPagos.some((serverPago) => serverPago.id === offlinePago.id),
        ),
      ];
      setPagos(combinedPagos);
    } catch (error) {
      console.error(
        "Error de red al obtener pagos, cargando desde local:",
        error,
      );
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = queueStr ? JSON.parse(queueStr) : [];
      setPagos(queue);
    } finally {
      setCargando(false);
    }
  }, []);

  const crearPago = useCallback(
    async (nuevoPago) => {
      setGuardando(true);
      const netState = await NetInfo.fetch();

      if (netState.isConnected && netState.isInternetReachable) {
        try {
          const pagoGuardado = await api.createPayment(nuevoPago);
          setPagos((prev) => [pagoGuardado, ...prev]);
          syncOfflinePayments();
          return { ok: true, pago: pagoGuardado };
        } catch (error) {
          return await saveOffline(
            nuevoPago,
            "Fallo la API, guardando localmente.",
          );
        } finally {
          setGuardando(false);
        }
      } else {
        return await saveOffline(
          nuevoPago,
          "Sin conexión, guardado localmente.",
        );
      }
    },
    [syncOfflinePayments],
  );

  const saveOffline = async (pago, reason) => {
    try {
      const pagoTemporal = {
        ...pago,
        id: `offline_${Date.now()}`,
        isPending: true, // Flag para la UI
      };

      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      let queue = queueStr ? JSON.parse(queueStr) : [];
      queue.push(pagoTemporal);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

      setPagos((prev) => [pagoTemporal, ...prev]);
      console.log(reason, pagoTemporal.id);
      return { ok: true, pago: pagoTemporal };
    } catch (error) {
      return { ok: false, message: "No se pudo guardar localmente." };
    } finally {
      setGuardando(false);
    }
  };

  const actualizarPago = useCallback(async (pagoActualizado) => {
    setGuardando(true);
    const { id } = pagoActualizado;

    // --- Caso 1: Editando un pago que fue creado offline y aún no se sincroniza ---
    if (String(id).startsWith("offline_")) {
      try {
        const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        let queue = queueStr ? JSON.parse(queueStr) : [];
        const index = queue.findIndex((p) => p.id === id);
        if (index !== -1) {
          // Mantenemos el ID original y el flag isPending
          queue[index] = {
            ...pagoActualizado,
            id: queue[index].id,
            isPending: true,
          };
          await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

          // Actualizamos el estado local
          setPagos((prevPagos) =>
            prevPagos.map((p) => (p.id === id ? queue[index] : p)),
          );
          return { ok: true, pago: queue[index] };
        }
      } catch (error) {
        console.error("Error al actualizar pago offline:", error);
        return { ok: false, message: "No se pudo actualizar el pago local." };
      } finally {
        setGuardando(false);
      }
    }

    // --- Caso 2: Editando un pago que ya está en el servidor ---
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      setGuardando(false);
      return {
        ok: false,
        message:
          "No se pueden editar registros sincronizados sin conexión a internet.",
      };
    }

    try {
      const { id, ...dataToUpdate } = pagoActualizado;
      const pagoRemotoActualizado = await api.updatePayment(id, dataToUpdate);
      setPagos((prevPagos) =>
        prevPagos.map((p) => (p.id === id ? pagoRemotoActualizado : p)),
      );
      return { ok: true, pago: pagoRemotoActualizado };
    } catch (error) {
      console.error("Error de API al actualizar pago:", error);
      return {
        ok: false,
        message: "El servidor no pudo actualizar el pago. Intenta más tarde.",
      };
    } finally {
      setGuardando(false);
    }
  }, []);

  const eliminarPago = useCallback(async (id) => {
    if (String(id).startsWith("offline_")) {
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      let queue = queueStr ? JSON.parse(queueStr) : [];
      const newQueue = queue.filter((p) => p.id !== id);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
      setPagos((prev) => prev.filter((p) => p.id !== id));
      return { ok: true };
    }

    try {
      await api.deletePayment(id);
      setPagos((prev) => prev.filter((p) => p.id !== id));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: "Error al conectar con el servidor." };
    }
  }, []);

  return {
    pagos,
    cargando,
    guardando,
    sincronizando,
    fetchPagos,
    crearPago,
    eliminarPago,
    actualizarPago,
  };
}
