# Architecture Context

## Stack

| Capa              | Tecnología                                                | Rol / Propósito                                         |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| Mobile Framework  | Expo (~57.0) + React Native (0.86) + React (19.2)         | Aplicación móvil multiplataforma (Android prioritario)  |
| Navegación        | React Navigation v7 (Native Stack & Bottom Tabs)          | Gestión de rutas, tabs y modales sobre RootStack        |
| Estilos & UI      | NativeWind v4 (Tailwind CSS v3) + React Native StyleSheet | Utilidades de estilo atómicas, tokens y temas           |
| Iconografía       | @expo/vector-icons (MaterialIcons)                        | Iconos vectoriales consistentes en tabs y acciones      |
| Calendario        | react-native-calendars                                    | Visualización y selección de días para tareas/turnos    |
| Componentes Form  | @react-native-picker/picker, datetimepicker               | Selectores nativos de cliente y fecha                   |
| Storage Local     | @react-native-async-storage/async-storage                 | Persistencia offline-first, cola de sincronización      |
| Red & Conectividad| @react-native-community/netinfo                           | Detección de conectividad para disparar sincronización  |
| Backend / DB      | Google Sheets vía Google Apps Script (Web App)            | Almacenamiento tabular remoto accesible por HTTP        |
| Widgets Android   | react-native-android-widget                               | Widget nativo de calendario para la pantalla de inicio  |

## System Boundaries

- `src/screens/` — Pantallas completas de la app (`RegisterPayment`, `Historial`, `EditPayment`, `DishwashingCalendar`). Coordinan la presentación y llaman hooks/contextos.
- `src/components/` — Componentes reutilizables de UI (`ClienteSelector`, `DatePickerField`, `ModalAlert`, `PaymentCard`). No gestionan estado de persistencia global.
- `src/context/` — Estado global y lógica de negocio (`PaymentsContext`). Administra la lista de pagos, cola offline, mutaciones optimistas y reintentos.
- `src/api/` & `src/services/` — Clientes HTTP (`googleSheet.js`, `api.js`) para invocar las acciones del Web App de Google Apps Script (`list`/`get`, `create`, `update`, `delete`).
- `src/config/` — Constantes de aplicación (`constants.js`: lista de clientes predefinidos, endpoints).
- `src/styles/` — Tokens de diseño y paleta de colores (`theme.js`), hook `useAppTheme` y definición de sombras/bordes.
- `src/widgets/` — Configuración y manejadores del widget Android nativo (`CalendarWidget.js`, `updateWidget.js`, `widgetTaskHandler.js`).

## Storage Model

- **AsyncStorage (Almacenamiento Local):**
  - `payments_cache`: Caché de lectura rápida de los pagos del servidor para carga instantánea al iniciar.
  - `offline_payments_queue`: Cola FIFO de transacciones creadas o editadas sin conexión (identificadas temporalmente con prefijo `offline_`), que se despachan al detectar internet.
  - `temaApp`: Preferencia de tema persistida por el usuario (si aplica).
- **Google Sheets (Base de Datos Remota):**
  - Registro de pagos con identificador único (`id`), nombre del cliente, monto, fecha, estado y metadatos.

## Auth and Access Model

- No requiere autenticación de sesión por credenciales individuales (uso en dispositivo seguro).
- La comunicación con Google Apps Script está protegida por la URL secreta del Web App configurada en variables de entorno (`EXPO_PUBLIC_API_URL` / `apiUrl` en EAS).

## Invariants

1. **Persistencia primero (Offline First):** Una acción de creación o edición nunca debe bloquear la UI del usuario esperando respuesta remota; se guarda en AsyncStorage de inmediato y se encola la sincronización.
2. **Jerarquía de navegación sin fugas:** La pantalla `EditarPago` se ejecuta sobre el `RootStack` (`presentation: "card"`, `animation: "slide_from_right"`) para ocultar la barra inferior de tabs y conservar el foco contextual.
3. **Integridad de IDs:** Los IDs temporales generados offline (`offline_<timestamp>`) son reemplazados por IDs únicos definitivos (`generarId()`) al momento de confirmarse en el servidor remoto.
4. **Respeto estricto del tema:** Los componentes deben adaptarse automáticamente al modo oscuro/claro mediante clases de NativeWind o los tokens compartidos de `theme.js`.
5. **Aislamiento de lógica en Servicios/Contexto:** Las pantallas no deben realizar llamadas HTTP directas con `fetch`; siempre deben consumir las funciones expuestas por `PaymentsContext` o `src/api/`.
