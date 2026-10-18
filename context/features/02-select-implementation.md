## CONTEXTO

- El selector actual es el componente src/components/ClienteSelector.js: renderiza chips/píldoras horizontales con ScrollView + TouchableOpacity
- Se usa en src/screens/RegisterPayment.js con las props: clientes, seleccionado, onChange
- Los clientes vienen de src/config/constants.js → CLIENTES = ["Vicky", "Vilma", "Julia"]
- El proyecto usa NativeWind para estilos (post-migración)

---

## LO QUE DEBES HACER

1. **Elegir la librería correcta:**
   Usa @react-native-picker/picker (ya compatible con Expo).
   Si no está instalada, indica el comando exacto: npx expo install @react-native-picker/picker

2. **Reemplazar ClienteSelector.js:**
   - Mantén el mismo nombre de archivo y las mismas props (clientes, seleccionado, onChange) para que RegisterPayment.js no necesite cambios en su lógica
   - El componente debe verse como un campo de formulario consistente con el resto de la pantalla: borde, fondo, altura similar a los otros inputs
   - En Android: abre el picker nativo del sistema (diálogo inferior)
   - En iOS: envuelve el Picker en un Modal con botón "Listo", igual al patrón que ya usa DatePickerField.js en este proyecto
   - Muestra un ícono de persona (puedes usar MaterialIcons name="person" o un emoji 👤) a la izquierda del valor seleccionado
   - Muestra un chevron (›) a la derecha para indicar que es interactivo

3. **No crear un componente nuevo:** reemplaza el contenido de ClienteSelector.js en su lugar, no crees un archivo adicional

---

## LO QUE NO DEBES TOCAR

- src/screens/RegisterPayment.js — las props que pasa a ClienteSelector no cambian
- src/config/constants.js — CLIENTES y YAPE_CLIENT_MAP sin cambios
- Cualquier otro componente o pantalla
- Lógica de negocio, contexto, hooks y servicios

---

## CRITERIOS DE EVALUACIÓN

Cuando termines, verifica cada punto y reporta ✅ o ❌:

1. **API sin cambios:** ClienteSelector sigue aceptando exactamente las props { clientes, seleccionado, onChange } — verificar que RegisterPayment.js no necesitó ninguna modificación
2. **Sin ScrollView horizontal de chips:** grep "ScrollView" src/components/ClienteSelector.js no retorna resultados
3. **Picker instalado:** @react-native-picker/picker aparece en package.json bajo dependencies
4. **Comportamiento iOS:** el componente tiene una rama Platform.OS === 'ios' que envuelve el Picker en un Modal con botón "Listo"
5. **Comportamiento Android:** la rama Android renderiza el Picker directamente sin Modal
6. **Consistencia visual:** el campo tiene el mismo borderRadius, borderWidth y backgroundColor que los demás inputs de RegisterPayment (monto y fecha)
7. **Sin errores de Metro:** pnpm expo start arranca sin errores relacionados con el componente
