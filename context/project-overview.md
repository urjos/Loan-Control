# Control de Préstamos

## Overview

Aplicación móvil desarrollada en **React Native** con **Expo** diseñada para registrar, gestionar y mantener un historial detallado de pagos y préstamos, con soporte offline-first y sincronización remota contra Google Apps Script (Google Sheets), además de un módulo utilitario de calendario de tareas recurrentes con widget nativo para Android.

## Goals

1. Permitir el registro rápido de pagos con validación de montos, selección de cliente y fecha.
2. Garantizar disponibilidad sin conexión (offline-first) almacenando localmente en AsyncStorage y sincronizando automáticamente al recuperar conectividad.
3. Brindar una experiencia visual limpia, fluida y consistente en iOS y Android con soporte nativo de modo claro y oscuro (Dark Mode).
4. Facilitar la consulta y edición de pagos registrados con confirmación de cambios y sincronización al servidor.

## Core User Flow

1. **Apertura de la App:** Se inicializa `PaymentsProvider`, se valida conectividad con NetInfo y se sincronizan pagos pendientes si hay red.
2. **Registro de Pago:** El usuario ingresa a la pestaña "Registrar", selecciona el cliente (`ClienteSelector`), ingresa monto y fecha (`DatePickerField`), y presiona guardar.
3. **Persistencia Inmediata:** El pago se almacena localmente de forma instantánea (`AsyncStorage` con prefijo `offline_` si no hay confirmación inmediata) y la UI se actualiza sin esperas bloqueantes.
4. **Sincronización:** Si hay conexión, la API remota (`Google Apps Script`) procesa la transacción y devuelve el ID permanente.
5. **Historial y Gestión:** El usuario consulta la lista de pagos en "Historial", filtra/revisa el balance y puede editar o eliminar pagos mediante la pantalla `EditPayment` montada sobre el `RootStack`.

## Features

### Gestión de Pagos y Préstamos

- **Registro de pagos:** Selección de cliente fijo o predefinido, input de monto numérico formateado, selector de fecha con diálogo nativo/modal.
- **Historial de transacciones:** Agrupación y listado de pagos con tarjetas interactivas (`PaymentCard`), pull-to-refresh y resumen de totales.
- **Edición y eliminación de pagos:** Pantalla dedicada de edición (`EditPayment`), soporte de eliminación con confirmación modal (`ModalAlert`).
- **Offline-First & Cola de sincronización:** Guardado local con `AsyncStorage`, detección de red con `@react-native-community/netinfo`, reintento de pagos pendientes en cola.

### Utilidades Adicionales

- **Calendario de Tareas (Dishwashing):** Organización de turnos recurrentes cada 2 días entre dos personas con selector mensual en español que inicia en lunes (`react-native-calendars`).
- **Widget Android:** Vista rápida en pantalla de inicio con `react-native-android-widget` sincronizada en background y al reactivar la app.

## Scope

### In Scope

- Aplicación móvil para Android e iOS mediante Expo Managed Workflow.
- Base de datos / backend ligero en Google Sheets conectado vía Google Apps Script Web App.
- Cache y persistencia local para operaciones sin conexión.
- Tema visual adaptativo (Claro / Oscuro) basado en NativeWind (Tailwind CSS) y tokens de `theme.js`.

### Out of Scope

- Servidor backend monolítico dedicado (Node.js/Django/etc.) o base de datos SQL relacional pesada.
- Autenticación multifactor o sistema multiusuario con roles complejos (actualmente uso personal/familiar directo).
- Pagos reales integrados a pasarelas bancarias (Stripe, Mercado Pago) directamente en la app (solo registro manual de transacciones).

## Success Criteria

1. Los pagos registrados se reflejan al instante en la lista de transacciones sin congelar la interfaz.
2. La app opera de forma transparente con o sin conexión a internet, sincronizando al conectarse.
3. El diseño responde fluidamente al cambio de tema (claro/oscuro) del sistema operativo.
4. No hay regresiones visuales ni de navegación entre pestañas (`MainTabs`) y pantallas de detalle (`RootStack`).
