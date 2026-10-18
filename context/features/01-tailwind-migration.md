Lee previamente el overview del projecto en context/project-overview.md

Tu tarea es migrar el sistema de estilos del proyecto de StyleSheet.create() + tema centralizado a NativeWind v4 con clases de Tailwind.

## LO QUE DEBES HACER

1. **Instalar y configurar NativeWind v4:**
   - Instalar nativewind y tailwindcss
   - Crear tailwind.config.js apuntando a todos los archivos en src/
   - Actualizar babel.config.js con el preset de NativeWind
   - Agregar la directiva /// <reference types="nativewind/types" /> donde corresponda

2. **Migrar los tokens de theme.js a tailwind.config.js:**
   - Mapear colors, spacing, radius y font del theme actual como custom tokens en la sección theme.extend de Tailwind
   - Nombrar los tokens de forma que sean legibles: bg-primary, text-muted, rounded-card, etc.
   - Preservar todos los valores hexadecimales exactos del theme.js actual

3. **Migrar cada componente y pantalla:**
   - Reemplazar todos los StyleSheet.create() por className con clases de Tailwind
   - Reemplazar style={[estilos.x, estilos.y]} por className combinado
   - Reemplazar style={{ color: themeColors.primary }} (estilos inline dinámicos simples) por clases de Tailwind
   - Mantener el dark mode usando el prefijo dark: de Tailwind donde el valor cambia entre esquemas

4. **Migrar el dark mode:**
   - Configurar darkMode: 'media' en tailwind.config.js para que respete useColorScheme() del sistema
   - Reemplazar los bloques condicionales themeColors.X por pares light/dark en className: por ejemplo bg-white dark:bg-slate-900

---

## LO QUE NO DEBES TOCAR

- **Lógica de negocio:** src/hooks/useYapeListener.js, src/hooks/usePagos.js, src/context/PaymentsContext.js — no modificar ninguna función, solo eliminar los StyleSheet al final si los tuvieran
- **Servicios y configuración:** src/services/api.js, src/config/constants.js, app.config.js, eas.json, index.js — sin cambios
- **Backend:** Code.gs (Google Apps Script) — no pertenece al proyecto React Native
- **Nombres de archivos y estructura de carpetas** — no renombrar ni mover nada
- **Props y lógica de componentes** — solo cambia cómo se aplican los estilos, no el comportamiento
- **Animaciones o estilos que requieran valores dinámicos calculados en runtime** (por ejemplo, posiciones absolutas calculadas con Dimensions.get) — mantenlos como style={{ }} inline

---

## ORDEN DE MIGRACIÓN

Hazlo en este orden para poder verificar en cada paso:

1. Configuración (NativeWind + tailwind.config.js)
2. src/styles/theme.js → tailwind.config.js
3. Componentes atómicos: ClienteSelector → DatePickerField → TarjetaPago → PaymentCard
4. Pantallas: RegisterPayment → Historial → EditPayment → DishwashingCalendar

---

## CRITERIOS DE EVALUACIÓN (ejecuta esto al final)

Cuando termines la migración, verifica estos puntos y reporta el resultado de cada uno como ✅ o ❌:

1. **Sin StyleSheet.create():** grep -r "StyleSheet.create" src/ no debe retornar ningún resultado
2. **Sin useAppTheme() en componentes UI:** grep -r "useAppTheme" src/components src/screens debe retornar solo DishwashingCalendar.js (el calendario lo usa para el theme de react-native-calendars, que no acepta clases de Tailwind)
3. **Sin estilos inline de colores:** grep -r "color: themeColors" src/ no debe retornar resultados
4. **tailwind.config.js tiene los tokens:** verificar que colors.primary, colors.surface, colors.text, colors.textMuted, colors.border estén definidos en theme.extend.colors
5. **Dark mode configurado:** tailwind.config.js tiene darkMode: 'media' y existe al menos un className con prefijo dark: en Historial.js y RegisterPayment.js
6. **App compila sin errores:** pnpm expo start no lanza errores de Metro al arrancar
7. **Nada roto en lógica:** los archivos en src/context/, src/hooks/ y src/services/ no fueron modificados (verificar con git diff --name-only)

Si algún criterio falla, corrígelo antes de reportar el resultado final.
