# Feature: [Nombre Breve y Claro de la Feature]

## Contexto

- **Estado actual:** Explica brevemente cómo funciona hoy la app en esta área o qué pantalla/componente se verá impactado (ej. `src/screens/Historial.js`).
- **Dependencias involucradas:** Indica librerías existentes que se usarán o si se requiere una nueva (ej. `expo-sharing`, `@react-native-async-storage/async-storage`).
- **Archivos de referencia:** Menciona si hay componentes base que servirán de guía visual o funcional (ej. `src/components/ModalAlert.js`).

---

## Lo que debes hacer
 
0. **Actualizar `context/progress-tracker.md`:**
   - Registrar esta feature en `## In Progress` y actualizar el objetivo actual (`## Current Goal`).
1. **Instalación de librerías (si aplica):**
   - Especificar el comando compatible con Expo: `npx expo install <paquete>`
2. **Creación o modificación de componentes/pantallas:**
   - Detallar los props requeridos, estados locales y ubicación en `src/`.
   - Aplicar estilos usando clases de **NativeWind (Tailwind)** con soporte explícito para Dark Mode (`dark:...`).
3. **Integración con el Estado Global o API:**
   - Indicar si se agrega una función a `PaymentsContext.js` o si consume servicios existentes en `src/api/` o `src/services/`.
   - Garantizar el principio **Offline-First** (prever fallos de red sin romper la interfaz).
4. **Navegación (si aplica):**
   - Indicar si se añade como pestaña en `MainTabs` o como pantalla en el `RootStack` en `App.js`.
5. **Cierre en `context/progress-tracker.md`:**
   - Al completar la feature y validar todos los criterios, moverla a `## Completed` y documentar cualquier decisión técnica en `## Architecture Decisions`.

---

## Lo que NO debes tocar

- **Archivos protegidos:** Componentes, pantallas o servicios ajenos a la feature que no deben sufrir modificaciones.
- **Invariantes:** No romper la compatibilidad multiplataforma (Android/iOS) ni eliminar soporte offline.
- **Estilos:** No usar colores hexadecimales harcodeados sin agregarlos a los tokens en `theme.js` / `tailwind.config.js`.

---

## Criterios de Evaluación

Al finalizar la implementación, verifica cada uno de estos puntos y repórtalos como ✅ o ❌:

1. **Funcionalidad:** [Condición verificable directa, ej: El usuario puede exportar la lista de pagos en formato X]
2. **Offline-First:** [Condición de resiliencia ante falta de internet]
3. **Estilos y Temas:** [Verificación de soporte tanto en tema claro como en tema oscuro]
4. **Multiplataforma:** [Comprobación de que no hay fallos o crash en Android e iOS]
5. **Metro / Build:** El bundler (`npx expo start`) arranca sin errores de importación o sintaxis.
