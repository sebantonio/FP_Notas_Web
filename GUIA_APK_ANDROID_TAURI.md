# Guia APK Android (Tauri) - Gestor Notas FP

Fecha: 2026-07-25
Objetivo: compilar APK para trabajar en tablet con archivo Excel local, sin implementacion web cloud.

## 1. Enfoque elegido

Se abandona la ruta de backend web con OneDrive por restricciones de seguridad/autenticacion.

Se reutiliza la arquitectura actual de escritorio (Tauri + backend Rust) para Android, de modo que:

- la app corre nativa en tablet
- el Excel vive en la tablet
- la app lee/escribe ese Excel sin abrir Excel manualmente

## 2. Requisitos en el equipo de compilacion (Windows)

Instalar:

1. Node.js LTS
2. Rust (rustup)
3. Android Studio
4. Android SDK + Build Tools + Platform Tools
5. JDK 17 (normalmente con Android Studio)
6. NDK (desde SDK Manager)

Variables recomendadas:

- `ANDROID_HOME` o `ANDROID_SDK_ROOT`
- `JAVA_HOME`

## 3. Scripts ya preparados

En `package.json`:

- `npm run android:init`
- `npm run android:dev`
- `npm run android:build`
- `npm run android:build:apk`
- `npm run android:open`

## 4. Flujo de trabajo recomendado

### Paso A: inicializar entorno Android de Tauri

```bash
npm install
npm run android:init
```

### Paso B: abrir proyecto Android nativo

```bash
npm run android:open
```

Esto abre Android Studio sobre el proyecto Android generado por Tauri.

### Paso C: generar APK

```bash
npm run android:build:apk
```

Alternativa:

```bash
npm run android:build
```

## 5. Instalacion en tablet

Opciones:

1. USB debug + `adb install <ruta-apk>`
2. Transferir APK a tablet e instalar manualmente

En Android, permitir instalacion de apps desconocidas para el instalador usado.

## 6. Ubicacion tipica del APK

Tauri puede variar la ruta segun version; revisar salida de `android:build` y buscar en:

- `src-tauri/gen/android/.../build/outputs/apk/`
- o ruta equivalente que informe la CLI

## 7. Trabajo con Excel en tablet

Objetivo funcional esperado:

- seleccionar archivo Excel local desde la app
- guardar cambios sobre el propio archivo local
- operar modulos (notas, alumnos, unidades, RA/CE, etc.) desde la app nativa

Nota:

- el acceso al sistema de archivos en Android puede requerir selector SAF (Storage Access Framework)
- si alguna llamada de archivo falla en Android, se ajusta el bridge de seleccion/permiso

## 8. Estado actual del repositorio

- Ruta web Pages: operativa (se mantiene por compatibilidad)
- Ruta APK Android: preparada a nivel de scripts y documentacion
- Siguiente hito: ejecutar build Android en entorno con SDK/NDK y validar en tablet real

## 9. Checklist de primera compilacion

1. Instalar Android Studio + SDK + NDK
2. Verificar `java -version` y toolchain Rust
3. Ejecutar `npm run android:init`
4. Ejecutar `npm run android:build:apk`
5. Instalar APK en tablet
6. Probar seleccion de Excel local y guardado real

## 10. Si falla compilacion

Revisar:

1. SDK/NDK no instalados
2. Variables `ANDROID_HOME`/`ANDROID_SDK_ROOT` incorrectas
3. JDK incompatible
4. Licencias de SDK sin aceptar

Comando util (si aplica):

```bash
sdkmanager --licenses
```

## 11. Decisiones de producto

- Se prioriza app nativa Android para evitar bloqueos de autenticacion corporativa web.
- Se mantiene la base actual del proyecto para no rehacer logica de negocio.
