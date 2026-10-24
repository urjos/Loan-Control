# Code Standards

## General

- **Modularidad y propósito único:** Mantén los componentes pequeños, enfocados en una sola responsabilidad (ej. selección de fecha, tarjeta de pago, alerta modal).
- **Resolver la causa raíz:** No parchar errores con timeouts artificiales ni condicionales ad-hoc; identifica el origen del ciclo o error de renderizado.
- **Separación de responsabilidades:** Las pantallas (`src/screens`) orquestan navegación y llamadas al contexto; los componentes de UI (`src/components`) son puros o controlados; la lógica de sincronización y estado reside en `src/context` y `src/services`.

## React & React Native

- **Manejo multiplataforma (iOS & Android):** Siempre contemplar diferencias de comportamiento y UX nativo (por ejemplo: selectores modales en iOS vs diálogos nativos directos en Android mediante `Platform.OS`).
- **Hooks y dependencias estables:** Usar `useCallback` y `useMemo` para funciones pasadas por props a listas o efectos para prevenir re-renders innecesarios.
- **Gestión de ciclo de vida:** Limpiar listeners de eventos (`NetInfo`, `AppState`, suscripciones) en las funciones de cleanup de `useEffect`.
- **Imports limpios:** Agrupar imports en el orden: (1) Core React / React Native, (2) Librerías externas (`@expo/*`, `@react-navigation/*`), (3) Componentes locales, (4) Contextos, hooks y servicios, (5) Estilos y utilidades.

## Estilizado con NativeWind & Theme

- **Priorizar utilidades NativeWind (Tailwind):** Usar `className` con los tokens semánticos configurados en `tailwind.config.js`.
- **Soporte Dark Mode:** Siempre que se asigne un color o fondo, especificar su contraparte para modo oscuro utilizando el prefijo `dark:` (ej. `bg-surface dark:bg-dark-surface text-text dark:text-dark-text`).
- **Valores no mapeables:** Cuando una librería externa requiera objetos de estilo nativo (como `react-native-calendars`, `react-navigation` o componentes del widget nativo de Android), recurrir a los tokens de `src/styles/theme.js` mediante el hook `useAppTheme()` o las constantes `radius`/`font`.
- **Cero valores hex harcodeados:** No colocar colores hex directos dispersos en el código; deben pertenecer al tema centralizado o a la configuración de Tailwind.

## Servicios & Datos (API & AsyncStorage)

- **Offline-First First Class:** Toda mutación debe prever la posibilidad de fallo de red o ausencia de conectividad. Si no hay red, guardar en cola local (`AsyncStorage`) con estado pendiente.
- **Control de estados de red:** Usar `NetInfo` para disparar sincronizaciones automáticas al reanudar conexión.
- **Manejo de errores explícito:** En llamadas a la API remota (`googleSheet.js`), capturar errores y retornar respuestas legibles para la UI sin romper el flujo de la aplicación.
- **Inmutabilidad en el estado:** Tratar las listas de pagos (`pagos`) de forma inmutable al actualizar o filtrar elementos en `PaymentsContext`.

## Convenciones de Archivos y Carpetas

- `src/screens/` — Vistas completas vinculadas al enrutador (PascalCase, ej. `RegisterPayment.js`, `Historial.js`).
- `src/components/` — Piezas visuales reutilizables (PascalCase, ej. `ClienteSelector.js`, `DatePickerField.js`, `ModalAlert.js`).
- `src/context/` — Providers y hooks de contexto global (`PaymentsContext.js`, etc.).
- `src/services/` & `src/api/` — Conectores HTTP, clientes API y lógica de endpoints remotos (`api.js`, `googleSheet.js`).
- `src/config/` — Valores constantes, catálogos fijos y variables de entorno (`constants.js`).
- `src/styles/` — Definición central de colores, métricas, fuentes y temas (`theme.js`).
- `src/widgets/` — Componentes y sincronizadores nativos para Android Widget (`react-native-android-widget`).
- `src/utils/` — Funciones de formateo de moneda, fechas y cálculos utilitarios.
- `context/features/` — Especificaciones ejecutables paso a paso para nuevas funcionalidades o refactorizaciones.
