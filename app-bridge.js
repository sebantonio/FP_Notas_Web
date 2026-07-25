(function () {
  if (window.electronExcel) {
    return;
  }

  function createUnavailableApi(reason) {
    return new Proxy({}, {
      get(_target, prop) {
        if (prop === "isAvailable") {
          return false;
        }

        return function unavailableApiCall() {
          return Promise.reject(new Error(
            `API de escritorio no disponible (${reason}). Metodo solicitado: ${String(prop)}`
          ));
        };
      }
    });
  }

  const tauriCore = window.__TAURI__ && window.__TAURI__.core;

  if (!tauriCore || typeof tauriCore.invoke !== "function") {
    window.electronExcel = createUnavailableApi("Tauri core/invoke no inicializado");
    return;
  }

  const invoke = tauriCore.invoke;
  const invokeCommand = (command, args = {}) => invoke(command, args).catch((error) => {
    const message = error && error.message ? error.message : String(error);
    throw new Error(`[${command}] ${message}`);
  });

  window.electronExcel = {
    isAvailable: true,
    selectFile: () => invokeCommand("excel_select_file"),
    getSelectedFile: () => invokeCommand("excel_get_selected_file"),
    saveAlumnos: (alumnos) => invokeCommand("excel_save_alumnos", { alumnos }),
    getUnidades: () => invokeCommand("excel_get_unidades"),
    saveUnidades: (unidades) => invokeCommand("excel_save_unidades", { unidades }),
    getRraaCriterios: () => invokeCommand("excel_get_rraa_criterios"),
    saveRraaCriterios: (payloadOrRraa, criterios, ponderacionesUnidad = []) => {
      const payload = Array.isArray(payloadOrRraa)
        ? { rraa: payloadOrRraa, criterios, ponderacionesUnidad }
        : payloadOrRraa;
      return invokeCommand("excel_save_rraa_criterios", { payload });
    },
    getNotasActividad: (payload) => invokeCommand("excel_get_notas_actividad", { payload }),
    getNotasActividadesTipo: (payload) => invokeCommand("excel_get_notas_actividades_tipo", { payload }),
    saveNotasActividad: (payload) => invokeCommand("excel_save_notas_actividad", { payload }),
    saveCeNotas: (payload) => invokeCommand("excel_save_ce_notas", { payload }),
    addActividad: (payload) => invokeCommand("excel_add_actividad", { payload }),
    getNotasUnidad: (payload) => invokeCommand("excel_get_notas_unidad", { payload }),
    getNotasEmpresa: () => invokeCommand("excel_get_notas_empresa"),
    saveNotasEmpresa: (payload) => invokeCommand("excel_save_notas_empresa", { payload }),
    getNotaFinal: () => invokeCommand("excel_get_nota_final"),
    getNotasEvaluacion: (payload) => invokeCommand("excel_get_notas_evaluacion", { payload }),
    getNotasEvaluacionAlumno: (payload) => invokeCommand("excel_get_notas_evaluacion_alumno", { payload }),
    getAlumnosInformes: () => invokeCommand("excel_get_alumnos_informes"),
    setSelectedFile: (filePath) => invokeCommand("excel_set_selected_file", { filePath }),
    verifyFileExists: (filePath) => invokeCommand("excel_verify_file_exists", { filePath }),
    openExternal: (url) => invokeCommand("app_open_external", { url }),
    getDiarioData: () => invokeCommand("excel_get_diario"),
    saveDiarioEntrada: (payload) => invokeCommand("excel_save_diario_entrada", { payload }),
    deleteDiarioEntrada: (payload) => invokeCommand("excel_delete_diario_entrada", { payload }),
    undoLastChange: () => invokeCommand("excel_undo_last_change"),
    preflightSave: (payload) => invokeCommand("excel_preflight_save", { payload }),
    getFileStatus: () => invokeCommand("excel_get_file_status"),
    getSettings: () => invokeCommand("excel_get_settings"),
    saveSettings: (payload) => invokeCommand("excel_save_settings", { payload }),
    exportDiagnostics: () => invokeCommand("excel_export_diagnostics"),
    getVersionInfo: () => invokeCommand("app_get_version_info")
  };
})();
