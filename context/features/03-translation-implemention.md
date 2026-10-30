# Feature: 03 - Codebase English Refactoring (Code Only, Spanish UI Preserved)

## Contexto

- **Estado actual:** El código fuente contiene una mezcla de identificadores en español e inglés en componentes (`ClienteSelector.js`), constantes (`CLIENTES`, `MONEDA`), hooks y contexto (`usePagos`, `pagos`, `cargando`, `guardando`, `sincronizando`, `crearPago`, `actualizarPago`, `eliminarPago`), utilidades (`turnos.js`) y nombres de variables/estados en pantallas (`Historial.js`, `RegisterPayment.js`, `EditPayment.js`).
- **Dependencias involucradas:** No requiere nuevas dependencias. Se utiliza el stack existente (React Native, Expo, NativeWind, React Navigation, AsyncStorage, NetInfo).
- **Archivos de referencia:**
  - `src/components/ClienteSelector.js`
  - `src/components/ModalAlert.js`
  - `src/components/DatePickerField.js`
  - `src/components/PaymentCard.js`
  - `src/context/PaymentsContext.js`
  - `src/config/constants.js`
  - `src/utils/turnos.js`
  - `src/screens/RegisterPayment.js`, `src/screens/Historial.js`, `src/screens/EditPayment.js`, `src/screens/DishwashingCalendar.js`

---

## Lo que debes hacer

0. **Actualizar `context/progress-tracker.md`:**
   - Registrar esta feature en `## In Progress` y actualizar `## Current Goal`.

1. **Constantes (`src/config/constants.js`):**
   - Renombrar las constantes a inglés preservando sus valores de datos:
     - `CLIENTES` → `CLIENTS` (mantiene `["Vicky", "Vilma", "Julia"]`)
     - `MONEDA` → `CURRENCY` (mantiene `"S/"`)
     - `SCRIPT_URL` → se mantiene `SCRIPT_URL`

2. **Componentes en `src/components/`:**
   - Renombrar componente y archivo `src/components/ClienteSelector.js` → `src/components/ClientSelector.js`:
     - Props en inglés: `{ clients, selected, onChange }` (antes `{ clientes, seleccionado, onChange }`).
   - `src/components/ModalAlert.js`:
     - Props en inglés: `{ visible, icon, title, message, buttons }` (antes `{ visible, icono, titulo, mensaje, botones }`).
     - Propiedades de botones: `{ text, onPress, style, textStyle }` (antes `{ texto, onPress, estilo, estiloTexto }`).
   - `src/components/DatePickerField.js`:
     - Props en inglés: `{ label, value, onChange }` (ya están en inglés).
     - Funciones internas a inglés: `formatDate` (antes `formatear`), `toISODate` (antes `toISO`), `closeIOS` (antes `cerrarIOS`).
   - `src/components/PaymentCard.js`:
     - Props a inglés: `{ payment, onEdit, onDelete, isPending }` (antes `{ pago, onEditar, onEliminar, isPending }`).
     - Estados internos a inglés: `isDeleting` (antes `eliminando`), `isModalVisible` (antes `modalVisible`).
     - Helpers internos: `formatDate` (antes `formatearFecha`).

3. **Utilidades en `src/utils/`:**
   - Renombrar `src/utils/turnos.js` → `src/utils/shifts.js`:
     - Actualizar imports en `DishwashingCalendar.js`, `CalendarWidget.js`, `updateWidget.js`, `widgetTaskHandler.js`.
     - Mantener los valores internos de los datos de usuarios (`"Josué"`, `"David"`).

4. **Contexto & Hook (`src/context/PaymentsContext.js`):**
   - Renombrar el hook y exports a inglés:
     - `usePayments` (reemplaza `usePagos`, se puede dejar alias temporal `usePagos = usePayments` si se requiere retrocompatibilidad durante la transición).
   - Renombrar estado y métodos expuestos:
     - `payments` (antes `pagos`)
     - `isLoading` (antes `cargando`)
     - `isSaving` (antes `guardando`)
     - `isSyncing` (antes `sincronizando`)
     - `fetchPayments` (antes `fetchPagos`)
     - `createPayment` (antes `crearPago`)
     - `updatePayment` (antes `actualizarPago`)
     - `deletePayment` (antes `eliminarPago`)
     - `generateId` (antes `generarId`)
   - Mantener las claves de AsyncStorage intactas (`offline_payments_queue`, `payments_cache`).
   - Mantener los payloads que viajan a la API remota (`googleSheet.js`) compatibles con las columnas de Google Apps Script (`monto`, `fecha`, `cliente`, `metodo`, `estado`, etc.).

5. **Pantallas (`src/screens/`):**
   - Actualizar consumo de imports, hooks, props y variables de estado internas:
     - En `Historial.js`: `filter` (antes `filtro`), `sortOrder` (antes `orden`), `searchQuery` (antes `busqueda`), `searchType` (antes `tipoBusqueda`), `selectedMethod` (antes `metodoSeleccionado`), `isRefreshing` (antes `actualizando`), `handleDelete` (antes `eliminarPago`).
     - En `RegisterPayment.js`: `client` (antes `cliente`), `amount` (antes `monto`), `date` (antes `fecha`), `method` (antes `metodo`), `handleSave` (antes `handleGuardar`), `handleReset` (antes `limpiar`).
     - En `EditPayment.js`: props y states alineados a `client`, `amount`, `date`, `method`, `handleSave`.
     - En `DishwashingCalendar.js`: imports de `shifts.js`.

6. **CRÍTICO - Conservar Textos de UI en Español:**
   - **TODOS** los textos visibles para el usuario en pantalla deben permanecer intactos en **español**:
     - Contenido de `<Text>...</Text>` (ej: `"Registrar"`, `"Historial"`, `"¿Eliminar pago?"`, `"Cancelar"`, `"Selecciona una fecha"`, `"Listo"`, `"Pendiente de sincronizar"`).
     - Placeholders de inputs (ej: `placeholder="0.00"`, `placeholder="Buscar por monto..."`).
     - Etiquetas de alertas y modales (ej: `Alert.alert("Error", ...)`).
     - Opciones visibles de filtros y métodos (ej: `"Todos"`, `"Efectivo"`, `"Yape"`, `"Otro"`).

7. **Cierre en `context/progress-tracker.md`:**
   - Mover la feature a `## Completed` y detallar las decisiones tomadas en `## Architecture Decisions`.

---

## Lo que NO debes tocar

- **Textos de UI en pantalla:** No traducir al inglés títulos, botones, placeholders, mensajes de error ni etiquetas visibles para el usuario.
- **Backend & Esquema de API:** No renombrar las keys del payload enviado a Google Apps Script (`pago.monto`, `pago.fecha`, `pago.cliente`, `pago.metodo`, `pago.estado`) a menos que se adapte el script remoto.
- **Valores de los datos:** Los nombres de clientes (`"Vicky"`, `"Vilma"`, `"Julia"`) y personas (`"Josué"`, `"David"`) son datos y no deben modificarse.
- **Rutas de navegación:** Las rutas de `App.js` (`"Registrar"`, `"Historial"`, `"CalendarioPlatos"`, `"EditarPago"`) deben mantenerse o actualizarse de manera coordinada sin romper llamadas a `navigation.navigate()`.

---

## Criterios de Evaluación

Al terminar, verifica y reporta como ✅ o ❌:

1. **Textos UI intactos:** Todos los componentes siguen mostrando sus textos y etiquetas en español en la interfaz gráfica.
2. **Componentes en inglés:** `ClienteSelector.js` fue renombrado a `ClientSelector.js` y `ModalAlert.js` recibe props en inglés (`icon`, `title`, `message`, `buttons`).
3. **Constantes en inglés:** `src/config/constants.js` exporta `CLIENTS` y `CURRENCY`.
4. **Contexto & Hook unificados:** `usePayments` expone `payments`, `isLoading`, `isSaving`, `isSyncing`, `createPayment`, `updatePayment`, `deletePayment`.
5. **Utilidades en inglés:** `src/utils/shifts.js` reemplaza a `turnos.js` y tanto la app como los widgets importan correctamente sin errores.
6. **Cero regresiones en lógica Offline:** El flujo de persistencia en `AsyncStorage` y sincronización con `googleSheet.js` continúa funcionando transparentemente.
7. **Metro Bundler:** `npx expo start` inicia sin errores de resolución de módulos ni advertencias de variables indefinidas.
