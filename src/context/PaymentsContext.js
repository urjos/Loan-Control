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

const OFFLINE_QUEUE_KEY = "offline_payments_queue";

const generarId = () =>
  `P_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const PaymentsContext = createContext(null);

export function PaymentsProvider({ children }) {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const isSyncing = useRef(false); // Único guard en toda la app — ya no hay condición de carrera entre pantallas.

  useEffect(() => {
    fetchPagos();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncOfflinePayments();
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // 🔧 FIX: el backend idempotente necesita un "id" real para
          // poder detectar duplicados. Antes lo descartábamos aquí
          // (`const { id, ...pagoData } = pago`), lo que dejaba el
          // campo "id" vacío en el Sheet. Ahora generamos un id
          // permanente y lo incluimos en el payload que se envía.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPagos = useCallback(async () => {
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
        // 🔧 FIX VELOCIDAD: antes, si había internet, esperábamos la
        // respuesta de Google Apps Script (1-3s típicos) antes de
        // mostrar el pago en pantalla. Ahora guardamos SIEMPRE primero
        // en local —igual de rápido que el flujo offline— y disparamos
        // la sincronización con el servidor en segundo plano.
        //
        // Ya no se necesita NetInfo.fetch() aquí: si hay conexión,
        // syncOfflinePayments() lo subirá en segundo plano en cuanto
        // termine de guardarse localmente. Si no hay conexión, se
        // queda en la cola y se sincroniza solo cuando vuelva el internet.
        const resultado = await saveOffline(
          nuevoPago,
          "Guardado local instantáneo. Sincronizando con el servidor...",
        );

        // Importante: NO usamos "await" aquí a propósito. La sync corre
        // en paralelo sin bloquear el regreso a la pantalla.
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

  // El valor que se compartirá con TODAS las pantallas que llamen usePagos()
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

// 3. El hook que las pantallas usan — misma firma que antes (usePagos()),
//    así que NO hay que cambiar nada en RegistrarPagoScreen ni HistorialScreen
//    excepto el import.
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
