// ================================================================
// 👤  src/components/ClienteSelector.js
// Selector de cliente en forma de chips/píldoras tocables.
// ================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius, font } from '../styles/theme';

export default function ClienteSelector({ clientes, seleccionado, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.contenedor}
    >
      {clientes.map((nombre) => {
        const activo = seleccionado === nombre;
        return (
          <TouchableOpacity
            key={nombre}
            style={[estilos.chip, activo && estilos.chipActivo]}
            onPress={() => onChange(nombre)}
            activeOpacity={0.75}
          >
            <Text style={[estilos.texto, activo && estilos.textoActivo]}>
              {nombre}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    borderRadius:      radius.full,
    backgroundColor:   colors.divider,
    borderWidth:       1.5,
    borderColor:       colors.border,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor:     colors.primary,
  },
  texto: {
    fontSize:   14,
    fontWeight: font.bold,
    color:      colors.textMuted,
  },
  textoActivo: {
    color: '#FFFFFF',
  },
});
