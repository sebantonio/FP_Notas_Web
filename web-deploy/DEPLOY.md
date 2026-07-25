# Publicar en GitHub Pages

## Opcion rapida (recomendada)

1. Crea un repositorio nuevo (por ejemplo `FP_Notas_Web_Pages`).
2. Sube TODO el contenido de esta carpeta `web-deploy/` a la raiz del repo nuevo.
3. En GitHub: `Settings` -> `Pages`.
4. En `Build and deployment`, selecciona:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` y carpeta `/ (root)`
5. Guarda y espera 1-3 minutos.
6. Abre la URL publicada de Pages.

## Como usar desde la web

1. Abre `index.html` en la URL publicada.
2. Entra en un gestor web (alumnos, unidades o RRAA/criterios).
3. Carga tu archivo `.xlsx` desde el selector del navegador.
4. Edita datos.
5. Guarda para descargar el Excel actualizado.

## Importante

- En navegador no se puede sobrescribir directamente el archivo original del dispositivo.
- El flujo correcto es: cargar archivo -> editar -> descargar archivo actualizado.
- Si quieres guardar siempre sobre un Excel en la nube sin descarga manual, necesitas backend (OneDrive/Google Drive API).
