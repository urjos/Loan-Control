// ================================================================
// 📋  src/screens/HistorialScreen.js
// Pantalla 2: Listado global de pagos con:
//   · Totales por filtro
//   · Filtro por cliente
//   · Ordenamiento por fecha (↑↓)
//   · Pull-to-refresh
//   · Editar / Eliminar desde cada tarjeta
// ================================================================

import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import TarjetaPago from '../components/TarjetaPago';
import { usePagos } from '../hooks/usePagos';
import { CLIENTES, MONEDA } from '../config/constants';
import { colors, spacing, radius, font, shadow } from '../styles/theme';

const OPCIONES_ORDEN = [
  { key: 'desc', label: '↓ Más recientes' },
  { key: 'asc',  label: '↑ Más antiguos'  },
];

export default function HistorialScreen({ navigation }) {
  const { pagos, cargando, guardando, fetchPagos, eliminarPago } = usePagos();

  const [filtro,   setFiltro]   = useState('Todos');
  const [orden,    setOrden]    = useState('desc'); // 'asc' | 'desc'
  const [actualizando, setActualizando] = useState(false);

  // Recarga al enfocar la pantalla (ej: al volver de Editar)
  useFocusEffect(
    useCallback(() => {
      fetchPagos();
    }, [fetchPagos])
  );

  // Pull-to-refresh
  const onRefresh = async () => {
    setActualizando(true);
    await fetchPagos();
    setActualizando(false);
  };

  // ── Lógica de filtro y orden ──────────────────────────────────

  const pagosFiltrados = pagos
    .filter(p => filtro === 'Todos' || p.cliente === filtro)
    .sort((a, b) => {
      const diff = new Date(a.fecha) - new Date(b.fecha);
      return orden === 'asc' ? diff : -diff;
    });

  const totalFiltrado = pagosFiltrados.reduce(
    (s, p) => s + parseFloat(p.monto || 0), 0
  );
  const totalGlobal = pagos.reduce(
    (s, p) => s + parseFloat(p.monto || 0), 0
  );

  const contarPorCliente = (nombre) =>
    pagos.filter(p => p.cliente === nombre).length;

  // ── Handlers ──────────────────────────────────────────────────

  const handleEditar = (pago) => {
    navigation.navigate('EditarPago', { pago });
  };

  const handleEliminar = async (id) => {
    const result = await eliminarPago(id);
    if (!result.ok) {
      Alert.alert('❌ Error', result.message || 'No se pudo eliminar el pago.');
    }
  };

  const toggleOrden = () =>
    setOrden(o => (o === 'desc' ? 'asc' : 'desc'));

  // ── Render ────────────────────────────────────────────────────

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top']}>

      {/* ── Encabezado ── */}
      <View style={estilos.encabezado}>
        <Text style={estilos.emoji}>📋</Text>
        <Text style={estilos.titulo}>Historial</Text>
        <Text style={estilos.subtitulo}>
          {pagos.length} {pagos.length === 1 ? 'pago registrado' : 'pagos registrados'}
        </Text>
      </View>

      {/* ── Tarjeta de totales ── */}
      <View style={estilos.tarjetaTotales}>
        <View style={estilos.totalItem}>
          <Text style={estilos.totalLabel}>
            {filtro === 'Todos' ? 'Total cobrado' : `Total de ${filtro}`}
          </Text>
          <Text style={estilos.totalMonto}>
            {MONEDA} {totalFiltrado.toFixed(2)}
          </Text>
        </View>
        {filtro !== 'Todos' && (
          <>
            <View style={estilos.separadorVertical} />
            <View style={estilos.totalItem}>
              <Text style={estilos.totalLabel}>Total global</Text>
              <Text style={[estilos.totalMonto, { color: '#93C5FD' }]}>
                {MONEDA} {totalGlobal.toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ── Barra de filtro por cliente ── */}
      <View style={estilos.barraFiltro}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['Todos', ...CLIENTES]}
          keyExtractor={item => item}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
          renderItem={({ item }) => {
            const activo = filtro === item;
            const count  = item === 'Todos' ? pagos.length : contarPorCliente(item);
            return (
              <TouchableOpacity
                style={[estilos.chip, activo && estilos.chipActivo]}
                onPress={() => setFiltro(item)}
              >
                <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                  {item} ({count})
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* ── Botón de orden ── */}
        <TouchableOpacity style={estilos.botonOrden} onPress={toggleOrden}>
          <Text style={estilos.textoOrden}>
            {orden === 'desc' ? '↓ Recientes' : '↑ Antiguos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Lista de pagos ── */}
      {cargando && !actualizando ? (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={estilos.textoCargando}>Cargando pagos...</Text>
        </View>
      ) : (
        <FlatList
          data={pagosFiltrados}
          keyExtractor={(item, i) => String(item.id ?? i)}
          contentContainerStyle={estilos.lista}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TarjetaPago
              pago={item}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
            />
          )}
          ListEmptyComponent={
            <View style={estilos.vacio}>
              <Text style={estilos.vacioEmoji}>📭</Text>
              <Text style={estilos.vacioTexto}>Sin pagos registrados</Text>
              <Text style={estilos.vacioSubtexto}>
                {filtro !== 'Todos'
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
    flex:            1,
    backgroundColor: colors.background,
  },
  encabezado: {
    alignItems:        'center',
    paddingTop:        spacing.lg,
    paddingBottom:     spacing.sm,
    paddingHorizontal: spacing.md,
  },
  emoji: {
    fontSize:     40,
    marginBottom: spacing.xs,
  },
  titulo: {
    fontSize:      26,
    fontWeight:    font.black,
    color:         colors.text,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize:  13,
    color:     colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Totales ──
  tarjetaTotales: {
    backgroundColor:  colors.primary,
    marginHorizontal: spacing.md,
    marginBottom:     spacing.md,
    borderRadius:     radius.lg,
    padding:          spacing.md,
    flexDirection:    'row',
    alignItems:       'center',
    ...shadow.primary,
  },
  totalItem: {
    flex: 1,
  },
  totalLabel: {
    color:        '#BFDBFE',
    fontSize:     12,
    fontWeight:   font.bold,
    marginBottom: spacing.xs,
  },
  totalMonto: {
    color:      '#FFFFFF',
    fontSize:   26,
    fontWeight: font.black,
  },
  separadorVertical: {
    width:            1,
    height:           44,
    backgroundColor:  'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
  },

  // ── Filtros ──
  barraFiltro: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm - 1,
    borderRadius:      radius.full,
    backgroundColor:   colors.divider,
    borderWidth:       1.5,
    borderColor:       colors.border,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor:     colors.primary,
  },
  chipTexto: {
    fontSize:   13,
    fontWeight: font.bold,
    color:      colors.textMuted,
  },
  chipTextoActivo: {
    color: '#FFF',
  },

  botonOrden: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical:   spacing.sm - 1,
    marginRight:       spacing.md,
    borderRadius:      radius.sm,
    backgroundColor:   colors.surface,
    borderWidth:       1.5,
    borderColor:       colors.primaryBorder,
  },
  textoOrden: {
    fontSize:   12,
    fontWeight: font.bold,
    color:      colors.primary,
  },

  // ── Lista ──
  lista: {
    paddingHorizontal: spacing.md,
    paddingBottom:     spacing.xl,
  },
  centrado: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    gap:            spacing.sm,
  },
  textoCargando: {
    color:    colors.textMuted,
    fontSize: 15,
  },
  vacio: {
    alignItems:        'center',
    paddingTop:        spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  vacioEmoji: {
    fontSize:     48,
    marginBottom: spacing.sm,
  },
  vacioTexto: {
    fontSize:   17,
    fontWeight: font.bold,
    color:      colors.text,
    textAlign:  'center',
  },
  vacioSubtexto: {
    fontSize:  13,
    color:     colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
