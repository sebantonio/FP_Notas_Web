# Continuidad Web + GitHub Pages (2026-07-25)

Este documento resume de forma detallada lo realizado en la fase de publicacion web (GitHub Pages), adaptacion Android/web y flujo OneDrive para poder retomar trabajo en cualquier sesion posterior.

## 1) Objetivo de esta fase

- Publicar la app en una URL web estable (GitHub Pages).
- Habilitar uso en navegador/Android sin runtime Tauri.
- Mantener compatibilidad con modo escritorio (Tauri).
- Mejorar el acceso a OneDrive desde portada y guardar rutas en Recientes.

## 2) Resultado actual

- URL publica: https://sebantonio.github.io/FP_Notas_Web/
- Deploy automatico activo en cada push a `main`.
- Portada web con botones de OneDrive:
  - `Explorar OneDrive`
  - `Guardar archivo OD`
  - `Config. OneDrive`
- Recientes en modo web soporta enlaces URL (http/https).

## 3) Cambios tecnicos aplicados

### 3.1 app-bridge.js

Archivo: `app-bridge.js`

Cambio clave:

- Cuando no existe Tauri (`window.__TAURI__.core.invoke`), ya no se inyecta proxy de escritorio no funcional.
- En su lugar:
  - marca runtime web con `window.__APP_RUNTIME__ = "web"`
  - retorna sin exponer API desktop falsa
- En desktop se marca `window.__APP_RUNTIME__ = "desktop"`.

Impacto:

- Las pantallas que ya tenian flujo web (XLSX cliente) entran correctamente en modo navegador.
- Se evita detectar "electronExcel" cuando realmente no hay backend local.

### 3.2 index.html (fase web)

Archivo: `index.html`

Mejoras realizadas:

1. Estado visual web/Android
- Mensaje explicito en "Archivo activo" cuando no hay Tauri.
- Ocultacion de controles exclusivamente desktop (ej. cambiar archivo local).

2. Configuracion OneDrive
- Persistencia en `localStorage`:
  - key: `oneDrivePickerUrl`
  - fallback: URL por defecto
- Funcion de validacion de URL (`http://` o `https://`).

3. Nuevos botones OneDrive
- `Explorar OneDrive`: abre URL configurada en pestana nueva.
- `Guardar archivo OD`:
  - pide URL de archivo
  - sugiere nombre por parseo de URL
  - permite nombre personalizado
  - guarda en Recientes

4. Recientes web
- Si la ruta guardada es URL `http/https`, se abre en navegador.
- Se mantiene compatibilidad con rutas locales desktop.

5. Limpieza
- Eliminada propiedad CSS invalida (`group`) detectada por diagnosticos.

### 3.3 README.md

Archivo: `README.md`

Actualizado con:

- Seccion de estado actual web (2026-07-25).
- Estado del deploy automatico y flujo de OneDrive.
- Limitaciones de seguridad del navegador.
- Enlace a este documento de continuidad.

## 4) GitHub Pages: configuracion y automatizacion

### 4.1 Workflow principal

Archivo: `.github/workflows/deploy-pages.yml`

Estrategia final:

- Trigger: push a `main` y `workflow_dispatch`.
- Build artifact: genera carpeta temporal `_site` desde archivos fuente de raiz.
- Upload pages artifact: publica `_site`.
- Deploy pages: `actions/deploy-pages@v4`.
- Incluye `enablement: true` en `actions/configure-pages`.

### 4.2 Motivo del ajuste

Problema inicial:

- Deploy fallaba por Pages no habilitado y/o desalineacion entre archivos en raiz y `web-deploy`.

Solucion:

- Activar Pages desde workflow (`enablement: true`).
- Dejar de depender de copia manual a `web-deploy` para cambios nuevos.
- Construir siempre artefacto desde la version fuente actual.

## 5) Cronologia de commits relevantes

Orden descendente (mas reciente -> mas antiguo):

- `bfa01cc` feat(index): explorar OneDrive y guardar archivos en recientes
- `db01fbf` ci(pages): generar artefacto web desde codigo fuente
- `fea8ba5` fix(pages): sincronizar index publicado con boton Config OneDrive
- `0c82df9` feat(index): configurar URL de OneDrive desde la portada
- `fd9aec8` ci(pages): auto habilitar Pages en configure-pages
- `1e7b5e1` ci(pages): desplegar web-deploy en GitHub Pages
- `fe19e40` chore(web): eliminar desktop.ini del paquete
- `97d1cd3` chore(web): crear paquete web-deploy para publicacion
- `e4b0149` chore: snapshot pre web-deploy package
- `ce5b83a` feat(web): habilitar modo Android/web sin Tauri
- `0734ff4` chore: snapshot pre android web mode

## 6) Verificacion realizada

- Confirmacion por API de GitHub Actions (`/actions/workflows/deploy-pages.yml/runs`) con runs en `success` para commits recientes.
- Confirmacion de contenido publicado en Pages con querystring anti-cache, incluyendo los botones de OneDrive.
- Confirmacion de archivo fuente en GitHub raw con el JS/HTML esperado.

## 7) Flujo de uso recomendado (web/Android)

1. Abrir la portada en GitHub Pages.
2. Pulsar `Config. OneDrive` para definir carpeta/base.
3. Pulsar `Explorar OneDrive` para navegar y localizar archivo.
4. Copiar enlace del archivo en OneDrive.
5. Pulsar `Guardar archivo OD` y guardar nombre legible.
6. Abrir ese item desde Recientes cuando se necesite.
7. Cargar Excel en gestor correspondiente para edicion local en navegador y descarga de salida.

## 8) Limitaciones y decisiones de diseno

Limitacion de plataforma:

- El navegador no permite "adjuntar" automaticamente un archivo remoto OneDrive como objeto `File` local sin interaccion de usuario (sandbox de seguridad).

Decisiones tomadas:

- Mantener el flujo web simple y robusto basado en enlaces y carga manual de archivo.
- No introducir backend adicional en esta fase.

## 9) Pendientes sugeridos para siguiente fase

1. Integracion Microsoft Graph + OAuth (si se desea picker nativo real y lectura/escritura cloud).
2. Unificar el "archivo activo" entre pantallas web (estado compartido + UX consistente).
3. Añadir boton "Deploy now" manual en Actions para forzar publish sin cambios de codigo.
4. Añadir tests de smoke web para portada y acciones OneDrive.

## 10) Comandos rapidos de mantenimiento

```bash
# Ver estado de rama
 git status -sb

# Ver ultimos commits
 git log --oneline -12

# Push normal (dispara deploy Pages)
 git push
```

## 11) Nota operativa

Si en algun momento la portada no refleja cambios recientes:

- Probar con querystring (`?v=timestamp`) para evitar cache.
- Revisar ultimo run de `Deploy Pages` en Actions.
- Confirmar que el cambio esta en `main` y que el workflow publico `_site` correctamente.

## 12) Artefactos nuevos para backend web

- `CONTRATO_API_WEB_ONEDRIVE.md`: contrato funcional completo para implementar backend + Graph.
- `api-openapi-web-onedrive.yaml`: especificacion OpenAPI base para arrancar implementacion.
