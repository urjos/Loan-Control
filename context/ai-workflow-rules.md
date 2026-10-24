# AI Workflow Rules

## Approach

El desarrollo en **ControlPrestamos** se gestiona de forma modular y dirigida por especificaciones (**spec-driven workflow**). Los archivos dentro de `context/` y en especial las especificaciones en `context/features/` dictan qué construir, cómo interactuar con el código existente y qué no romper.

Toda nueva funcionalidad o modificación mayor debe apoyarse en estas especificaciones antes de implementar código directamente.

## Estructura para Nuevas Features

Al integrar una nueva feature:
1. Crear una especificación en `context/features/<num>-<nombre-feature>.md` (ej. `03-exportar-reporte-pdf.md`) usando la plantilla [`context/features/TEMPLATE.md`](file:///c:/Users/USER/OneDrive/Documentos/Projects/Android/ControlPrestamos/context/features/TEMPLATE.md).
2. **Actualizar inmediatamente `context/progress-tracker.md`:**
   - Registrar la feature en la sección `## In Progress` o `## Next Up`.
   - Si existen dudas o decisiones técnicas pendientes, agregarlas en `## Open Questions`.
3. Seguir la estructura estandarizada:
   - **Contexto:** Estado actual del código afectado y dependencias.
   - **Lo que debes hacer:** Pasos específicos, librerías compatibles con Expo y archivos a crear o editar.
   - **Lo que NO debes tocar:** Invariantes de negocio, servicios protegidos o componentes ajenos.
   - **Criterios de evaluación:** Lista de verificación (checks ✅ / ❌) para validar la tarea al finalizar.

## Scoping & Reglas de Implementación

- **Unidad de trabajo única:** Enfocarse en una pantalla, componente o flujo a la vez.
- **Cambios pequeños y comprobables:** Preferir avances incrementales que puedan probarse inmediatamente en el emulador o Expo Go.
- **Preservar la compatibilidad móvil:** Siempre verificar que una nueva librería o cambio no rompa la ejecución en Android o iOS (especialmente con Expo Managed Workflow).
- **No duplicar abstracciones:** Si ya existe un componente en `src/components/` o un método en `PaymentsContext`, reutilizarlo o extenderlo en vez de crear lógica paralela.

## Manejo de Requisitos Faltantes

- No asumir lógica de negocio ni flujos de datos no especificados.
- Si surge una duda arquitectónica o de UI/UX no resuelta en `context/`, plantearla en `context/progress-tracker.md` como *Open Question* antes de implementar supuestos arbitrarios.

## Archivos Protegidos

Salvo que la especificación de la feature lo indique expresamente:
- `src/api/googleSheet.js` y el backend en Apps Script: No alterar las firmas de comunicación si no se ha versionado el backend.
- `app.config.js` y `eas.json`: No alterar identificadores de paquete, slugs ni plugins a menos que se agregue una librería nativa explícita.
- `src/context/PaymentsContext.js`: Respetar el flujo offline-first y la estructura de la cola `OFFLINE_QUEUE_KEY`.

## Verificación antes de concluir un Feature

Antes de marcar una tarea como completada:
1. Verificar que se cumplan todos los **Criterios de Evaluación** de la especificación del feature.
2. Confirmar que no haya errores de empaquetado o advertencias críticas en el bundler de Metro (`npx expo start`).
3. Comprobar la visualización en **Modo Claro** y **Modo Oscuro**.
4. Actualizar `context/progress-tracker.md` registrando los cambios implementados y el siguiente paso en la hoja de ruta.
