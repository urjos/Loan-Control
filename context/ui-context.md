# UI Context

## Theme

El sistema visual admite modo claro y modo oscuro de forma reactiva y automática, respetando la configuración del sistema operativo (`useColorScheme()`) o la preferencia almacenada en la app.

- **Modo Claro:** Fondo neutro suave (`#F8FAFC`), tarjetas en blanco puro (`#FFFFFF`), texto slate de alto contraste (`#0F172A`) y acento azul primario vibrante (`#2563EB`).
- **Modo Oscuro:** Fondo técnico casi negro (`#0e0f0f`), superficies oscuras elevadas (`#1e2229`), texto claro contrastado (`#F8FAFC` / `#94A3B8`) y acento azul eléctrico (`#2879fa`).

## Colors & Tokens

Los tokens de color están sincronizados entre `src/styles/theme.js` y `tailwind.config.js` para ser usados con NativeWind (`className="bg-primary text-text dark:bg-dark-surface"`) o vía hook `useAppTheme()` en componentes que requieran props directas (ej. calendarios, iconos vectoriales, barras de navegación).

| Rol                   | Token / Propiedad      | Valor Light  | Valor Dark   | Clase Tailwind Sugerida |
| --------------------- | ---------------------- | ------------ | ------------ | ----------------------- |
| Fondo general         | `background`           | `#F8FAFC`    | `#0e0f0f`    | `bg-background dark:bg-dark-background` |
| Superficie / Tarjetas | `surface`              | `#FFFFFF`    | `#1e2229`    | `bg-surface dark:bg-dark-surface`       |
| Texto Principal       | `text`                 | `#0F172A`    | `#F8FAFC`    | `text-text dark:text-dark-text`         |
| Texto Secundario      | `textMuted`            | `#64748B`    | `#94A3B8`    | `text-textMuted dark:text-dark-textMuted` |
| Texto Suave / Hint    | `textLight`            | `#94A3B8`    | `#475569`    | `text-textLight dark:text-dark-textLight` |
| Primario (Acción)     | `primary`              | `#2563EB`    | `#2879fa`    | `bg-primary text-primary`               |
| Primario Suave / Tint | `primaryLight`         | `#EFF6FF`    | `#1E3A8A`    | `bg-primaryLight dark:bg-dark-primaryLight` |
| Primario Borde        | `primaryBorder`        | `#BFDBFE`    | `#1E40AF`    | `border-primaryBorder`                  |
| Éxito (Montos/Pagado) | `success`              | `#059669`    | `#10B981`    | `text-success bg-success`               |
| Éxito Suave           | `successLight`         | `#ECFDF5`    | `#064E3B`    | `bg-successLight dark:bg-dark-successLight` |
| Peligro (Eliminar)    | `danger`               | `#DC2626`    | `#EF4444`    | `text-danger bg-danger`                 |
| Peligro Suave         | `dangerLight`          | `#FEF2F2`    | `#7F1D1D`    | `bg-dangerLight dark:bg-dark-dangerLight` |
| Advertencia (Editar)  | `warning`              | `#D97706`    | `#F59E0B`    | `text-warning bg-warning`               |
| Advertencia Suave     | `warningLight`         | `#FFFBEB`    | `#78350F`    | `bg-warningLight dark:bg-dark-warningLight` |
| Borde General         | `border`               | `#eef2f7`    | `#2c333d00`  | `border-border dark:border-dark-border` |
| Borde Input Enfocado  | `borderFocus`          | `#93C5FD`    | `#3a81f3`    | `border-borderFocus`                    |
| Divisores             | `divider`              | `#F1F5F9`    | `#161922`    | `bg-divider dark:bg-dark-divider`       |
| Días Calendario Off   | `calendarTextDisabled` | `#A0AEC0`    | `#475569`    | -                                       |

## Typography & Weights

- `regular`: `"400"` (Cuerpo de texto, descripciones)
- `medium`: `"500"` (Etiquetas de inputs, subtítulos)
- `bold`: `"700"` (Encabezados de tarjetas, títulos de pantalla, montos)
- `black`: `"800"` (Números destacados)

## Border Radius

| Contexto / Componente  | Token `radius` | Clase Tailwind | Valor  |
| ---------------------- | -------------- | -------------- | ------ |
| Inputs pequeños / Tags | `sm`           | `rounded-sm`   | `8px`  |
| Botones / Selectores   | `md`           | `rounded-md`   | `12px` |
| Tarjetas / Contenedores| `lg`           | `rounded-lg` / `rounded-card` | `16px` |
| Badges / Chips píldora | `full`         | `rounded-full` | `9999px` |

## Component Guidelines

- **Form Fields (Inputs & Selectores):** Altura estándar de 48-52px, bordes redondeados (`rounded-md` / `rounded-lg`), bordes sutiles, estados de foco destacados con `borderFocus` y padding horizontal cómodo (`px-4`).
- **Modales & Diálogos:** `ModalAlert` y modales de picker se presentan centrados o desde la parte inferior, con fondo oscuro translúcido de fondo (`rgba(0,0,0,0.5)`), contenedor con bordes redondeados (`rounded-card`) y padding generoso.
- **Botones de Acción:** Botón principal con fondo `bg-primary`, texto blanco bold, feedback táctil con opacidad o efecto ripple nativo.
- **Iconografía:** MaterialIcons vía `@expo/vector-icons`. Tamaño 24-28px para barras de navegación e iconos principales; 16-20px para iconos inline en botones o tags.
- **Calendarios:** Personalizados mediante el objeto `theme` de `react-native-calendars`, configurando el locale en español con la semana iniciando en Lunes (`firstDay: 1`).
