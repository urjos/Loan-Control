import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  TextInput,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import PaymentCard from "../components/PaymentCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import { usePagos } from "../context/PaymentsContext";
import { CLIENTES, MONEDA } from "../config/constants";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function Historial({ navigation }) {
  const { pagos, cargando, sincronizando, fetchPagos, eliminarPago } =
    usePagos();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [filtro, setFiltro] = useState("Todos");
  const [orden, setOrden] = useState("desc");
  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("monto");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState("");
  const [mostrarMetodosBox, setMostrarMetodosBox] = useState(false);
  const [fechaBusqueda, setFechaBusqueda] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPagos();
    }, [fetchPagos]),
  );

  const onRefresh = async () => {
    setActualizando(true);
    await fetchPagos({ force: true });
    setActualizando(false);
  };

  const obtenerNombreFecha = (fechaString) => {
    if (!fechaString) return "Fecha desconocida";

    const [year, month, day] = fechaString.split("-");
    const fechaPago = new Date(year, month - 1, day);
    fechaPago.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fechaPago.getTime() === hoy.getTime()) return "Hoy";
    if (fechaPago.getTime() === ayer.getTime()) return "Ayer";

    return `${day}/${month}/${year}`;
  };

  const agruparPagosPorFecha = (listaPagos) => {
    const grupos = [];
    listaPagos.forEach((pago) => {
      const nombreFecha = obtenerNombreFecha(pago.fecha);
      const grupoExistente = grupos.find((g) => g.titulo === nombreFecha);

      if (grupoExistente) {
        grupoExistente.data.push(pago);
      } else {
        grupos.push({ titulo: nombreFecha, data: [pago] });
      }
    });
    return grupos;
  };

  const pagosFiltrados = pagos
    .filter((p) => filtro === "Todos" || p.cliente === filtro)
    .filter((p) => {
      if (tipoBusqueda === "monto" && busqueda.trim()) {
        return String(p.monto).includes(busqueda.trim());
      }
      if (tipoBusqueda === "metodo" && metodoSeleccionado) {
        return p.metodo === metodoSeleccionado;
      }
      return true;
    })
    .filter((p) => {
      if (!fechaBusqueda) return true;
      return p.fecha === fechaBusqueda;
    })
    .sort((a, b) => {
      if (a.fecha > b.fecha) return orden === "asc" ? 1 : -1;
      if (a.fecha < b.fecha) return orden === "asc" ? -1 : 1;

      const timeA = parseInt(String(a.id).replace("P_", "")) || 0;
      const timeB = parseInt(String(b.id).replace("P_", "")) || 0;
      return orden === "asc" ? timeA - timeB : timeB - timeA;
    });

  const datosAgrupados = agruparPagosPorFecha(pagosFiltrados);

  const totalFiltrado = pagosFiltrados.reduce(
    (s, p) => s + parseFloat(p.monto || 0),
    0,
  );
  const totalGlobal = pagos.reduce((s, p) => s + parseFloat(p.monto || 0), 0);

  const contarPorCliente = (nombre) =>
    pagos.filter((p) => p.cliente === nombre).length;

  // ── Handlers ──────────────────────────────────────────────────

  const handleEditar = (pago) => {
    navigation.navigate("EditarPago", { pago });
  };

  const handleEliminar = async (id) => {
    const result = await eliminarPago(id);
    if (!result.ok) {
      Alert.alert(
        "Error al Eliminar",
        result.message || "No se pudo eliminar. Verifica tu conexión.",
      );
    }
  };

  const toggleOrden = () => setOrden((o) => (o === "desc" ? "asc" : "desc"));

  const renderItem = ({ item }) => {
    if (typeof item === "string") {
      return (
        <View className="self-center bg-surface dark:bg-dark-surface px-4 py-1 rounded-sm mb-2 mt-4 border border-border dark:border-dark-border">
          <Text className="text-xs font-bold text-textMuted dark:text-dark-textMuted">
            {item}
          </Text>
        </View>
      );
    }

    const isPending = item.isPending || String(item.id).startsWith("offline_");

    return (
      <PaymentCard
        pago={item}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        isPending={isPending}
      />
    );
  };

  const datosParaFlatList = [];
  datosAgrupados.forEach((grupo) => {
    datosParaFlatList.push(grupo.titulo);
    grupo.data.forEach((pago) => datosParaFlatList.push(pago));
  });

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={["top"]}>
      {/* ── Encabezado ── */}
      <View className="flex-row items-center justify-between pt-6 pb-4 px-6">
        <View className="flex-1">
          <Text className="text-3xl font-extrabold text-text dark:text-dark-text tracking-tight py-2">
            Historial
          </Text>
          <Text className="text-[13px] text-textMuted dark:text-dark-textMuted mt-1">
            {pagos.length}{" "}
            {pagos.length === 1 ? "pago registrado" : "pagos registrados"}
          </Text>
        </View>
        {sincronizando && (
          <View className="flex-row items-center gap-2 px-4">
            <ActivityIndicator color="#2563EB" size="small" />
            <Text className="text-xs text-textMuted dark:text-dark-textMuted font-bold">
              Sincronizando...
            </Text>
          </View>
        )}
      </View>

      {/* ── Tarjeta de totales ── */}
      <View className="bg-primary dark:bg-dark-primary mx-4 mb-4 rounded-lg p-4 flex-row items-center shadow-md">
        <View className="flex-1">
          <Text className="text-blue-200 text-xs font-bold mb-1">
            {filtro === "Todos" ? "Total cobrado" : `Total de ${filtro}`}
          </Text>
          <Text className="text-white text-[26px] font-extrabold">
            {MONEDA}{" "}
            {totalFiltrado.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </Text>
        </View>

        {filtro !== "Todos" && (
          <>
            <View className="w-[1px] h-11 bg-white/30 mx-4" />
            <View className="flex-1">
              <Text className="text-blue-200 text-xs font-bold mb-1">Total global</Text>
              <Text className="text-blue-300 text-[26px] font-extrabold">
                {MONEDA}{" "}
                {totalGlobal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ── Controles de Búsqueda, Calendario y Orden ── */}
      <View className="flex-row items-center mx-4 mb-4 gap-2">
        {/* BUSCADOR (Monto / Método) */}
        <View className="flex-1 flex-row items-center bg-surface dark:bg-dark-surface px-2 h-11 rounded-md border-[1.5px] border-border dark:border-dark-border">
          <TouchableOpacity
            onPress={() => {
              setTipoBusqueda((t) => (t === "monto" ? "metodo" : "monto"));
              setBusqueda("");
              setMetodoSeleccionado("");
            }}
            className="mr-1 p-1 bg-primaryLight dark:bg-dark-primaryLight rounded-sm"
          >
            <MaterialIcons
              name={tipoBusqueda === "monto" ? "attach-money" : "credit-card"}
              size={20}
              color="#2563EB"
            />
          </TouchableOpacity>

          {tipoBusqueda === "monto" ? (
            <TextInput
              className="flex-1 text-sm text-text dark:text-dark-text h-full justify-center"
              placeholder="Buscar monto..."
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={busqueda}
              onChangeText={(t) => setBusqueda(t.replace(/[^0-9.]/g, ""))}
            />
          ) : (
            <TouchableOpacity
              className="flex-1 text-sm text-text dark:text-dark-text h-full justify-center"
              onPress={() => setMostrarMetodosBox(true)}
            >
              <Text
                className={`text-[13px] ${
                  metodoSeleccionado ? "text-text dark:text-dark-text" : "text-[#94A3B8]"
                }`}
              >
                {metodoSeleccionado || "Elegir método..."}
              </Text>
            </TouchableOpacity>
          )}

          {(busqueda !== "" || metodoSeleccionado !== "") && (
            <TouchableOpacity
              onPress={() => {
                setBusqueda("");
                setMetodoSeleccionado("");
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="cancel" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* CALENDARIO */}
        <TouchableOpacity
          className={`w-11 h-11 justify-center items-center rounded-md border-[1.5px] ${
            fechaBusqueda
              ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
              : "bg-surface dark:bg-dark-surface border-border dark:border-dark-border"
          }`}
          onPress={() => setMostrarCalendario(true)}
        >
          <MaterialIcons
            name="calendar-month"
            size={22}
            color={fechaBusqueda ? "#FFF" : isDark ? "#94A3B8" : "#64748B"}
          />
        </TouchableOpacity>

        {/* ORDEN */}
        <TouchableOpacity
          className="w-11 h-11 justify-center items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border"
          onPress={toggleOrden}
        >
          <AntDesign
            name={orden === "desc" ? "arrow-down" : "arrow-up"}
            size={20}
            color={isDark ? "#94A3B8" : "#64748B"}
          />
        </TouchableOpacity>
      </View>

      {/* FILTRO ACTIVO FECHA (Debajo del buscador) */}
      {fechaBusqueda !== "" && (
        <View className="flex-row items-center justify-center bg-primaryLight dark:bg-dark-primaryLight py-1 mx-4 mb-2 rounded-sm border border-primaryBorder dark:border-dark-primaryBorder">
          <Text className="text-[15px] font-bold text-primary dark:text-dark-primary mr-2">
            Fecha: {fechaBusqueda.split("-").reverse().join("/")}
          </Text>
          <TouchableOpacity
            onPress={() => setFechaBusqueda("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Barra de filtro por cliente ── */}
      <View className="flex-row items-center mb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["Todos", ...CLIENTES]}
          keyExtractor={(item) => item}
          contentContainerClassName="px-4 gap-2 flex-row"
          renderItem={({ item }) => {
            const activo = filtro === item;
            const count =
              item === "Todos" ? pagos.length : contarPorCliente(item);
            return (
              <TouchableOpacity
                className={`px-4 py-1.5 rounded-full border-[1.5px] ${
                  activo
                    ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
                    : "bg-divider dark:bg-dark-divider border-border dark:border-dark-border"
                }`}
                onPress={() => setFiltro(item)}
              >
                <Text
                  className={`text-[13px] font-bold ${
                    activo ? "text-white" : "text-textMuted dark:text-dark-textMuted"
                  }`}
                >
                  {item} ({count})
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── Lista de pagos ── */}
      {cargando && !actualizando ? (
        <View className="flex-1 justify-center items-center gap-2">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={datosParaFlatList}
          keyExtractor={(item, i) =>
            typeof item === "string" ? `header-${item}` : String(item.id ?? i)
          }
          contentContainerClassName="px-4 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center pt-12 px-8">
              <Text className="text-[17px] font-bold text-text dark:text-dark-text text-center">
                Sin pagos registrados
              </Text>
              <Text className="text-[13px] text-textLight dark:text-dark-textLight text-center mt-1">
                {filtro !== "Todos"
                  ? `${filtro} no tiene pagos aún.`
                  : 'Ve a "Registrar Pago" para agregar el primero.'}
              </Text>
            </View>
          }
        />
      )}

      {/* ── Selector de Fecha Nativo ── */}
      {mostrarCalendario && Platform.OS === "android" && (
        <DateTimePicker
          value={
            fechaBusqueda ? new Date(fechaBusqueda + "T12:00:00") : new Date()
          }
          mode="date"
          display="calendar"
          onChange={(event, selectedDate) => {
            setMostrarCalendario(false);
            if (event.type !== "dismissed" && selectedDate) {
              setFechaBusqueda(toLocalISOString(selectedDate));
            }
          }}
          themeVariant={isDark ? "dark" : "light"}
        />
      )}

      {mostrarCalendario && Platform.OS === "ios" && (
        <Modal transparent visible={true} animationType="fade">
          <TouchableOpacity
            className="flex-1 bg-black/30"
            activeOpacity={1}
            onPress={() => setMostrarCalendario(false)}
          />
          <View className="bg-surface dark:bg-dark-surface pb-8 rounded-t-lg absolute bottom-0 w-full shadow-lg">
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-border dark:border-dark-border">
              <TouchableOpacity
                onPress={() => {
                  setFechaBusqueda("");
                  setMostrarCalendario(false);
                }}
              >
                <Text className="text-danger dark:text-dark-danger text-base">Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMostrarCalendario(false)}>
                <Text className="text-primary dark:text-dark-primary font-bold text-base">Cerrar</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={
                fechaBusqueda
                  ? new Date(fechaBusqueda + "T12:00:00")
                  : new Date()
              }
              mode="date"
              display="inline"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setFechaBusqueda(toLocalISOString(selectedDate));
                }
              }}
              accentColor="#2563EB"
              themeVariant={isDark ? "dark" : "light"}
            />
          </View>
        </Modal>
      )}

      {/* ── Box de Métodos de Pago ── */}
      {mostrarMetodosBox && (
        <Modal transparent visible={true} animationType="fade">
          <TouchableOpacity
            className="flex-1 bg-black/30"
            activeOpacity={1}
            onPress={() => setMostrarMetodosBox(false)}
          />
          <View className="absolute top-[40%] self-center w-[70%] bg-surface dark:bg-dark-surface rounded-md pb-1 shadow-md overflow-hidden border border-border dark:border-dark-border">
            <Text className="text-base font-bold text-white bg-primary dark:bg-dark-primary py-4 text-center">
              Método de pago
            </Text>
            {["Efectivo", "Yape", "Otro"].map((m) => (
              <TouchableOpacity
                key={m}
                className="py-4 border-t border-border dark:border-dark-border"
                onPress={() => {
                  setMetodoSeleccionado(m);
                  setMostrarMetodosBox(false);
                }}
              >
                <Text className="text-[15px] text-text dark:text-dark-text text-center">{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
