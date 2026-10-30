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
import { usePayments } from "../context/PaymentsContext";
import { CLIENTS, CURRENCY } from "../config/constants";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function Historial({ navigation }) {
  const { payments, isLoading, isSyncing, fetchPayments, deletePayment } =
    usePayments();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [filter, setFilter] = useState("Todos");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("monto");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [mostrarMetodosBox, setMostrarMetodosBox] = useState(false);
  const [fechaBusqueda, setFechaBusqueda] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [fetchPayments]),
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPayments({ force: true });
    setIsRefreshing(false);
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

  const pagosFiltrados = payments
    .filter((p) => filter === "Todos" || p.cliente === filter)
    .filter((p) => {
      if (searchType === "monto" && searchQuery.trim()) {
        return String(p.monto).includes(searchQuery.trim());
      }
      if (searchType === "metodo" && selectedMethod) {
        return p.metodo === selectedMethod;
      }
      return true;
    })
    .filter((p) => {
      if (!fechaBusqueda) return true;
      return p.fecha === fechaBusqueda;
    })
    .sort((a, b) => {
      if (a.fecha > b.fecha) return sortOrder === "asc" ? 1 : -1;
      if (a.fecha < b.fecha) return sortOrder === "asc" ? -1 : 1;

      const timeA = parseInt(String(a.id).replace("P_", "")) || 0;
      const timeB = parseInt(String(b.id).replace("P_", "")) || 0;
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

  const datosAgrupados = agruparPagosPorFecha(pagosFiltrados);

  const totalFiltrado = pagosFiltrados.reduce(
    (s, p) => s + parseFloat(p.monto || 0),
    0,
  );
  const totalGlobal = payments.reduce(
    (s, p) => s + parseFloat(p.monto || 0),
    0,
  );

  const contarPorCliente = (nombre) =>
    payments.filter((p) => p.cliente === nombre).length;

  // ── Handlers ──────────────────────────────────────────────────

  const handleEditar = (pago) => {
    navigation.navigate("EditarPago", { pago });
  };

  const handleDelete = async (id) => {
    const result = await deletePayment(id);
    if (!result.ok) {
      Alert.alert(
        "Error al Eliminar",
        result.message || "No se pudo eliminar. Verifica tu conexión.",
      );
    }
  };

  const toggleOrden = () =>
    setSortOrder((o) => (o === "desc" ? "asc" : "desc"));

  const renderItem = ({ item }) => {
    if (typeof item === "string") {
      return (
        <View className="self-center mt-2 mb-2 rounded-sm">
          <Text className="text-sm font-bold text-textMuted dark:text-dark-textMuted">
            {item}
          </Text>
        </View>
      );
    }

    const isPending = item.isPending || String(item.id).startsWith("offline_");

    return (
      <PaymentCard
        payment={item}
        onEdit={handleEditar}
        onDelete={handleDelete}
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
    <SafeAreaView
      className="flex-1 px-4 bg-background dark:bg-dark-background"
      edges={["top"]}
    >
      {/* ── Encabezado ── */}
      <View className="flex-row justify-between items-center py-8">
        <View className="flex-1 gap-1">
          <Text className="text-4xl font-extrabold text-text dark:text-dark-text">
            Historial
          </Text>
          <Text className="text-sm text-textMuted dark:text-dark-textMuted">
            {payments.length}{" "}
            {payments.length === 1 ? "pago registrado" : "pagos registrados"}
          </Text>
        </View>
        {isSyncing && (
          <View className="flex-row gap-2 items-center px-4">
            <ActivityIndicator color="#2563EB" size="small" />
            <Text className="text-xs font-bold text-textMuted dark:text-dark-textMuted">
              Sincronizando...
            </Text>
          </View>
        )}
      </View>

      <View className="gap-4 mb-4">
        {/* ── Tarjeta de totales ── */}
        <View className="flex-row items-center p-4 rounded-lg shadow-md bg-primary dark:bg-dark-primary">
          <View className="flex-1">
            <Text className="mb-1 text-xs font-bold text-blue-200">
              {filter === "Todos" ? "Total cobrado" : `Total de ${filter}`}
            </Text>
            <Text className="text-white text-[26px] font-extrabold">
              {CURRENCY}{" "}
              {totalFiltrado.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </Text>
          </View>

          {filter !== "Todos" && (
            <>
              <View className="w-[1px] h-11 bg-white/30 mx-4" />
              <View className="flex-1">
                <Text className="mb-1 text-xs font-bold text-blue-200">
                  Total global
                </Text>
                <Text className="text-blue-300 text-[26px] font-extrabold">
                  {CURRENCY}{" "}
                  {totalGlobal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── Controles de Búsqueda, Calendario y Orden ── */}
        <View className="flex-row gap-2 items-center">
          {/* BUSCADOR (Monto / Método) */}
          <View className="flex-1 flex-row items-center bg-surface dark:bg-dark-surface px-2 h-12 rounded-md border-[1.5px] border-border dark:border-dark-border">
            <TouchableOpacity
              onPress={() => {
                setSearchType((t) => (t === "monto" ? "metodo" : "monto"));
                setSearchQuery("");
                setSelectedMethod("");
              }}
              className="p-1 mr-1"
            >
              <MaterialIcons
                name={searchType === "monto" ? "attach-money" : "credit-card"}
                size={20}
                color="#2563EB"
              />
            </TouchableOpacity>

            {searchType === "monto" ? (
              <TextInput
                className="flex-1 justify-center h-full text-md text-text dark:text-dark-text"
                placeholder="Buscar monto..."
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={searchQuery}
                onChangeText={(t) => setSearchQuery(t.replace(/[^0-9.]/g, ""))}
              />
            ) : (
              <TouchableOpacity
                className="flex-1 justify-center h-full text-md text-text dark:text-dark-text"
                onPress={() => setMostrarMetodosBox(true)}
              >
                <Text
                  className={`text-md ${
                    selectedMethod
                      ? "text-text dark:text-dark-text"
                      : "text-[#94A3B8]"
                  }`}
                >
                  {selectedMethod || "Elegir método..."}
                </Text>
              </TouchableOpacity>
            )}

            {(searchQuery !== "" || selectedMethod !== "") && (
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
            className={`size-12 justify-center items-center rounded-md border-[1.5px] ${
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
            className="size-12 justify-center items-center bg-surface dark:bg-dark-surface rounded-md border-[1.5px] border-border dark:border-dark-border"
            onPress={toggleOrden}
          >
            <AntDesign
              name={sortOrder === "desc" ? "arrow-down" : "arrow-up"}
              size={20}
              color={isDark ? "#94A3B8" : "#64748B"}
            />
          </TouchableOpacity>
        </View>

        {/* FILTRO ACTIVO FECHA (Debajo del buscador) */}
        {fechaBusqueda !== "" && (
          <View className="flex-row justify-center items-center py-2 mb-4 rounded-sm bg-primaryLight dark:bg-dark-primary border-primaryBorder dark:border-dark-primaryBorder">
            <Text className="mr-2 font-bold text-md text-text dark:text-dark-text">
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
        <View className="flex-row items-center">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={["Todos", ...CLIENTS]}
            keyExtractor={(item) => item}
            contentContainerClassName="gap-2 flex-row"
            renderItem={({ item }) => {
              const activo = filter === item;
              const count =
                item === "Todos" ? payments.length : contarPorCliente(item);
              return (
                <TouchableOpacity
                  className={`px-4 py-1.5 rounded-sm border-[1.5px] ${
                    activo
                      ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
                      : "bg-divider dark:bg-dark-divider border-border dark:border-dark-border"
                  }`}
                  onPress={() => setFilter(item)}
                >
                  <Text
                    className={`text-[13px] font-bold ${
                      activo
                        ? "text-white"
                        : "text-textMuted dark:text-dark-textMuted"
                    }`}
                  >
                    {item} ({count})
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* ── Lista de pagos ── */}
      {isLoading && !isRefreshing ? (
        <View className="flex-1 gap-2 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={datosParaFlatList}
          keyExtractor={(item, i) =>
            typeof item === "string" ? `header-${item}` : String(item.id ?? i)
          }
          contentContainerClassName="pb-8"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center px-8 pt-12">
              <Text className="text-[17px] font-bold text-text dark:text-dark-text text-center">
                Sin pagos registrados
              </Text>
              <Text className="text-[13px] text-textLight dark:text-dark-textLight text-center mt-1">
                {filter !== "Todos"
                  ? `${filter} no tiene pagos aún.`
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
          onValueChange={(event, selectedDate) => {
            setMostrarCalendario(false);
            if (selectedDate) {
              setFechaBusqueda(toLocalISOString(selectedDate));
            }
          }}
          onDismiss={() => {
            setMostrarCalendario(false);
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
          <View className="absolute bottom-0 pb-8 w-full rounded-t-lg shadow-lg bg-surface dark:bg-dark-surface">
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-border dark:border-dark-border">
              <TouchableOpacity
                onPress={() => {
                  setFechaBusqueda("");
                  setMostrarCalendario(false);
                }}
              >
                <Text className="text-base text-danger dark:text-dark-danger">
                  Limpiar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMostrarCalendario(false)}>
                <Text className="text-base font-bold text-primary dark:text-dark-primary">
                  Cerrar
                </Text>
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
              onValueChange={(event, selectedDate) => {
                if (selectedDate) {
                  setFechaBusqueda(toLocalISOString(selectedDate));
                }
              }}
              onDismiss={() => {
                setMostrarCalendario(false);
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
            <Text className="py-4 text-base font-bold text-center text-white bg-primary dark:bg-dark-primary">
              Método de pago
            </Text>
            {["Efectivo", "Yape", "Otro"].map((m) => (
              <TouchableOpacity
                key={m}
                className="py-4 border-t border-border dark:border-dark-border"
                onPress={() => {
                  setSelectedMethod(m);
                  setMostrarMetodosBox(false);
                }}
              >
                <Text className="text-[15px] text-text dark:text-dark-text text-center">
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
