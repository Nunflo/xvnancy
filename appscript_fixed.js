// ============================================================
//  SISTEMA XV NANCY PAOLA — Google Apps Script v2.2 (COMPLETO)
//  NOVEDADES Y FIXES:
//  - Envío masivo automatizado en ventana flotante con delay programable.
//  - Solucionado error de primer escaneo QR marcado como duplicado.
//  - Concurrencia controlada con LockService en validaciones QR.
//  - Dashboard automático en hoja "Resumen"
//  - Menú extendido con herramientas de limpieza y monitoreo de QR.
// ============================================================

// ============================================================
//  CONFIGURACIÓN CENTRAL
// ============================================================
var CONFIG = {
  NOMBRE_HOJA:          "Hoja 1",
  NOMBRE_HOJA_RESUMEN:  "Resumen",
  NOMBRE_HOJA_MESAS:    "Mesas",
  FECHA_LIMITE:         new Date("2026-07-20T23:59:00"),
  FECHA_EVENTO:         new Date("2026-08-15T10:00:00"), 
  INTERVALO_DIAS:       5,
  URL_BASE:             "https://xvnancy.vercel.app",

  // Columnas de Hoja 1 (índice 0 = columna A)
  COL_ID:               0,  // A — idInvitado
  COL_FAMILIA:          1,  // B — Familia
  COL_TELEFONO:         2,  // C — Teléfono
  COL_INTEGRANTES:      3,  // D — Integrantes
  COL_LINK_WA:          4,  // E — WhatsApp
  COL_ASISTENCIA:       5,  // F — Confirmación
  COL_LINK_VERCEL:      6,  // G — Link invitación
  COL_MESA:             7,  // H — Mesa (familia/grupo)
  COL_ULT_RECORDATORIO: 8,  // I — Último recordatorio
  COL_BAJA:             9,  // J — Baja
};

// ============================================================
//  MENÚ PERSONALIZADO EN GOOGLE SHEETS
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎀 XV Nancy Paola')
    .addItem('📊 Actualizar Dashboard', 'actualizarDashboard')
    .addSeparator()
    .addItem('🚀 Envío masivo AUTOMÁTICO (pendientes)', 'abrirEnvioMasivo')
    .addItem('🚀 Envío masivo AUTOMÁTICO (todos)', 'abrirEnvioMasivoTodos')
    .addSeparator()
    .addItem('🪑 Generar hoja de Mesas individuales', 'generarHojaMesas')
    .addSeparator()
    .addItem('🔍 Ver estado de accesos QR', 'verEstadoAccesos')
    .addItem('🗑️ Limpiar accesos QR (para pruebas)', 'limpiarAccesosMesas')
    .addSeparator()
    .addItem('🔧 Instalar triggers', 'instalarTriggers')
    .addItem('▶️ Ejecutar rutina ahora', 'rutinaDiaria')
    .addToUi();
}

// ============================================================
//  1. API PRINCIPAL (doGet) - COMUNICACIÓN FRONTEND VERCEL
// ============================================================
function doGet(e) {
  var id           = e.parameter.id   || "";
  var callback     = e.parameter.callback || "";
  var confirmacion = e.parameter.confirmacion || "";
  var tipo         = e.parameter.tipo || ""; // "integrante" para QR individual

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!sheet) return jsonpResponse(callback, { error: "Hoja principal no encontrada" });

  _asegurarEncabezados(sheet);

  // ── MODO INTEGRANTE: QR individual (busca en hoja Mesas) ──
  if (tipo === "integrante") {
    var token = e.parameter.token || "";
    return _consultarIntegrante(callback, id, confirmacion, token);
  }

  // ── MODO FAMILIA: flujo original de invitación web ──
  var data = sheet.getDataRange().getValues();
  var idBusqueda = id.toString().trim().toUpperCase();

  for (var i = 1; i < data.length; i++) {
    var filaId      = data[i][CONFIG.COL_ID]      ? data[i][CONFIG.COL_ID].toString().trim().toUpperCase()      : "";
    var filaFamilia = data[i][CONFIG.COL_FAMILIA]  ? data[i][CONFIG.COL_FAMILIA].toString().trim().toUpperCase() : "";

    if (!filaId && !filaFamilia) continue;
    if (filaId !== idBusqueda && filaFamilia !== idBusqueda) continue;

    // GUARDAR CONFIRMACIÓN DESDE LA WEB
    if (confirmacion) {
      sheet.getRange(i + 1, CONFIG.COL_ASISTENCIA + 1).setValue(confirmacion);
      var telefono = data[i][CONFIG.COL_TELEFONO] ? data[i][CONFIG.COL_TELEFONO].toString().trim() : "";
      var familia  = data[i][CONFIG.COL_FAMILIA]  ? data[i][CONFIG.COL_FAMILIA].toString().trim()  : "";
      var mesa     = data[i][CONFIG.COL_MESA]     ? data[i][CONFIG.COL_MESA].toString().trim()     : "";

      if (telefono && !_todosNoAsisten(confirmacion)) {
        var msgBienvenida = _construirMensajeBienvenida(familia, mesa, confirmacion);
        var linkBienvenida = _construirLinkWA(telefono, msgBienvenida);
        sheet.getRange(i + 1, CONFIG.COL_LINK_WA + 1).setValue(linkBienvenida);
      }

      if (_todosNoAsisten(confirmacion)) {
        sheet.getRange(i + 1, CONFIG.COL_BAJA + 1).setValue("BAJA");
        sheet.getRange(i + 1, CONFIG.COL_LINK_WA + 1).setValue("LINK DESACTIVADO");
      }

      // ✅ FIX BUG CRÍTICO: antes se creaba un trigger nuevo en CADA confirmación
      // sin borrar los anteriores → acumulación hasta el límite de 20 triggers del proyecto.
      try {
        ScriptApp.getProjectTriggers().forEach(function(t) {
          if (t.getHandlerFunction() === "actualizarDashboard") ScriptApp.deleteTrigger(t);
        });
        ScriptApp.newTrigger("actualizarDashboard").timeBased().after(60 * 1000).create();
      } catch(e) {}

      return jsonpResponse(callback, { estatus: "ok" });
    }

    // CONSULTAR DATOS DE LA FAMILIA
    var integrantesRaw = data[i][CONFIG.COL_INTEGRANTES]
      ? data[i][CONFIG.COL_INTEGRANTES].toString().split(",").map(function(n){ return n.trim(); })
      : [];

    var mesasIndividuales = _obtenerMesasIntegrantes(integrantesRaw, data[i][CONFIG.COL_MESA]);
    var objeto = {
      familia:              data[i][CONFIG.COL_FAMILIA],
      integrantes:          integrantesRaw,
      mesaFamilia:          data[i][CONFIG.COL_MESA] !== undefined && data[i][CONFIG.COL_MESA] !== "" ? data[i][CONFIG.COL_MESA].toString().trim() : "",
      mesasIndividuales:    mesasIndividuales,
      confirmacionAnterior: data[i][CONFIG.COL_ASISTENCIA]
    };
    return jsonpResponse(callback, objeto);
  }

  return jsonpResponse(callback, { error: "ID no encontrado" });
}

// ── CONSULTA Y VALIDACIÓN REAL DEL INTEGRANTE (QR CORREGIDO) ──
function _consultarIntegrante(callback, nombreIntegrante, confirmacion, token) {
  token = token || "";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssHojaMesas = ss.getSheetByName(CONFIG.NOMBRE_HOJA_MESAS);

  if (!ssHojaMesas) {
    return jsonpResponse(callback, {
      error: "Hoja 'Mesas' no encontrada. Ve a Sheets → menú XV Nancy Paola → Generar hoja de Mesas."
    });
  }

  var data     = ssHojaMesas.getDataRange().getValues();
  var busqueda = nombreIntegrante.toString().trim().toUpperCase();

  for (var i = 1; i < data.length; i++) {
    var nombre = data[i][0] ? data[i][0].toString().trim().toUpperCase() : "";
    if (nombre !== busqueda) continue;

    // ── REGISTRAR ACCESO (validar = escaneo QR real) ──
    // ✅ FIX BUG CRITICO: sin token secreto, el invitado puede abrir la URL del QR
    // desde su galeria y el sistema lo marcaria como duplicado antes del evento.
    if (confirmacion === "validar" && token !== "XV2026") {
      return jsonpResponse(callback, {
        nombre:  data[i][0],
        familia: data[i][1],
        mesa:    data[i][2]
      });
    }
    if (confirmacion === "validar") {
      var lock = LockService.getScriptLock();
      try {
        lock.waitLock(5000); // Bloqueo de seguridad anti peticiones fantasmas
      } catch (lockErr) {
        return jsonpResponse(callback, { error: "Servidor ocupado. Intenta de nuevo." });
      }

      // Re-lectura directa e instantánea de la celda específica para evitar falsos positivos
      var celdaAcceso = ssHojaMesas.getRange(i + 1, 4);
      var yaEscaneado = celdaAcceso.getValue().toString().trim();

      if (yaEscaneado !== "") {
        lock.releaseLock();
        return jsonpResponse(callback, {
          nombre:      data[i][0], 
          familia:     data[i][1],
          mesa:        data[i][2],
          acceso:      "DUPLICADO",
          escaneadoEn: yaEscaneado
        });
      }

      // Registro correcto en primera lectura
      var timestamp = new Date().toLocaleString("es-MX");
      celdaAcceso.setValue(timestamp);
      SpreadsheetApp.flush(); // Forzar persistencia inmediata en la DB
      lock.releaseLock();
      return jsonpResponse(callback, {
        nombre:  data[i][0],
        familia: data[i][1],
        mesa:    data[i][2],
        acceso:  "OK"
      });
    }

    // ── CONSULTA SIMPLE INFORMATIVA ──
    return jsonpResponse(callback, {
      nombre:  data[i][0],
      familia: data[i][1],
      mesa:    data[i][2]
    });
  }

  return jsonpResponse(callback, { error: "Integrante no encontrado: " + nombreIntegrante });
}

// ============================================================
//  2. GENERAR HOJA DE MESAS INDIVIDUALES
// ============================================================
function generarHojaMesas() {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var hojaOrig  = ss.getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!hojaOrig) return;

  var hojaMesas = ss.getSheetByName(CONFIG.NOMBRE_HOJA_MESAS);
  if (!hojaMesas) {
    hojaMesas = ss.insertSheet(CONFIG.NOMBRE_HOJA_MESAS);
  }

  var mesasExistentes = {};
  var accesosExistentes = {};
  var dataExistente = hojaMesas.getDataRange().getValues();
  for (var x = 1; x < dataExistente.length; x++) {
    var nomEx = dataExistente[x][0] ? dataExistente[x][0].toString().trim() : "";
    if (nomEx) {
      mesasExistentes[nomEx]   = dataExistente[x][2] || "";
      accesosExistentes[nomEx] = dataExistente[x][3] || "";
    }
  }

  var data = hojaOrig.getDataRange().getValues();
  var filas = [["Integrante", "Familia", "Mesa Individual", "Acceso (escaneo)", "Teléfono Familia", "Asistencia"]];

  for (var i = 1; i < data.length; i++) {
    var fila       = data[i];
    var familia    = fila[CONFIG.COL_FAMILIA]    ? fila[CONFIG.COL_FAMILIA].toString().trim()    : "";
    var integrantesStr = fila[CONFIG.COL_INTEGRANTES] ? fila[CONFIG.COL_INTEGRANTES].toString() : "";
    var mesaFamilia    = fila[CONFIG.COL_MESA]        ? fila[CONFIG.COL_MESA].toString().trim()  : "";
    var telefono       = fila[CONFIG.COL_TELEFONO]    ? fila[CONFIG.COL_TELEFONO].toString().trim(): "";
    var asistencia     = fila[CONFIG.COL_ASISTENCIA]  ? fila[CONFIG.COL_ASISTENCIA].toString()   : "";

    if (!familia && !integrantesStr) continue;
    var integrantes = integrantesStr.split(",").map(function(n){ return n.trim(); }).filter(Boolean);

    if (integrantes.length === 0 && familia) integrantes = [familia];
    integrantes.forEach(function(nombre) {
      if (!nombre) return;
      var mesaInd = mesasExistentes[nombre] !== undefined && mesasExistentes[nombre] !== "" ? mesasExistentes[nombre] : mesaFamilia;
      var acceso = accesosExistentes[nombre] || "";
      var esteAsiste = asistencia === "" || asistencia.includes(nombre + ": Asistirá");

      filas.push([nombre, familia, mesaInd, acceso, telefono, esteAsiste ? "Asistirá" : "No asistirá"]);
    });
  }

  hojaMesas.clearContents();
  hojaMesas.getRange(1, 1, filas.length, filas[0].length).setValues(filas);

  var headerRange = hojaMesas.getRange(1, 1, 1, 6);
  headerRange.setBackground("#5A0D15");
  headerRange.setFontColor("#C5A059");
  headerRange.setFontWeight("bold");
  hojaMesas.setFrozenRows(1);
  hojaMesas.autoResizeColumns(1, 6);
  SpreadsheetApp.getUi().alert(
    "✅ Hoja de Mesas generada con " + (filas.length - 1) + " integrantes.\n\n" +
    "Puedes editar la columna 'Mesa Individual' para asignar mesas diferentes."
  );
}

function _obtenerMesasIntegrantes(integrantes, mesaFamiliaDefault) {
  var resultado = {};
  var hojaMesas = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA_MESAS);
  if (!hojaMesas) {
    integrantes.forEach(function(n) { resultado[n] = mesaFamiliaDefault || ""; });
    return resultado;
  }

  var data = hojaMesas.getDataRange().getValues();
  var mapasMesas = {};
  for (var i = 1; i < data.length; i++) {
    var nom = data[i][0] ? data[i][0].toString().trim() : "";
    if (nom) mapasMesas[nom] = data[i][2] ? data[i][2].toString().trim() : (mesaFamiliaDefault || "");
  }

  integrantes.forEach(function(n) {
    resultado[n] = mapasMesas[n] || mesaFamiliaDefault || "";
  });

  return resultado;
}

// ============================================================
//  3. DASHBOARD EN HOJA "Resumen"
// ============================================================
function actualizarDashboard() {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var hojaOrig  = ss.getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!hojaOrig) return;

  var hojaRes = ss.getSheetByName(CONFIG.NOMBRE_HOJA_RESUMEN);
  if (!hojaRes) hojaRes = ss.insertSheet(CONFIG.NOMBRE_HOJA_RESUMEN);
  var data = hojaOrig.getDataRange().getValues();

  var totalFamilias  = 0;
  var totalInvitados = 0;
  var confirmados    = 0;
  var noAsisten      = 0;
  var sinRespuesta   = 0;
  var bajas          = 0;
  var mesasOcupadas  = {};
  var historial      = [];
  var ahora          = new Date();

  for (var i = 1; i < data.length; i++) {
    var fila       = data[i];
    var id         = fila[CONFIG.COL_ID]        ? fila[CONFIG.COL_ID].toString().trim()        : "";
    var familia    = fila[CONFIG.COL_FAMILIA]   ? fila[CONFIG.COL_FAMILIA].toString().trim()   : "";
    var asistencia = fila[CONFIG.COL_ASISTENCIA] ? fila[CONFIG.COL_ASISTENCIA].toString().trim(): "";
    var baja       = fila[CONFIG.COL_BAJA]       ? fila[CONFIG.COL_BAJA].toString().trim()      : "";
    var mesa       = fila[CONFIG.COL_MESA]       ? fila[CONFIG.COL_MESA].toString().trim()      : "";
    var integrantesStr = fila[CONFIG.COL_INTEGRANTES] ? fila[CONFIG.COL_INTEGRANTES].toString() : "";
    var integrantes    = integrantesStr ? integrantesStr.split(",").length : 1;

    if (!id && !familia) continue;

    totalFamilias++;
    totalInvitados += integrantes;
    if (baja === "BAJA") { bajas++; continue; }

    if (asistencia === "") {
      sinRespuesta++;
    } else if (_todosNoAsisten(asistencia)) {
      noAsisten++;
    } else {
      confirmados++;
      if (mesa) mesasOcupadas[mesa] = (mesasOcupadas[mesa] || 0) + integrantes;
    }

    historial.push([familia, integrantes, asistencia || "Sin respuesta", mesa, baja === "BAJA" ? "BAJA" : "Activo"]);
  }

  var totalMesas = Object.keys(mesasOcupadas).length;

  hojaRes.clearContents();

  var resumen = [
    ["📊 DASHBOARD — XV NANCY PAOLA", "", "Actualizado:", ahora.toLocaleString("es-MX")],
    [""],
    ["📌 RESUMEN GENERAL", "", "", ""],
    ["Total familias invitadas",  totalFamilias,  "", ""],
    ["Total personas invitadas",  totalInvitados, "", ""],
    ["✅ Familias confirmadas",   confirmados,    "", ""],
    ["❌ Familias no asisten",    noAsisten,      "", ""],
    ["⏳ Sin respuesta",           sinRespuesta,   "", ""],
    ["🚫 Dados de baja",          bajas,          "", ""],
    ["🪑 Mesas ocupadas",         totalMesas,     "", ""],
    ["🎟️ Accesos QR registrados",  _contarAccesosQR(), "", ""],
    [""],
    ["🪑 PERSONAS POR MESA", "", "", ""],
  ];

  Object.keys(mesasOcupadas).sort().forEach(function(m) {
    resumen.push(["Mesa " + m, mesasOcupadas[m] + " personas", "", ""]);
  });

  resumen.push([""]);
  resumen.push(["📋 DETALLE POR FAMILIA", "Integrantes", "Estado confirmación", "Mesa", "Estado link"]);
  historial.forEach(function(h) { resumen.push(h); });

  hojaRes.getRange(1, 1, resumen.length, 5).setValues(resumen);
  hojaRes.getRange(1, 1, 1, 5).setBackground("#5A0D15").setFontColor("#C5A059").setFontWeight("bold");
  hojaRes.getRange(3, 1, 1, 5).setBackground("#800020").setFontColor("white").setFontWeight("bold");
  hojaRes.getRange(13, 1, 1, 5).setBackground("#800020").setFontColor("white").setFontWeight("bold");
  hojaRes.autoResizeColumns(1, 5);
}

// ============================================================
//  4. ENVÍO MASIVO AUTOMATIZADO CON POPUPS CONTROLADOS
// ============================================================
function abrirEnvioMasivo() { _mostrarDialogoWA(false); }
function abrirEnvioMasivoTodos() { _mostrarDialogoWA(true); }

function _mostrarDialogoWA(incluirTodos) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var ahora = new Date();
  var diasLimite = _diasRestantes(ahora, CONFIG.FECHA_LIMITE);
  var filas = [];

  for (var i = 1; i < data.length; i++) {
    var fila       = data[i];
    var id         = fila[CONFIG.COL_ID]        ? fila[CONFIG.COL_ID].toString().trim()       : "";
    var familia    = fila[CONFIG.COL_FAMILIA]   ? fila[CONFIG.COL_FAMILIA].toString().trim()  : "";
    var telefono   = fila[CONFIG.COL_TELEFONO]  ? fila[CONFIG.COL_TELEFONO].toString().trim() : "";
    var asistencia = fila[CONFIG.COL_ASISTENCIA]? fila[CONFIG.COL_ASISTENCIA].toString().trim(): "";
    var baja       = fila[CONFIG.COL_BAJA]      ? fila[CONFIG.COL_BAJA].toString().trim()     : "";

    if (!id || !telefono || baja === "BAJA") continue;
    
    // Si no forzamos a todos, omitimos los que ya tienen respuesta guardada
    if (!incluirTodos && asistencia !== "") continue;

    var linkConf  = CONFIG.URL_BASE + "/confirmacion?id=" + encodeURIComponent(id);
    var mensaje   = asistencia !== ""
      ? _construirMensajeBienvenida(familia, fila[CONFIG.COL_MESA] || "", asistencia)
      : _construirMensaje(familia, linkConf, diasLimite);
    var linkWA    = _construirLinkWA(telefono, mensaje);

    filas.push({ familia: familia, telefono: telefono, link: linkWA });
  }

  if (filas.length === 0) {
    SpreadsheetApp.getUi().alert("🎉 No hay contactos pendientes o procesables en la lista.");
    return;
  }

  var htmlTemplate = _generarHtmlAutomatizacion(filas);
  var htmlOutput = HtmlService.createHtmlOutput(htmlTemplate)
      .setWidth(450)
      .setHeight(360);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "📤 Envío Automático Controlado");
}

function _generarHtmlAutomatizacion(filas) {
  var JSON_CONTACTOS = JSON.stringify(filas);

  return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<style>' +
    'body{font-family: Arial, sans-serif; padding: 15px; color: #333; background: #fafafa;}' +
    'h3{color:#5A0D15; margin-top:0; text-align:center;}' +
    '.panel{background:#5A0D15; color:#C5A059; padding:12px; border-radius:8px; font-weight:bold; text-align:center; margin-bottom:15px;}' +
    '.control-box{ background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align:center;}' +
    'label{font-weight: bold; font-size: 13px; display: block; margin-bottom: 8px;}' +
    'input[type="number"]{width: 60px; padding: 5px; text-align: center; font-size: 14px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 15px;}' +
    '.btn-start{background:#25D366; color:white; padding:10px 20px; border-radius:20px; text-decoration:none; font-size:15px; font-weight:bold; border:none; cursor:pointer; width: 100%; display:block; transition: 0.3s;}' +
    '.btn-start:hover{background:#20ba59;}' +
    '#log{margin-top: 15px; font-size: 12px; color: #666; max-height: 80px; overflow-y: auto; text-align: left; padding: 5px; background: #eee; border-radius: 4px;}' +
    '</style></head>' +
    '<body>' +
    '<h3>🎀 Automatización WhatsApp</h3>' +
    '<div class="panel">Contactos listos para enviar: ' + filas.length + '</div>' +
    '<div class="control-box">' +
      '<label>⏱️ Intervalo entre envíos (segundos):<br>' +
      '<span style="font-weight:normal; font-size:11px; color:#777;">(Se recomiendan 6-8 segundos para WhatsApp Business)</span></label>' +
      '<input type="number" id="delay" value="7" min="4" max="20">' +
      '<button class="btn-start" id="btnAccion" onclick="iniciarEnvio()">🚀 Iniciar Envío Automático</button>' +
      '<div id="log">Esperando instrucciones...</div>' +
    '</div>' +
    '<script>' +
      'var contactos = ' + JSON_CONTACTOS + ';' +
      'var indice = 0;' +
      'var ventanaActual = null;' +
      'function iniciarEnvio() {' +
        'document.getElementById("btnAccion").disabled = true;' +
        'document.getElementById("btnAccion").style.background = "#aaa";' +
        'document.getElementById("btnAccion").innerText = "⏳ Procesando lista...";' +
        'procesarSiguiente();' +
      '}' +
      'function procesarSiguiente() {' +
        'if(indice >= contactos.length) {' +
          'document.getElementById("log").innerHTML += "<br><b>✅ ¡Envío masivo finalizado con éxito!</b>";' +
          'document.getElementById("btnAccion").innerText = "🎉 ¡Terminado!";' +
          'return;' +
        '}' +
        'var c = contactos[indice];' +
        'document.getElementById("log").innerHTML = "📦 Abriendo chat de: " + c.familia + " (" + (indice+1) + "/" + contactos.length + ")...";' +
        'ventanaActual = window.open(c.link, "_blank");' +
        'var segundos = parseInt(document.getElementById("delay").value) * 1000;' +
        'indice++;' +
        'setTimeout(function() {' +
          'if(ventanaActual) { try { ventanaActual.close(); } catch(e){} }' +
          'procesarSiguiente();' +
        '}, segundos);' +
      '}' +
    '</script>' +
    '</body></html>';
}

// ============================================================
//  5. MONITOREO Y LIMPIEZA DE QR
// ============================================================
function limpiarAccesosMesas() {
  // ✅ FIX SEGURIDAD: pedir confirmación ANTES de borrar — antes borraba sin preguntar,
  // lo cual era peligroso si se ejecutaba por accidente el día del evento.
  var ui = SpreadsheetApp.getUi();
  var respuesta = ui.alert(
    "⚠️ ¿Confirmar limpieza de accesos QR?",
    "Esto borrará TODOS los registros de escaneo de la hoja Mesas.\n\n✅ Correcto si es una PRUEBA antes del evento.\n❌ NO ejecutar el día del evento si ya hay accesos reales registrados.\n\n¿Deseas continuar?",
    ui.ButtonSet.YES_NO
  );
  if (respuesta !== ui.Button.YES) {
    ui.alert("Operación cancelada. No se borró ningún registro.");
    return;
  }

  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var hojaMesas = ss.getSheetByName(CONFIG.NOMBRE_HOJA_MESAS);

  if (!hojaMesas) {
    ui.alert("❌ No existe la hoja 'Mesas'. Primero genera la hoja desde el menú.");
    return;
  }

  var data           = hojaMesas.getDataRange().getValues();
  var registrosBorrados = 0;
  var registrosVacios = 0;

  for (var i = 1; i < data.length; i++) {
    var acceso = data[i][3] ? data[i][3].toString().trim() : "";
    if (acceso !== "") {
      hojaMesas.getRange(i + 1, 4).clearContent();
      registrosBorrados++;
    } else {
      registrosVacios++;
    }
  }

  ui.alert(
    "✅ Accesos QR limpiados correctamente.\n\n" +
    "• Registros de prueba borrados: " + registrosBorrados + "\n" +
    "• Ya estaban vacíos: " + registrosVacios + "\n\n" +
    "Ahora todos los QR pueden volver a escanearse desde cero."
  );
}

function verEstadoAccesos() {
  var ss        = SpreadsheetApp.getActiveSpreadsheet();
  var hojaMesas = ss.getSheetByName(CONFIG.NOMBRE_HOJA_MESAS);
  if (!hojaMesas) {
    SpreadsheetApp.getUi().alert("❌ No existe la hoja 'Mesas'.");
    return;
  }

  var data      = hojaMesas.getDataRange().getValues();
  var accedieron = [];
  var pendientes  = [];
  for (var i = 1; i < data.length; i++) {
    var nombre = data[i][0] ? data[i][0].toString().trim() : "";
    var acceso = data[i][3] ? data[i][3].toString().trim() : "";
    if (!nombre) continue;
    if (acceso !== "") {
      accedieron.push("✅ " + nombre + " (" + acceso + ")");
    } else {
      pendientes.push("⏳ " + nombre);
    }
  }

  var msg = "🎟️ CONTROL DE ACCESO (RESUMEN EN VIVO)\n\n" +
    "Ingresos totales: " + accedieron.length + "\n" +
    "Por ingresar: " + pendientes.length + "\n\n" +
    "📋 ÚLTIMOS ACCESOS:\n" + (accedieron.length ? accedieron.slice(-15).join("\n") : "Ninguno todavía");
  SpreadsheetApp.getUi().alert(msg);
}

// ============================================================
//  6. AUTOMATIZACIONES RECURRENTES (BACKGROUND CRON)
// ============================================================
function enviarRecordatorios() {
  var ahora = new Date();
  if (ahora > CONFIG.FECHA_LIMITE) return;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!sheet) return;

  _asegurarEncabezados(sheet);
  var data       = sheet.getDataRange().getValues();
  var enviados   = 0, omitidos = 0;
  var diasLimite = _diasRestantes(ahora, CONFIG.FECHA_LIMITE);

  for (var i = 1; i < data.length; i++) {
    var fila = data[i];
    var id         = fila[CONFIG.COL_ID]              ? fila[CONFIG.COL_ID].toString().trim()         : "";
    var familia    = fila[CONFIG.COL_FAMILIA]          ? fila[CONFIG.COL_FAMILIA].toString().trim()    : "";
    var telefono   = fila[CONFIG.COL_TELEFONO]         ? fila[CONFIG.COL_TELEFONO].toString().trim()   : "";
    var asistencia = fila[CONFIG.COL_ASISTENCIA]       ? fila[CONFIG.COL_ASISTENCIA].toString().trim() : "";
    var baja       = fila[CONFIG.COL_BAJA]             ? fila[CONFIG.COL_BAJA].toString().trim()       : "";
    var ultRecord  = fila[CONFIG.COL_ULT_RECORDATORIO] || "";
    
    if (!id || !telefono || baja === "BAJA" || asistencia !== "") { omitidos++; continue; }
    if (!_deberiEnviarHoy(ultRecord, ahora, CONFIG.INTERVALO_DIAS))  { omitidos++; continue; }

    var linkConf = CONFIG.URL_BASE + "/confirmacion?id=" + encodeURIComponent(id);
    var mensaje  = _construirMensaje(familia, linkConf, diasLimite);
    var linkWA   = _construirLinkWA(telefono, mensaje);

    sheet.getRange(i + 1, CONFIG.COL_LINK_WA + 1).setValue(linkWA);
    sheet.getRange(i + 1, CONFIG.COL_ULT_RECORDATORIO + 1).setValue(ahora);
    enviados++;
  }
  if (enviados > 0) _notificarAdmin(enviados, omitidos);
}

function darDeBajaLinks() {
  var ahora = new Date();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var fila       = data[i];
    var id         = fila[CONFIG.COL_ID]        ? fila[CONFIG.COL_ID].toString().trim()        : "";
    var asistencia = fila[CONFIG.COL_ASISTENCIA] ? fila[CONFIG.COL_ASISTENCIA].toString().trim(): "";
    var baja       = fila[CONFIG.COL_BAJA]       ? fila[CONFIG.COL_BAJA].toString().trim()      : "";

    if (!id || baja === "BAJA") continue;

    var deBaja = false;
    if (ahora > CONFIG.FECHA_LIMITE && asistencia === "") deBaja = true;
    if (asistencia !== "" && _todosNoAsisten(asistencia))  deBaja = true;
    if (deBaja) {
      sheet.getRange(i + 1, CONFIG.COL_BAJA + 1).setValue("BAJA");
      sheet.getRange(i + 1, CONFIG.COL_LINK_WA + 1).setValue("LINK DESACTIVADO");
    }
  }
}

function recordatorioDiaEvento() {
  var ahora = new Date();
  if (ahora.getDate() !== CONFIG.FECHA_EVENTO.getDate() ||
      ahora.getMonth() !== CONFIG.FECHA_EVENTO.getMonth() ||
      ahora.getFullYear() !== CONFIG.FECHA_EVENTO.getFullYear()) return;
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var fila       = data[i];
    var familia    = fila[CONFIG.COL_FAMILIA]   ? fila[CONFIG.COL_FAMILIA].toString().trim()  : "";
    var telefono   = fila[CONFIG.COL_TELEFONO]  ? fila[CONFIG.COL_TELEFONO].toString().trim() : "";
    var asistencia = fila[CONFIG.COL_ASISTENCIA]? fila[CONFIG.COL_ASISTENCIA].toString().trim(): "";
    var mesa       = fila[CONFIG.COL_MESA]      ? fila[CONFIG.COL_MESA].toString().trim()     : "";
    var baja       = fila[CONFIG.COL_BAJA]      ? fila[CONFIG.COL_BAJA].toString().trim()     : "";

    if (!telefono || baja === "BAJA" || asistencia === "" || _todosNoAsisten(asistencia)) continue;
    var mensaje = _construirMensajeDiaEvento(familia, mesa);
    var linkWA  = _construirLinkWA(telefono, mensaje);
    sheet.getRange(i + 1, CONFIG.COL_LINK_WA + 1).setValue(linkWA);
  }
}

function emailSemanal() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var confirmados = [], sinRespuesta = [], noAsisten = [];
  for (var i = 1; i < data.length; i++) {
    var fila       = data[i];
    var familia    = fila[CONFIG.COL_FAMILIA]   ? fila[CONFIG.COL_FAMILIA].toString().trim()  : "";
    var asistencia = fila[CONFIG.COL_ASISTENCIA]? fila[CONFIG.COL_ASISTENCIA].toString().trim(): "";
    var baja       = fila[CONFIG.COL_BAJA]      ? fila[CONFIG.COL_BAJA].toString().trim()     : "";
    var mesa       = fila[CONFIG.COL_MESA]      ? fila[CONFIG.COL_MESA].toString().trim()     : "";
    var id         = fila[CONFIG.COL_ID]        ? fila[CONFIG.COL_ID].toString().trim()       : "";

    if (!id && !familia) continue;
    if (baja === "BAJA") continue;
    if (asistencia === "")             sinRespuesta.push({ familia: familia, mesa: mesa });
    else if (_todosNoAsisten(asistencia)) noAsisten.push({ familia: familia });
    else                                  confirmados.push({ familia: familia, mesa: mesa, detalle: asistencia });
  }

  var email  = Session.getActiveUser().getEmail();
  var asunto = "📊 XV Nancy Paola — Resumen semanal " + new Date().toLocaleDateString("es-MX");
  var html   = _construirEmailHTML(confirmados, sinRespuesta, noAsisten);

  MailApp.sendEmail({ to: email, subject: asunto, htmlBody: html });
}

function rutinaDiaria() {
  darDeBajaLinks();
  enviarRecordatorios();
  actualizarDashboard();
  recordatorioDiaEvento();
}

function instalarTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    var fn = t.getHandlerFunction();
    if (fn === "rutinaDiaria" || fn === "emailSemanal" || fn === "onOpen") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("rutinaDiaria").timeBased().everyDays(1).atHour(9).create();
  ScriptApp.newTrigger("emailSemanal").timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  ScriptApp.newTrigger("onOpen").forSpreadsheet(SpreadsheetApp.getActive()).onOpen().create();

  SpreadsheetApp.getUi().alert("✅ Triggers configurados:\n\n• Rutina diaria: 9 AM\n• Reporte semanal: Lunes 8 AM\n• Menú dinámico activado.");
}

// ============================================================
//  HELPER: Contar accesos QR del día del evento
//  ✅ NUEVO: usado en el dashboard para ver cuántos ya ingresaron
// ============================================================
function _contarAccesosQR() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaMesas = ss.getSheetByName(CONFIG.NOMBRE_HOJA_MESAS);
  if (!hojaMesas) return 0;
  var data = hojaMesas.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] && data[i][3].toString().trim() !== "") count++;
  }
  return count;
}

// ============================================================
//  7. FUNCIONES ENCAPSULADAS Y LOGICA DE MENSAJERIA (COMPLETAS)
// ============================================================
function jsonpResponse(callback, obj) {
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(obj) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function _asegurarEncabezados(sheet) {
  var needed = CONFIG.COL_BAJA + 1;
  if(sheet.getLastColumn() < needed) return;
  var headers = sheet.getRange(1, 1, 1, needed).getValues()[0];
  if (!headers[CONFIG.COL_ULT_RECORDATORIO]) sheet.getRange(1, CONFIG.COL_ULT_RECORDATORIO + 1).setValue("Último recordatorio");
  if (!headers[CONFIG.COL_BAJA]) sheet.getRange(1, CONFIG.COL_BAJA + 1).setValue("Baja");
}

function _diasRestantes(desde, hasta) { 
  return Math.ceil((hasta - desde) / (1000 * 60 * 60 * 24)); 
}

function _deberiEnviarHoy(ultRecordatorio, ahora, intervaloDias) {
  if (!ultRecordatorio || ultRecordatorio === "") return true;
  var f = new Date(ultRecordatorio);
  if (isNaN(f.getTime())) return true;
  return Math.floor((ahora - f) / (1000 * 60 * 60 * 24)) >= intervaloDias;
}

function _todosNoAsisten(resumen) {
  if (!resumen || resumen.trim() === "") return false;
  return !resumen.split("|").some(function(p) { return /asistirá/i.test(p.replace(/No asistirá/gi, "")); });
}

function _construirMensaje(familia, linkConf, diasRestantes) {
  var urgencia = diasRestantes <= 7 ? "⚠️ ¡Quedan solo " + diasRestantes + " días!" : "📅 Tienes hasta el 20 de julio de 2026.";
  return "✨ *XV Años de Nancy Paola* ✨\n\nHola, familia *" + familia + "*! 💕\n\nAún no has confirmado tu asistencia.\n\n" + urgencia + "\n\nConfirma aquí:\n" + linkConf + "\n\n¡Te esperamos! 🌸";
}

function _construirMensajeBienvenida(familia, mesa, confirmacion) {
  var mesaTexto = mesa ? "\n\n🪑 *Tu mesa asignada: " + mesa + "*" : "";
  return "🎉 *¡Confirmación recibida!*\n\nFamilia *" + familia + "*, ¡gracias por confirmar!\n\nLos esperamos el *15 de agosto de 2026*:\n⛪ *18:00 HRS* — Templo del Señor del Encino\n🥳 *20:00 HRS* — Salón Terraza Artes" + mesaTexto + "\n\n¡Será una noche muy especial! ✨🌸";
}

function _construirMensajeDiaEvento(familia, mesa) {
  var mesaTexto = mesa ? "\n🪑 Mesa: *" + mesa + "*" : "";
  return "🌸 *¡Hoy es el gran día!* 🌸\n\nFamilia *" + familia + "*, ¡los esperamos esta noche!\n\n⛪ *18:00 HRS* — Templo del Señor del Encino\n🥳 *20:00 HRS* — Salón Terraza Artes" + mesaTexto + "\n\n¡Nos vemos pronto! 💕✨";
}

function _construirLinkWA(telefono, mensaje) {
  var tel = telefono.replace(/[\s\-\(\)]/g, "");
  if (!tel.startsWith("+") && !tel.startsWith("52")) tel = "52" + tel;
  return "https://wa.me/" + tel + "?text=" + encodeURIComponent(mensaje);
}

function _construirEmailHTML(confirmados, sinRespuesta, noAsisten) {
  var filaConf = confirmados.map(function(r) {
    return '<tr><td style="padding:6px 10px">' + r.familia + '</td><td style="padding:6px 10px;color:#2e7d32">✅ Confirmado</td><td style="padding:6px 10px">' + r.mesa + '</td></tr>';
  }).join("");
  var filaSin = sinRespuesta.map(function(r) {
    return '<tr><td style="padding:6px 10px">' + r.familia + '</td><td style="padding:6px 10px;color:#e65100">⏳ Sin respuesta</td><td style="padding:6px 10px">' + r.mesa + '</td></tr>';
  }).join("");
  var filaNo = noAsisten.map(function(r) {
    return '<tr><td style="padding:6px 10px">' + r.familia + '</td><td style="padding:6px 10px;color:#c62828">❌ No asiste</td><td style="padding:6px 10px">—</td></tr>';
  }).join("");
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#f9f7f4;padding:20px">' +
    '<div style="max-width:600px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">' +
    '<div style="background:#5A0D15;padding:24px;text-align:center"><h1 style="color:#C5A059;margin:0;font-size:26px">XV Nancy Paola</h1>' +
    '<p style="color:#f5d9a8;margin:6px 0 0;font-size:13px">Resumen semanal · ' + new Date().toLocaleDateString("es-MX") + '</p></div>' +
    '<div style="padding:20px"><div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">' +
    _badgeStat("✅ Confirmados", confirmados.length, "#e8f5e9", "#2e7d32") +
    _badgeStat("⏳ Sin respuesta", sinRespuesta.length, "#fff8e1", "#e65100") +
    _badgeStat("❌ No asisten", noAsisten.length, "#fdecea", "#c62828") + '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="background:#f5f5f5">' +
    '<th style="padding:8px 10px;text-align:left">Familia</th><th style="padding:8px 10px;text-align:left">Estado</th><th style="padding:8px 10px;text-align:left">Mesa</th></tr></thead>' +
    '<tbody>' + filaConf + filaSin + filaNo + '</tbody></table></div></div></body></html>';
}

function _badgeStat(label, count, bg, color) {
  return '<div style="flex:1;min-width:150px;background:' + bg + ';border-radius:10px;padding:14px;text-align:center">' +
    '<div style="font-size:24px;font-weight:bold;color:' + color + '">' + count + '</div>' +
    '<div style="font-size:12px;color:#555;margin-top:4px">' + label + '</div></div>';
}

function _notificarAdmin(enviados, omitidos) {
  try { MailApp.sendEmail(Session.getActiveUser().getEmail(), "XV Nancy Paola — Recordatorios Exec", "✅ Preparados para envío: " + enviados + "\n⏭️ Omitidos: " + omitidos); } catch(e) {}
}