# Gestor de Notas FP (Plantilla Notas Local)

Aplicacion de escritorio para gestionar notas de Formacion Profesional sobre plantillas Excel, con interfaz HTML/JS y backend Tauri v2 + Rust.

## Estado del proyecto

- Version app: `0.1.0`
- Estado funcional: produccion (segun documentacion del repo)
- Branch principal: `main`
- Entorno objetivo: Windows (OneDrive + archivos Excel locales)

## Stack tecnologico

- Frontend: HTML5, CSS, JavaScript Vanilla
- Capa UX compartida: `ux-common.css` + `ux-common.js`
- Desktop runtime: Tauri `v2` (migrado desde Electron)
- Backend/logica de Excel:
  - Rust (comandos Tauri)
  - Node bridge (IPC/compatibilidad)
- Librerias principales:
  - `@tauri-apps/api` `^2.11.0`
  - `xlsx` `^0.18.5`
  - `jszip` `^3.10.1`

## Arquitectura (alto nivel)

1. La UI (paginas HTML) ejecuta acciones de usuario.
2. `app-bridge.js` abstrae invocaciones entre UI y backend.
3. Comandos Tauri/Rust procesan lectura/escritura del Excel.
4. Se mantienen datos de alumnos, unidades, RA y criterios CE.
5. Se persisten cambios directamente en la plantilla Excel seleccionada.

## Estructura principal del repositorio

```text
.
├── index.html
├── gestor-alumnos.html
├── gestor-rraa-criterios.html
├── gestor-unidades.html
├── gestor-notas.html
├── incluir-actividad.html
├── visor-notas.html
├── visor-actividades.html
├── visor-unidades.html
├── informes.html
├── diario.html
├── app-bridge.js
├── main.js
├── preload.js
├── tauri-node-backend.js
├── scripts/
│   └── prepare-tauri-web.js
├── ux-common.css
├── ux-common.js
├── MEMORIA_USABILIDAD.md
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
├── tauri-web/
└── Documentacion/
```

## Paginas y funcionalidad

- `index.html`: pantalla de inicio y acceso a modulos.
- `gestor-alumnos.html`: alta/edicion de alumnos.
- `gestor-rraa-criterios.html`: gestion de resultados de aprendizaje y criterios.
- `gestor-unidades.html`: configuracion de unidades.
- `gestor-notas.html`: introduccion de notas por actividad y CE por alumno.
- `incluir-actividad.html`: alta de nuevas actividades.
- `visor-notas.html`: vista de notas por evaluacion.
- `visor-actividades.html`: visualizacion de notas por actividad y panel RA.
- `visor-unidades.html`: visualizacion por unidad y desglose RA/CE por alumno.
- `gestor-empresa.html`: gestion del estado dual (empresa) y nota tutor por alumno.
- `visor-nota-final.html`: visualizacion de nota final combinada (inst + empresa) por alumno.
- `informes.html`: consolidado e informes finales.
- `diario.html`: pagina auxiliar de seguimiento/uso interno.

## Flujo de datos Excel (resumen)

### Hojas clave

- `DATOS`:
  - columnas 0-2: datos alumno
  - columnas 5-6: RRAA
  - columnas 8-11: unidades
  - columnas 21-22: criterios
- `PESOS`:
  - fila 3: codigos CE
  - filas 5-20: ponderaciones
- `U1`-`U16`: notas de actividades por unidad
- `Evaluaciones`: 1a, 2a, 3a y final

### Estructura critica en hojas U1-U16

- Fila 1 (idx 0): cabecera de unidad (ej. `U1`) y evaluacion.
- Fila 3 (idx 2): cabeceras de RA (`NOTA RA`) en columnas clave.
- Fila 4 (idx 3): porcentajes CE.
- Fila 5 (idx 4): codigos CE (`1.a`, `1.b`, etc.).
- Fila 6+ (idx 5+): datos por alumno.

Reglas de deteccion:

- Deteccion de RA: buscar celdas que empiecen por `NOTA RA` o `RA n`.
- Deteccion de CE: usar codigos de criterio en fila de codigos CE entre bloques RA.
- Importante: no filtrar con `sheets: []` en funciones que recorren `SheetNames`.

## Comandos IPC relevantes

### Bridge (`app-bridge.js`) -> Rust/Tauri

- `excel_select_file`
- `excel_set_selected_file`
- `excel_get_selected_file`
- `excel_get_alumnos` / `excel_save_alumnos`
- `excel_get_unidades` / `excel_save_unidades`
- `excel_get_rraa_criterios` / `excel_save_rraa_criterios`
- `excel_get_notas_actividad` / `excel_save_notas_actividad`
- `excel_save_ce_notas`
- `excel_add_actividad`
- `excel_get_notas_actividades_tipo`
- `excel_get_notas_evaluacion`
- `excel_get_notas_evaluacion_alumno`
- `excel_get_notas_unidad`
- `excel_get_alumnos_informes`
- `excel_get_notas_empresa` / `excel_save_notas_empresa`
- `excel_get_nota_final_combinada`

### Backend Node (compatibilidad)

- `commandSelectFile()`
- `commandSetSelectedFile(filePath)`
- `commandLoadAlumnos()`
- `commandLoadUnidades()`
- `commandLoadRraa()`
- `commandLoadNotasActividad()`
- `commandLoadNotasEvaluacion()`
- `commandSaveAlumnos(data)`
- `commandSaveUnidades(data)`
- `commandSaveRraa(data)`
- `commandSaveNotas(data)`

## Comandos de desarrollo y build

Desde la raiz del proyecto:

```bash
npm install
node scripts/prepare-tauri-web.js
npm run tauri:dev
```

Modo desarrollo con Tauri:

```bash
node scripts/prepare-tauri-web.js
npm run tauri:dev
```

Build instalable (NSIS):

```bash
npm run tauri:build
```

Este comando genera una version unica por compilacion (sufijo `-build.YYYYMMDD.HHMM`).

Si necesitas compilar sin sufijo de version:

```bash
npm run tauri:build:plain
```

Recordatorio rapido (scripts recomendados):

- `npm run dev`: desarrollo diario con recarga.
- `npm run debug`: build local rapida en modo debug.
- `npm run dist`: build final versionada para distribucion.
- `npm run dist:plain`: build final sin sufijo automatico.

## Configuracion Tauri

Archivo: `src-tauri/tauri.conf.json`

- `beforeDevCommand`: `node scripts/prepare-tauri-web.js`
- `beforeBuildCommand`: `node scripts/prepare-tauri-web.js`
- `frontendDist`: `../tauri-web`
- Ventana principal:
  - titulo: `Plantilla Notas Local`
  - tamaño inicial: `1200x850`
  - minimo: `900x650`
- bundle activo con target `nsis`

## Optimizaciones de rendimiento aplicadas

Mejoras destacadas documentadas:

- Carga de informes: lazy loading + `Promise.all`.
- Cambio de alumno: event delegation + `DocumentFragment`.
- Render de notas: `requestAnimationFrame` + cache `WeakMap`.

Impacto aproximado reportado:

- Informes: ~30s -> ~5s (primera evaluacion)
- Interaccion de cambio alumno: de perceptible a instantanea
- Render de notas: ~500ms -> ~50ms

## Cambios funcionales recientes

- Mejoras docentes 2026-06-03:
  - backup previo en `copiaseguridad/backup-usabilidad-profesor-20260603-104940`,
  - `gestor-notas`: panel de avisos, filtros rapidos por pendientes/errores/suspensos/aprobados, salto al primer caso y aviso antes de guardar con pendientes,
  - `visor-notas`: filtros rapidos por estado del alumno, tarjetas de alerta, enlace directo a informe por alumno y CE con media mas baja por RA,
  - `informes`: seleccion inicial por URL con `?alumno=...` o `?student=...`,
  - build verificado: `GestorNotasFp_0.1.0-build.202606031114_x64-setup.exe`.
- Bug fix nota final empresa 2026-06-03 (commit `757d3a2`):
  - `compute_nota_final_with_empresa` en Rust lee `%I/%E` de PESOS por RA y calcula nota final real,
  - `excel_save_notas_empresa` usa la nueva funcion al escribir `FINAL!IK <v>`,
  - `load_nota_final_combinada` carga PESOS y usa la nueva funcion; `ra_grades.emp` usa nota fresca de EMPRESA (evita caches `t="str"` del FINAL con valor `"-"`).
- Capa comun de usabilidad en todas las pantallas principales:
  - navegacion superior mas estable,
  - estado flotante de mensajes/guardado,
  - foco visible y enlace de salto al contenido,
  - confirmaciones propias para acciones sensibles,
  - atajo `Ctrl+S` / `Cmd+S` cuando existe boton de guardado.
- `gestor-notas`: busqueda de alumno, salto al primer error, navegacion de notas con teclado y confirmacion al vaciar notas.
- `incluir-actividad`: separacion visual entre editar actividad existente y crear una nueva.
- `gestor-rraa-criterios`: busqueda de CE por codigo/texto/RA y ayuda sobre ponderaciones en escala `0-1`.
- `scripts/prepare-tauri-web.js` copia tambien `ux-common.css` y `ux-common.js` para que el build Tauri incluya la capa UX.
- Menu de archivos recientes con validacion de existencia y eliminacion individual.
- Correcciones para evitar corrupcion por referencias/celdas XML no normalizadas.
- Alta de actividades con nombre editable.
- CE por alumno en `gestor-notas` (guardado selectivo con flag de modificacion).
- Panel RA en `visor-actividades`.
- Panel expandible RA/CE por alumno en `visor-unidades`.
- Ajustes visuales de `gestor-notas` para unificar estilo.

## Requisitos

- Node.js LTS
- NPM
- Rust toolchain (para Tauri)
- Dependencias del sistema para Tauri v2 (segun plataforma)
- Plantilla Excel compatible con la estructura esperada de hojas y columnas

## Documentacion complementaria

Revisar carpeta `Documentacion/` para guias detalladas:

- `MEMORIA_USABILIDAD.md`
- `Documentacion/README.md`
- `Documentacion/20-Tecnico/TAURI_MIGRACION.md`
- `Documentacion/20-Tecnico/OPTIMIZACIONES_RENDIMIENTO.md`
- `Documentacion/10-Setup/QUICKSTART.md`
- `Documentacion/30-Operacion/GUIA_EMPAQUETADO.md`

## Proximos pasos recomendados

1. Ejecutar build final con `npm run tauri:build`.
2. Validar instalador generado en entorno real.
3. Realizar bateria de pruebas sobre operaciones de lectura/escritura Excel.

## Modo web y Android

La aplicacion puede abrirse en navegador (incluido Android) usando las pantallas HTML.

Comportamiento esperado en web:

- Si no existe runtime Tauri, `app-bridge.js` activa modo web automaticamente.
- En ese modo, los gestores compatibles usan carga local de `.xlsx` en cliente (sin IPC de escritorio).
- El guardado en web se realiza como descarga de un Excel actualizado.

Flujo recomendado en Android:

1. Abrir `index.html` en el navegador.
2. Entrar en `Gestor Alumnos`, `Gestor Unidades` o `Gestor RRAA/Criterios`.
3. Cargar el archivo Excel desde el selector del navegador.
4. Editar los datos.
5. Guardar/descargar el `.xlsx` generado.

Notas:

- Las pantallas de empresa y nota final siguen orientadas a escritorio (dependen del backend Tauri).
- En modo web no se mantiene un archivo activo compartido entre pantallas; cada gestor carga su Excel localmente.

## Autor

Sebantonio
