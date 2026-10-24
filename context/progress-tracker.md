# Progress Tracker

## Current Phase

- **En Progreso: Refactorización de Código a Inglés (Feature 03)**

## Current Goal

- Refactorizar componentes, constantes, hooks, utilidades y variables de estado a inglés, manteniendo intactos todos los textos visibles de UI en español (`<Text>`, alertas, placeholders).

## Completed

- **Configuración de Expo & React Navigation:** Navegación por RootStack con MainTabs (`RegisterPayment`, `Historial`, `DishwashingCalendar`) y modal (`EditPayment`).
- **Sistema Offline-First:** Integración de `AsyncStorage` + `@react-native-community/netinfo` con cola de sincronización para operaciones sin red en `PaymentsContext`.
- **Integración con Google Sheets:** API service para listado, creación, edición y eliminación de pagos en hoja de cálculo remota vía Apps Script.
- **Sistema de Diseño y Temas:** Definición de tokens en `src/styles/theme.js` y utilidades con NativeWind v4 (Tailwind CSS) con soporte reactivo para tema claro y oscuro.
- **Selector de Clientes:** Implementación nativa con `@react-native-picker/picker` adaptada para Android y modal para iOS.
- **Selector de Fechas:** `DatePickerField` unificado para Android e iOS.
- **Módulo de Calendario de Tareas:** Pantalla de turnos `DishwashingCalendar` con localización en español y semana iniciando en lunes.
- **Widget Nativo para Android:** `CalendarWidget` sincronizado en primer y segundo plano.

## In Progress

- `context/features/03-translation-implemention.md`: Refactorización de identificadores de código a inglés (componentes, constantes, props, hooks, context y utils) preservando el 100% de los textos en español en la interfaz.

## Next Up

- Nuevas features o reportes según requerimientos (ej. filtros avanzados en historial, exportación o resumen mensual).

## Architecture Decisions

- **Google Apps Script como Backend:** Permite persistencia en nube sin costo de servidores dedicados ni mantenimiento de infraestructura compleja.
- **Optimistic UI con Cola Offline:** La UI confirma inmediatamente el registro con un ID temporal `offline_<timestamp>`, asegurando respuesta instantánea incluso con baja señal.
- **Uso Híbrido NativeWind + Tokens JS:** Las clases de Tailwind agilizan la maquetación de pantallas, mientras que `theme.js` suministra los colores exactos a librerías nativas que no leen className (Navigation, Calendars, Widgets).

## Session Notes

- La carpeta `context/` se encuentra totalmente sincronizada con el estado real del proyecto para guiar la creación de futuras especificaciones en `context/features/`.
