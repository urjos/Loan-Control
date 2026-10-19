# 💸 Control de Préstamos

Una aplicación móvil desarrollada en **React Native** (utilizando el entorno de Expo) diseñada para gestionar, registrar y mantener un historial detallado de pagos y préstamos.

## 🚀 Características Principales

- **Registro de Pagos:** Interfaz dedicada para añadir nuevos pagos al sistema.
- **Historial Detallado:** Vista completa del registro de transacciones pasadas.
- **Edición Dinámica:** Sistema modal para modificar pagos existentes de forma rápida y fluida sin perder el contexto de la navegación principal.
- **UI/UX Optimizado:** Navegación por pestañas (Bottom Tabs) con iconos claros y retroalimentación visual basada en un tema personalizado.
- **📅 Calendario de Tareas:** Una nueva sección con un calendario para organizar tareas recurrentes (como lavar los platos) entre dos personas, con un ciclo de 2 días para cada una.

## 🛠️ Tecnologías Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/) (Native Stack & Bottom Tabs)
- [React Native Calendars](https://github.com/wix/react-native-calendars)
- [@expo/vector-icons](https://icons.expo.fyi/) (MaterialIcons)

## 🗺️ Arquitectura de Navegación

La aplicación utiliza un enrutamiento diseñado para ofrecer la mejor experiencia de usuario en ambas plataformas (iOS y Android), organizando las pantallas mediante un **Root Stack**:

```text
RootStack (Stack oculto)
 ├── MainTabs (Bottom Tabs - Pantalla Principal)
 │    ├── Tab "Register"  → RegisterPayment
 │    └── Tab "Historial"  → Historial
 │    └── Tab "CalendarioPlatos" → DishwashingCalendar
 └── Modal "EditPayment"    → EditPayment
```

> **Nota de diseño:** Usar un `RootStack` por encima de la navegación por pestañas (Tabs) permite que la pantalla `EditarPago` se abra como una pantalla de pila (con animación de deslizamiento), sobreponiéndose de manera elegante sin mostrar la barra de navegación inferior.

## 📁 Estructura del Proyecto

Un vistazo a la estructura principal de directorios:

```text
ControlPrestamos/
 ├── App.js                 # Punto de entrada y configuración global de navegación
 ├── src/
 │    ├── screens/          # Pantallas de la aplicación
 │    │    ├── RegisterPayment.js
 │    │    ├── Historial.js
 │    │    └── EditarPagoScreen.js
 │    └── styles/           # Archivos de estilos globales y temas
 │         └── theme.js
 ├── package.json
 └── README.md
```

## 💻 Instalación y Uso

Sigue estos pasos para correr el proyecto en tu máquina local:

1. **Clonar el repositorio** (si aplica):

   ```bash
   git clone <url-del-repositorio>
   cd ControlPrestamos
   ```

2. **Instalar las dependencias:**

   ```bash
   pnpm / npm install
   # o si usas yarn:
   yarn install
   ```

3. **Iniciar el servidor de desarrollo de Expo:**

   ```bash
   npx expo start
   ```

4. **Visualizar la App:**
   - Usa la aplicación **Expo Go** en tu dispositivo físico escaneando el código QR.
   - O presiona `a` para abrir en un emulador de Android, o `i` para el simulador de iOS.

---

_Proyecto creado y mantenido para el Control de Préstamos._
