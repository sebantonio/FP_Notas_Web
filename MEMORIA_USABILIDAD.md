# Memoria de usabilidad

Fecha: 2026-05-31

## Punto de seguridad previo

Antes de modificar la aplicacion se creo y subio el checkpoint:

- Commit: `8ef602e`
- Mensaje: `chore: checkpoint before usability improvements`
- Rama: `main`
- Remoto: `origin/main`

Ese commit representa el estado funcional previo a estas mejoras.

## Estado funcional existente

La aplicacion es un gestor local/Tauri para trabajar sobre una plantilla Excel de notas de FP. Las pantallas principales ya cubrian:

- Inicio con archivo activo, accesos rapidos, recientes y alertas.
- Gestion de alumnos, RRAA/CE, unidades y actividades.
- Introduccion de notas por actividad y CE por alumno.
- Consulta por actividades, unidades, evaluaciones, informes y diario.
- Autoguardado en pantallas de edicion y backups previos en backend.

## Modificaciones aplicadas

### Capa comun de usabilidad

Se anaden `ux-common.css` y `ux-common.js` para compartir mejoras sin tocar la logica Excel:

- Foco visible y enlace "Saltar al contenido".
- Navegacion superior con comportamiento sticky.
- Boton "Atras" con fallback a `index.html` si no hay historial.
- Estado flotante para mensajes y guardados.
- Modal comun de confirmacion para acciones destructivas.
- Atajo `Ctrl+S` / `Cmd+S` para guardar cuando hay boton de guardado.
- Ayuda de desplazamiento horizontal en tablas anchas.

### Introduccion de notas

En `gestor-notas.html`:

- Busqueda de alumno por nombre o numero.
- Boton de salto al primer error cuando hay notas invalidas.
- Navegacion por teclado entre notas con `Enter`, `Flecha abajo` y `Flecha arriba`.
- Confirmacion antes de vaciar notas.
- Barra de acciones de guardado mas visible.

### Actividades

En `incluir-actividad.html`:

- Separacion en modos `Editar existente` y `Crear nueva`.
- Ayuda contextual para la creacion de nuevas actividades.
- Acciones mostradas segun el modo activo.

### RRAA y criterios

En `gestor-rraa-criterios.html`:

- Busqueda de CE por codigo, texto, RA o descripcion.
- Busqueda sincronizada tambien en ponderaciones.
- Pista visual de que los pesos se introducen en escala `0-1`.
- Confirmaciones propias para eliminar RRAA/CE e importar datos.

### Confirmaciones

Se sustituyen confirmaciones nativas en acciones sensibles:

- Limpiar archivos recientes.
- Eliminar alumno.
- Eliminar unidad.
- Eliminar RRAA.
- Eliminar criterio.
- Importar y reemplazar datos de RRAA/CE/unidades.

### Empaquetado

Se actualiza `scripts/prepare-tauri-web.js` para copiar tambien:

- `ux-common.css`
- `ux-common.js`

Sin este cambio, Tauri no incluiria la nueva capa visual en `tauri-web`.

## Actualizacion 2026-06-03: mejoras docentes

Antes de esta tanda se creo el backup local:

- Ruta: `copiaseguridad/backup-usabilidad-profesor-20260603-104940`
- Manifiesto: `MANIFIESTO.txt`
- Motivo: cambios amplios de usabilidad para profesorado, documentacion, build, commit y push.

Mejoras aplicadas:

- `gestor-notas.html`: panel de avisos para pendientes, errores y suspensos; filtros rapidos por estado; salto directo al primer pendiente/error; aviso antes de guardar si quedan pendientes; estado de guardado visible en el panel.
- `visor-notas.html`: filtros rapidos por alumno (`Sin final`, `Suspensos`, `Riesgo RA`, `Aprobados`); tarjetas de alerta; columna `Informe` por alumno; enlace de informe en el detalle; CE con media mas baja visible por RA.
- `informes.html`: apertura directa con alumno seleccionado mediante `?alumno=...` o `?student=...`, con comparacion normalizada.
- `ux-common.css`: estilos reutilizables para paneles docentes, filtros rapidos, acciones compactas y alertas.

## Archivos nuevos

- `ux-common.css`
- `ux-common.js`
- `MEMORIA_USABILIDAD.md`

## Riesgos controlados

- No se modifica la estructura del Excel.
- No se cambian los comandos Tauri/Rust de guardado ni lectura.
- Las mejoras son mayoritariamente de interfaz y confirmacion.
- El checkpoint `8ef602e` permite volver al estado previo.

## Verificacion realizada

- `node --check ux-common.js`
- `npm test`
- `node scripts/prepare-tauri-web.js`
- `npm run build`

Resultado:

- Smoke tests OK.
- `prepare-tauri-web` preparo 14 archivos para Tauri.
- Build Tauri OK con version `0.1.0-build.202605311239`.
- Instalador generado en `C:\cargo-target\plantillaNotas\release\bundle\nsis\GestorNotasFp_0.1.0-build.202605311239_x64-setup.exe`.
- Warnings Rust no bloqueantes: una funcion y un campo no usados en `src/main.rs`.

## Verificacion actualizacion 2026-06-03

- Scripts inline HTML: OK.
- `git diff --check`: OK, solo avisos esperados de normalizacion CRLF.
- `npm test`: OK (`Smoke tests OK: estructura y comandos criticos verificados`).
- `npm run build`: OK con version `0.1.0-build.202606031114`.
- Instalador generado: `C:\cargo-target\plantillaNotas\release\bundle\nsis\GestorNotasFp_0.1.0-build.202606031114_x64-setup.exe`.
- Warnings Rust no bloqueantes: dos funciones y un campo no usados en `src/main.rs`.
