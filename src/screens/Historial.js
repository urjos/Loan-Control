import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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

import ModalAlert from "../components/ModalAlert";
import PaymentCard from "../components/PaymentCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import { usePagos } from "../hooks/usePayments";
import { CLIENTES, MONEDA } from "../config/constants";
import { spacing, radius, font, shadow, useAppTheme } from "../styles/theme";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function Historial({ navigation }) {
  const { pagos, cargando, guardando, fetchPagos, eliminarPago } = usePagos();

  const themeColors = useAppTheme();
  const estilos = useMemo(() => crearEstilos(themeColors), [themeColors]);
  const scheme = useColorScheme();

  const [filtro, setFiltro] = useState("Todos");
  const [orden, setOrden] = useState("desc"); // 'asc' | 'desc'
  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("monto"); // 'monto' | 'metodo'
  const [metodoSeleccionado, setMetodoSeleccionado] = useState("");
  const [mostrarMetodosBox, setMostrarMetodosBox] = useState(false);
  const [fechaBusqueda, setFechaBusqueda] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ exito: true, mensaje: "" });

  useFocusEffect(
    useCallback(() => {
      fetchPagos();
    }, [fetchPagos]),
  );

  const onRefresh = async () => {
    setActualizando(true);
    await fetchPagos();
    setActualizando(false);
  };

  const limpiar = () => {};

  const obtenerNombreFecha = (fechaString) => {
    if (!fechaString) return "Fecha desconocida";

    // Convertir 'YYYY-MM-DD' de la base de datos a un objeto Date local
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

    if (result.ok) {
      setModalData({
        exito: true,
        mensaje: `Pago eliminado correctamente.`,
      });
      setModalVisible(true);
      limpiar();
    } else {
      setModalData({
        exito: false,
        mensaje: result.message || "No se pudo eliminar. Verifica tu internet.",
      });
      setModalVisible(true);
    }
  };

  const toggleOrden = () => setOrden((o) => (o === "desc" ? "asc" : "desc"));

  const renderItem = ({ item }) => {
    // Si el item es un string, es un encabezado de fecha
    if (typeof item === "string") {
      return (
        <View style={estilos.contenedorFecha}>
          <Text style={estilos.textoFecha}>{item}</Text>
        </View>
      );
    }

    return (
      <PaymentCard
        pago={item}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
    );
  };

  const datosParaFlatList = [];
  datosAgrupados.forEach((grupo) => {
    datosParaFlatList.push(grupo.titulo); // Añade el string ("Hoy", "Ayer", etc)
    grupo.data.forEach((pago) => datosParaFlatList.push(pago)); // Añade los objetos pago
  });

  return (
    <SafeAreaView style={estilos.contenedor} edges={["top"]}>
      {/* ── Encabezado ── */}
      <View style={estilos.encabezado}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>Historial</Text>
          <Text style={estilos.subtitulo}>
            {pagos.length}{" "}
            {pagos.length === 1 ? "pago registrado" : "pagos registrados"}
          </Text>
        </View>
      </View>

      {/* ── Tarjeta de totales ── */}

      <View style={estilos.tarjetaTotales}>
        <View style={estilos.totalItem}>
          <Text style={estilos.totalLabel}>
            {filtro === "Todos" ? "Total cobrado" : `Total de ${filtro}`}
          </Text>
          <Text style={estilos.totalMonto}>
            {MONEDA} {totalFiltrado.toFixed(2)}
          </Text>
        </View>

        {filtro !== "Todos" && (
          <>
            <View style={estilos.separadorVertical} />
            <View style={estilos.totalItem}>
              <Text style={estilos.totalLabel}>Total global</Text>
              <Text style={[estilos.totalMonto, { color: "#93C5FD" }]}>
                {MONEDA} {totalGlobal.toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ── Controles de Búsqueda, Calendario y Orden ── */}
      <View style={estilos.controlesFila}>
        {/* BUSCADOR (Monto / Método) */}
        <View style={estilos.busquedaContenedor}>
          <TouchableOpacity
            onPress={() => {
              setTipoBusqueda((t) => (t === "monto" ? "metodo" : "monto"));
              setBusqueda("");
              setMetodoSeleccionado("");
            }}
            style={estilos.btnTipo}
          >
            <MaterialIcons
              name={tipoBusqueda === "monto" ? "attach-money" : "credit-card"}
              size={20}
              color={themeColors.primary}
            />
          </TouchableOpacity>

          {tipoBusqueda === "monto" ? (
            <TextInput
              style={estilos.busquedaInput}
              placeholder="Buscar monto..."
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={busqueda}
              onChangeText={(t) => setBusqueda(t.replace(/[^0-9.]/g, ""))} // Solo acepta números
            />
          ) : (
            <TouchableOpacity
              style={estilos.busquedaInput}
              onPress={() => setMostrarMetodosBox(true)}
            >
              <Text
                style={{
                  color: metodoSeleccionado ? themeColors.text : "#94A3B8",
                  fontSize: 13,
                }}
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
          style={[
            estilos.botonIcono,
            fechaBusqueda ? estilos.botonIconoActivo : null,
          ]}
          onPress={() => setMostrarCalendario(true)}
        >
          <MaterialIcons
            name="calendar-month"
            size={22}
            color={fechaBusqueda ? "#FFF" : themeColors.textMuted}
          />
        </TouchableOpacity>

        {/* ORDEN */}
        <TouchableOpacity style={estilos.botonIcono} onPress={toggleOrden}>
          <AntDesign
            name={orden === "desc" ? "arrow-down" : "arrow-up"}
            size={20}
            color={themeColors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* FILTRO ACTIVO FECHA (Debajo del buscador) */}
      {fechaBusqueda !== "" && (
        <View style={estilos.filtroFechaFila}>
          <Text style={estilos.filtroFechaTexto}>
            Fecha: {fechaBusqueda.split("-").reverse().join("/")}
          </Text>
          <TouchableOpacity
            onPress={() => setFechaBusqueda("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={16} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Barra de filtro por cliente ── */}
      <View style={estilos.barraFiltro}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["Todos", ...CLIENTES]}
          keyExtractor={(item) => item}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
          }}
          renderItem={({ item }) => {
            const activo = filtro === item;
            const count =
              item === "Todos" ? pagos.length : contarPorCliente(item);
            return (
              <TouchableOpacity
                style={[estilos.chip, activo && estilos.chipActivo]}
                onPress={() => setFiltro(item)}
              >
                <Text
                  style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}
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
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={datosParaFlatList}
          keyExtractor={(item, i) =>
            typeof item === "string" ? `header-${item}` : String(item.id ?? i)
          }
          contentContainerStyle={estilos.lista}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={onRefresh}
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={estilos.vacio}>
              <Text style={estilos.vacioTexto}>Sin pagos registrados</Text>
              <Text style={estilos.vacioSubtexto}>
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
          themeVariant={scheme || "light"}
        />
      )}

      {mostrarCalendario && Platform.OS === "ios" && (
        <Modal transparent visible={true} animationType="fade">
          <TouchableOpacity
            style={estilos.overlay}
            activeOpacity={1}
            onPress={() => setMostrarCalendario(false)}
          />
          <View style={estilos.modalIOS}>
            <View style={estilos.modalHeaderIOS}>
              <TouchableOpacity
                onPress={() => {
                  setFechaBusqueda("");
                  setMostrarCalendario(false);
                }}
              >
                <Text style={estilos.textoLimpiarIOS}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMostrarCalendario(false)}>
                <Text style={estilos.textoListoIOS}>Cerrar</Text>
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
              accentColor={themeColors.primary}
              themeVariant={scheme || "light"}
            />
          </View>
        </Modal>
      )}

      {/* ── Box de Métodos de Pago ── */}
      {mostrarMetodosBox && (
        <Modal transparent visible={true} animationType="fade">
          <TouchableOpacity
            style={estilos.overlay}
            activeOpacity={1}
            onPress={() => setMostrarMetodosBox(false)}
          />
          <View style={estilos.boxMetodos}>
            <Text style={estilos.boxMetodosTitulo}>Método de pago</Text>
            {["Efectivo", "Yape", "Otro"].map((m) => (
              <TouchableOpacity
                key={m}
                style={estilos.boxMetodoItem}
                onPress={() => {
                  setMetodoSeleccionado(m);
                  setMostrarMetodosBox(false);
                }}
              >
                <Text style={estilos.boxMetodoTexto}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}

      {/* ── Modal de Confirmación Historial ── */}
      <ModalAlert
        visible={modalVisible}
        icono={
          modalData.exito ? (
            <MaterialIcons
              name="check-circle"
              size={48}
              color={themeColors.success}
            />
          ) : (
            <MaterialIcons name="error" size={48} color={themeColors.danger} />
          )
        }
        titulo={modalData.exito ? "¡Listo!" : "Error"}
        mensaje={modalData.mensaje}
        botones={[
          {
            texto: "Aceptar",
            onPress: () => setModalVisible(false),
            estilo: { backgroundColor: themeColors.primary },
            estiloTexto: { color: "#FFF" },
          },
        ]}
      />
    </SafeAreaView>
  );
}

const crearEstilos = (colors) =>
  StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colors.background,
    },
    encabezado: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    emoji: {
      fontSize: 40,
      marginBottom: spacing.xs,
    },
    titulo: {
      fontSize: 30,
      fontWeight: font.black,
      color: colors.text,
      letterSpacing: -0.5,
      paddingVertical: spacing.sm,
    },
    subtitulo: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },

    // ── Totales ──
    tarjetaTotales: {
      backgroundColor: colors.primary,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      ...shadow.primary,
    },
    totalItem: {
      flex: 1,
    },
    totalLabel: {
      color: "#BFDBFE",
      fontSize: 12,
      fontWeight: font.bold,
      marginBottom: spacing.xs,
    },
    totalMonto: {
      color: "#FFFFFF",
      fontSize: 26,
      fontWeight: font.black,
    },
    separadorVertical: {
      width: 1,
      height: 44,
      backgroundColor: "rgba(255,255,255,0.3)",
      marginHorizontal: spacing.md,
    },

    // ── Controles Fijos (Buscador, Calendario, Orden) ──
    controlesFila: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    busquedaContenedor: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      height: 44,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    btnTipo: {
      marginRight: spacing.xs,
      padding: spacing.xs,
      backgroundColor: colors.primaryLight,
      borderRadius: radius.sm,
    },
    busquedaInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      height: "100%",
      justifyContent: "center",
    },
    botonIcono: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    botonIconoActivo: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    botonOrden: {
      height: 44,
      paddingHorizontal: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.primaryBorder,
      minWidth: 65,
    },
    textoOrden: {
      fontSize: 15,
      fontWeight: font.bold,
      color: colors.primary,
    },
    filtroFechaFila: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryLight,
      paddingVertical: spacing.xs,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    filtroFechaTexto: {
      fontSize: 15,
      fontWeight: font.bold,
      color: colors.primary,
      marginRight: spacing.sm,
    },

    // ── Filtros ──
    barraFiltro: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 1,
      borderRadius: radius.full,
      backgroundColor: colors.divider,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    chipActivo: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipTexto: {
      fontSize: 13,
      fontWeight: font.bold,
      color: colors.textMuted,
    },
    chipTextoActivo: {
      color: "#FFF",
    },

    contenedorFecha: {
      alignSelf: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textoFecha: {
      fontSize: 12,
      fontWeight: font.bold,
      color: colors.textMuted,
    },

    // ── Lista ──
    lista: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    centrado: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.sm,
    },
    textoCargando: {
      color: colors.textMuted,
      fontSize: 15,
    },
    vacio: {
      alignItems: "center",
      paddingTop: spacing.xxl,
      paddingHorizontal: spacing.xl,
    },
    vacioEmoji: {
      fontSize: 48,
      marginBottom: spacing.sm,
    },
    vacioTexto: {
      fontSize: 17,
      fontWeight: font.bold,
      color: colors.text,
      textAlign: "center",
    },
    vacioSubtexto: {
      fontSize: 13,
      color: colors.textLight,
      textAlign: "center",
      marginTop: spacing.xs,
    },

    // ── Modal Calendario iOS ──
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    modalIOS: {
      backgroundColor: colors.surface,
      paddingBottom: spacing.xl,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      position: "absolute",
      bottom: 0,
      width: "100%",
    },
    modalHeaderIOS: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    textoLimpiarIOS: { color: colors.danger, fontSize: 16 },
    textoListoIOS: {
      color: colors.primary,
      fontWeight: font.bold,
      fontSize: 16,
    },

    // ── Box Métodos ──
    boxMetodos: {
      position: "absolute",
      top: "40%",
      alignSelf: "center",
      width: "70%",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingBottom: spacing.xs,
      ...shadow.md,
    },
    boxMetodosTitulo: {
      fontSize: 16,
      fontWeight: font.bold,
      color: "#FFFFFF",
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderTopLeftRadius: radius.md,
      borderTopRightRadius: radius.md,
      textAlign: "center",
    },
    boxMetodoItem: {
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    boxMetodoTexto: {
      fontSize: 15,
      color: colors.text,
      textAlign: "center",
    },
  });
