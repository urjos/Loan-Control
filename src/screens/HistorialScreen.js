import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useCallback, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import TarjetaPago from "../components/TarjetaPago";
import { usePagos } from "../hooks/usePagos";
import { CLIENTES, MONEDA } from "../config/constants";
import { colors, spacing, radius, font, shadow } from "../styles/theme";

const OPCIONES_ORDEN = [
  { key: "desc", label: "↓ Más recientes" },
  { key: "asc", label: "↑ Más antiguos" },
];

export default function HistorialScreen({ navigation }) {
  const { pagos, cargando, guardando, fetchPagos, eliminarPago } = usePagos();

  const [filtro, setFiltro] = useState("Todos");
  const [orden, setOrden] = useState("asc"); // 'asc' | 'desc'
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
      <TarjetaPago
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
        <Text style={estilos.titulo}>Historial</Text>
        <Text style={estilos.subtitulo}>
          {pagos.length}{" "}
          {pagos.length === 1 ? "pago registrado" : "pagos registrados"}
        </Text>
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
      {/* ── Botón de orden ── */}
      <TouchableOpacity style={estilos.botonOrden} onPress={toggleOrden}>
        <Text style={estilos.textoOrden}>
          {orden === "desc" ? "↓ Recientes" : "↑ Antiguos"}
        </Text>
      </TouchableOpacity>
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
          <ActivityIndicator size="large" color={colors.primary} />
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
              colors={[colors.primary]}
              tintColor={colors.primary}
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
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
  },
  encabezado: {
    alignItems: "flex-start",
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

  botonOrden: {
    alignSelf: "flex-end",
    width: 90,

    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,

    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 1,

    borderRadius: radius.sm,

    backgroundColor: colors.surface,

    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
  },
  textoOrden: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: font.bold,
    color: colors.primary,
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
});
