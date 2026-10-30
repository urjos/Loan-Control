import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

import { api } from "../api/googleSheet";

const OFFLINE_QUEUE_KEY = "offline_payments_queue";
const CACHE_KEY = "payments_cache";

export const generateId = () =>
  `P_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const PaymentsContext = createContext(null);

export function PaymentsProvider({ children }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);
  const needsResyncRef = useRef(false);
  const lastFetchTime = useRef(0);

  useEffect(() => {
    fetchPayments();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncOfflinePayments();
      }
    });
    return () => unsubscribe();
  }, []);

  const syncOfflinePayments = useCallback(async () => {
    if (syncingRef.current) {
      needsResyncRef.current = true; // se pidió otra sync mientras corría una: repetir al terminar
      return;
    }

    syncingRef.current = true;
    setIsSyncing(true);
    let algoSincronizado = false;

    try {
      do {
        needsResyncRef.current = false;

        const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        const queue = queueStr ? JSON.parse(queueStr) : [];
        if (queue.length === 0) break;

        const syncedIds = new Set();
        for (const payment of queue) {
          try {
            const { id, isPending, ...paymentData } = payment;
            const idPermanente = id.startsWith("offline_")
              ? `P_${id.slice(8)}`
              : id;
            await api.createPayment({ ...paymentData, id: idPermanente });
            syncedIds.add(id);
          } catch (error) {
            console.error(
              `Error al sincronizar payment ${payment.id}:`,
              error?.message ?? error,
            );
          }
        }

        const latestStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        const latest = latestStr ? JSON.parse(latestStr) : [];
        await AsyncStorage.setItem(
          OFFLINE_QUEUE_KEY,
          JSON.stringify(latest.filter((p) => !syncedIds.has(p.id))),
        );

        if (syncedIds.size === 0) break;
        algoSincronizado = true;
      } while (needsResyncRef.current);

      if (algoSincronizado) await fetchPayments({ force: true });
    } catch (error) {
      console.error("Error durante el proceso de sincronización:", error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  const fetchPayments = useCallback(
    async ({ force = false } = {}) => {
      const ahora = Date.now();
      const esFresco = ahora - lastFetchTime.current < 30_000;

      if (!force && esFresco && payments.length > 0) {
        return;
      }

      setIsLoading(true);
      try {
        const serverData = await api.getPayments();
        const serverPagos = Array.isArray(serverData) ? serverData : [];
        if (!Array.isArray(serverData)) {
          console.warn("Respuesta inesperada de la API:", serverData);
        }

        const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        const queue = queueStr ? JSON.parse(queueStr) : [];
        const combinedPagos = [
          ...serverPagos,
          ...queue.filter(
            (offlinePago) =>
              !serverPagos.some(
                (serverPago) => serverPago.id === offlinePago.id,
              ),
          ),
        ];
        setPayments(combinedPagos);

        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(serverPagos));
        lastFetchTime.current = Date.now();
      } catch (error) {
        console.error(
          "Error de red al obtener pagos, cargando desde local:",
          error,
        );
        const [cacheStr, queueStr] = await Promise.all([
          AsyncStorage.getItem(CACHE_KEY),
          AsyncStorage.getItem(OFFLINE_QUEUE_KEY),
        ]);
        const cache = cacheStr ? JSON.parse(cacheStr) : [];
        const queue = queueStr ? JSON.parse(queueStr) : [];
        const combinedOffline = [
          ...queue,
          ...cache.filter((c) => !queue.some((q) => q.id === c.id)),
        ];
        setPayments(combinedOffline);
      } finally {
        setIsLoading(false);
      }
    },
    [payments.length],
  );

  const saveOffline = async (pago, reason) => {
    try {
      const pagoTemporal = {
        ...pago,
        id: `offline_${Date.now()}`,
        isPending: true,
      };

      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      let queue = queueStr ? JSON.parse(queueStr) : [];
      queue.push(pagoTemporal);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

      setPayments((prev) => [pagoTemporal, ...prev]);
      console.log(reason, pagoTemporal.id);
      return { ok: true, pago: pagoTemporal };
    } catch (error) {
      return { ok: false, message: "No se pudo guardar localmente." };
    } finally {
      setIsSaving(false);
    }
  };

  const createPayment = useCallback(
    async (nuevoPago) => {
      setIsSaving(true);
      try {
        const resultado = await saveOffline(
          nuevoPago,
          "Guardado local instantáneo. Sincronizando con el servidor...",
        );

        syncOfflinePayments();

        return resultado;
      } finally {
        setIsSaving(false);
      }
    },
    [syncOfflinePayments],
  );

  const updatePayment = useCallback(async (pagoActualizado) => {
    setIsSaving(true);
    const { id } = pagoActualizado;

    if (String(id).startsWith("offline_")) {
      try {
        const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        let queue = queueStr ? JSON.parse(queueStr) : [];
        const index = queue.findIndex((p) => p.id === id);
        if (index !== -1) {
          queue[index] = {
            ...pagoActualizado,
            id: queue[index].id,
            isPending: true,
          };
          await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
          setPayments((prevPayments) =>
            prevPayments.map((p) => (p.id === id ? queue[index] : p)),
          );
          return { ok: true, pago: queue[index] };
        }
      } catch (error) {
        console.error("Error al actualizar pago offline:", error);
        return { ok: false, message: "No se pudo actualizar el pago local." };
      } finally {
        setIsSaving(false);
      }
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      setIsSaving(false);
      return {
        ok: false,
        message:
          "No se pueden editar registros sincronizados sin conexión a internet.",
      };
    }

    try {
      const { id, ...dataToUpdate } = pagoActualizado;
      const pagoRemotoActualizado = await api.updatePayment(id, dataToUpdate);
      setPayments((prevPayments) =>
        prevPayments.map((p) => (p.id === id ? pagoRemotoActualizado : p)),
      );
      return { ok: true, pago: pagoRemotoActualizado };
    } catch (error) {
      console.error("Error de API al actualizar pago:", error);
      return {
        ok: false,
        message: "El servidor no pudo actualizar el pago. Intenta más tarde.",
      };
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deletePayment = useCallback(async (id) => {
    if (String(id).startsWith("offline_")) {
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      let queue = queueStr ? JSON.parse(queueStr) : [];
      const newQueue = queue.filter((p) => p.id !== id);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
      setPayments((prev) => prev.filter((p) => p.id !== id));
      return { ok: true };
    }

    try {
      await api.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: "Error al conectar con el servidor." };
    }
  }, []);

  const value = {
    payments,
    isLoading,
    isSaving,
    isSyncing,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
  };

  return (
    <PaymentsContext.Provider value={value}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error(
      "usePayments() debe usarse dentro de un <PaymentsProvider>. " +
        "Verifica que envolviste tu App.js con <PaymentsProvider>.",
    );
  }
  return context;
}

// Backward-compatibility alias (remove once all callers are updated)
export const usePagos = usePayments;
