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

export const generarId = () =>
  `P_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const PaymentsContext = createContext(null);

export function PaymentsProvider({ children }) {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const isSyncing = useRef(false);
  const lastFetchTime = useRef(0);

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
          const { id: idLocal, isPending, ...pagoData } = pago;
          const idPermanente = idLocal.startsWith("offline_")
            ? generarId()
            : idLocal;

          await api.createPayment({ ...pagoData, id: idPermanente });
          console.log(
            `Pago ${idLocal} sincronizado con éxito como ${idPermanente}.`,
          );
        } catch (error) {
          console.error(
            `Error al sincronizar pago ${pago.id}, se mantendrá en la cola.`,
            error,
          );
          failedPayments.push(pago);
        }
      }

      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(failedPayments),
      );
      await fetchPagos();
    } catch (error) {
      console.error("Error durante el proceso de sincronización:", error);
    } finally {
      isSyncing.current = false;
      setSincronizando(false);
    }
  }, []);

  const fetchPagos = useCallback(
    async ({ force = false } = {}) => {
      const ahora = Date.now();
      const esFresco = ahora - lastFetchTime.current < 30_000;

      if (!force && esFresco && pagos.length > 0) {
        return;
      }

      setCargando(true);
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
        setPagos(combinedPagos);

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
        setPagos(combinedOffline);
      } finally {
        setCargando(false);
      }
    },
    [pagos.length],
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

      setPagos((prev) => [pagoTemporal, ...prev]);
      console.log(reason, pagoTemporal.id);
      return { ok: true, pago: pagoTemporal };
    } catch (error) {
      return { ok: false, message: "No se pudo guardar localmente." };
    } finally {
      setGuardando(false);
    }
  };

  const crearPago = useCallback(
    async (nuevoPago) => {
      setGuardando(true);
      try {
        const resultado = await saveOffline(
          nuevoPago,
          "Guardado local instantáneo. Sincronizando con el servidor...",
        );

        syncOfflinePayments();

        return resultado;
      } finally {
        setGuardando(false);
      }
    },
    [syncOfflinePayments],
  );

  const actualizarPago = useCallback(async (pagoActualizado) => {
    setGuardando(true);
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

  const value = {
    pagos,
    cargando,
    guardando,
    sincronizando,
    fetchPagos,
    crearPago,
    eliminarPago,
    actualizarPago,
  };

  return (
    <PaymentsContext.Provider value={value}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePagos() {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error(
      "usePagos() debe usarse dentro de un <PaymentsProvider>. " +
        "Verifica que envolviste tu App.js con <PaymentsProvider>.",
    );
  }
  return context;
}
