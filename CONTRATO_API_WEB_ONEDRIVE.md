# Contrato API Web + OneDrive (Excel remoto)

Fecha: 2026-07-25
Estado: Propuesto y listo para implementacion

## 1. Objetivo

Definir una API estable para que la aplicacion web trabaje directamente sobre un Excel en OneDrive (leer y escribir) sin abrir Excel manualmente.

La API debe mantener compatibilidad funcional con los metodos actuales del bridge desktop (`window.electronExcel`) para minimizar cambios en pantallas HTML.

## 2. Alcance funcional

Incluye:

- Autenticacion Microsoft (Entra ID), compatible con escenarios donde el usuario use certificado digital en el login de Microsoft.
- Seleccion y persistencia del archivo Excel en sesion.
- Lectura y guardado de datos en las pantallas actuales.
- Endpoints orientados a negocio (alumnos, unidades, RA/CE, notas, evaluaciones, empresa, informes, diario).

No incluye en esta fase:

- Colaboracion en tiempo real multiusuario con resolucion avanzada de conflictos.
- Offline completo con sincronizacion diferida.

## 3. Arquitectura recomendada

- Frontend: GitHub Pages (estatico).
- Backend API: Azure Functions o App Service (Node.js).
- Identidad: Entra ID (OAuth/OIDC).
- Datos: Microsoft Graph + Excel REST.
- Sesion: cookie HttpOnly + SameSite=None + Secure.

## 4. Seguridad y autenticacion

Regla clave:

- El certificado digital lo gestiona Microsoft durante el login (pantalla de identidad), no JavaScript de la app.

Modelo recomendado:

- `Authorization Code + PKCE` entre frontend y backend.
- Backend almacena token de acceso/refresco de Graph asociado a sesion.
- Frontend nunca persiste token Graph en `localStorage`.

## 5. Convenciones de API

Base URL:

- `https://<tu-backend>/api`

Headers:

- `Content-Type: application/json`
- `X-Request-Id` opcional para trazas.

Formato de respuesta:

- Exito:

```json
{ "ok": true, "data": { "...": "..." } }
```

- Error:

```json
{
  "ok": false,
  "error": {
    "code": "FILE_NOT_SELECTED",
    "message": "No hay archivo Excel seleccionado en la sesion"
  }
}
```

Codigos HTTP:

- `200` exito
- `400` validacion
- `401` no autenticado
- `403` prohibido
- `404` no encontrado
- `409` conflicto de version
- `500` error servidor

## 6. Endpoints de sesion e identidad

### 6.1 GET /auth/status

Uso:

- Saber si la sesion esta autenticada.

Respuesta:

```json
{
  "ok": true,
  "data": {
    "authenticated": true,
    "user": {
      "displayName": "Sebantonio",
      "email": "usuario@dominio"
    }
  }
}
```

### 6.2 GET /auth/login

Uso:

- Inicia login en Microsoft (redirect).

### 6.3 GET /auth/callback

Uso:

- Callback OAuth.

### 6.4 POST /auth/logout

Uso:

- Cierra sesion local.

## 7. Endpoints de seleccion de archivo OneDrive

### 7.1 GET /excel/file/current

Uso:

- Devuelve archivo seleccionado en sesion.

Respuesta:

```json
{
  "ok": true,
  "data": {
    "selected": true,
    "file": {
      "driveId": "b!abc",
      "itemId": "01XYZ",
      "name": "PlantillaNotas.xlsx",
      "webUrl": "https://..."
    }
  }
}
```

### 7.2 POST /excel/file/select

Uso:

- Fijar archivo activo para toda la app web.

Request:

```json
{
  "driveId": "b!abc",
  "itemId": "01XYZ",
  "name": "PlantillaNotas.xlsx",
  "webUrl": "https://..."
}
```

### 7.3 GET /excel/file/picker-url

Uso:

- Devuelve URL para abrir picker/navegacion OneDrive.

## 8. Endpoints de negocio (mapeo con bridge actual)

Nota:

- El objetivo es que cada metodo actual tenga equivalente web API.

### 8.1 Alumnos

- `GET /excel/alumnos` -> equivalente `getAlumnos`/carga en gestor-alumnos
- `PUT /excel/alumnos` -> equivalente `saveAlumnos`

Request `PUT /excel/alumnos`:

```json
{
  "alumnos": [
    { "numero": 1, "nombre": "Alumno", "fechaNac": "2008-01-10" }
  ],
  "expectedVersion": "W/\"etag-actual\""
}
```

### 8.2 Unidades

- `GET /excel/unidades` -> `getUnidades`
- `PUT /excel/unidades` -> `saveUnidades`

### 8.3 RRAA + Criterios + Ponderaciones

- `GET /excel/rraa-criterios` -> `getRraaCriterios`
- `PUT /excel/rraa-criterios` -> `saveRraaCriterios`

Payload `PUT`:

```json
{
  "payload": {
    "rraa": [],
    "criterios": [],
    "ponderacionesUnidad": [],
    "raPesos": []
  },
  "expectedVersion": "W/\"etag-actual\""
}
```

### 8.4 Notas por actividad

- `POST /excel/notas-actividad/get` -> `getNotasActividad`
- `POST /excel/notas-actividad/save` -> `saveNotasActividad`
- `POST /excel/notas-actividad/tipo` -> `getNotasActividadesTipo`
- `POST /excel/ce-notas/save` -> `saveCeNotas`
- `POST /excel/actividad/add` -> `addActividad`

### 8.5 Notas por unidad/evaluacion

- `POST /excel/notas-unidad` -> `getNotasUnidad`
- `POST /excel/notas-evaluacion` -> `getNotasEvaluacion`
- `POST /excel/notas-evaluacion-alumno` -> `getNotasEvaluacionAlumno`

### 8.6 Empresa + final

- `GET /excel/notas-empresa` -> `getNotasEmpresa`
- `PUT /excel/notas-empresa` -> `saveNotasEmpresa`
- `GET /excel/nota-final` -> `getNotaFinal`

### 8.7 Informes y diario

- `GET /excel/alumnos-informes` -> `getAlumnosInformes`
- `GET /excel/diario` -> `getDiarioData`
- `PUT /excel/diario/entrada` -> `saveDiarioEntrada`
- `DELETE /excel/diario/entrada` -> `deleteDiarioEntrada`

### 8.8 Utilidades

- `GET /excel/file-status` -> `getFileStatus`
- `GET /app/version` -> `getVersionInfo`

## 9. Control de concurrencia

Todos los endpoints de escritura deben aceptar `expectedVersion`.

Si el archivo remoto cambia entre lectura y guardado:

- devolver `409 CONFLICT`
- incluir version actual del servidor
- frontend decide: recargar, fusionar o reintentar

Ejemplo 409:

```json
{
  "ok": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "El archivo fue modificado por otro proceso",
    "serverVersion": "W/\"etag-nuevo\""
  }
}
```

## 10. Mapeo bridge web sugerido

En `app-bridge.js`, en modo web, crear adaptador que conserve firmas actuales y llame a `/api`.

Ejemplo conceptual:

- `window.electronExcel.getUnidades()` -> `GET /api/excel/unidades`
- `window.electronExcel.saveUnidades(unidades)` -> `PUT /api/excel/unidades`

Objetivo:

- Mantener HTML actuales con minimos cambios.

## 11. Plan de implementacion por fases

Fase A (fundacion):

- Auth endpoints
- file/current + file/select
- health/version

Fase B (lectura):

- alumnos, unidades, rraa-criterios, notas lectura

Fase C (escritura):

- save alumnos/unidades/rraa/notas/empresa

Fase D (refinamiento):

- conflictos, auditoria, telemetria, hardening

## 12. Criterios de aceptacion

- Usuario inicia sesion Microsoft con su metodo corporativo (incluido certificado si aplica).
- Selecciona archivo OneDrive una vez por sesion.
- Puede abrir `gestor-notas.html` y guardar cambios sin descargar/subir manualmente.
- Puede abrir visores y ver datos en tiempo real del archivo seleccionado.

## 13. Riesgos y mitigaciones

Riesgo: politicas tenant bloquean scopes o login.
Mitigacion: alinear permisos con administrador M365 antes de rollout.

Riesgo: bloqueo por edicion simultanea en Excel Web.
Mitigacion: control de version + mensajes de conflicto + reintento.

Riesgo: latencia Graph en hojas grandes.
Mitigacion: cache por secciones, lectura por rangos y no por libro completo.
