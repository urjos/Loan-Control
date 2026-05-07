// ================================================================
// BACKEND v3 - Google Apps Script
//
// POR QUE SOLO GET:
//   React Native POST --> Apps Script responde 302 redirect
//   --> al seguirlo el body se pierde --> update/delete no funcionaban
//   Solucion: TODO por parametros URL en GET (sobreviven redirect)
//
// Operaciones: ?action=list | create | update | delete
// ================================================================

const NOMBRE_HOJA = "Pagos";
const COL_ID = 1;
const COL_FECHA = 2;
const COL_CLIENTE = 3;
const COL_MONTO = 4;
const COL_TIMESTAMP = 5;

const ENCABEZADOS = ["id", "fecha", "cliente", "monto", "registrado_en"];

function doGet(e) {
  try {
    const accion = (e.parameter && e.parameter.action) || "list";
    const p = e.parameter || {};

    if (accion === "list") return listarPagos();
    if (accion === "create") return crearPago(p);
    if (accion === "update") return actualizarPago(p);
    if (accion === "delete") return eliminarPago(p.id);

    return error("Accion desconocida: " + accion);
  } catch (ex) {
    return error("doGet error: " + ex.message);
  }
}

function doPost(e) {
  return doGet(e);
}

function listarPagos() {
  const sheet = getHoja();
  if (sheet.getLastRow() <= 1) return ok([]);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const filas = data.slice(1).map((fila) => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = fila[i];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "America/Lima", "yyyy-MM-dd");
      }
      obj[h] = val;
    });
    return obj;
  });

  return ok(filas);
}

function crearPago(p) {
  const sheet = getHoja();
  asegurarEncabezados(sheet);
  const id = "P_" + Date.now();
  sheet.appendRow([id, p.fecha, p.cliente, Number(p.monto), ahoraLima()]);
  const fila = sheet.getLastRow();
  sheet.getRange(fila, COL_ID).setNumberFormat("@");
  sheet.getRange(fila, COL_FECHA).setNumberFormat("@");
  return ok({ success: true, id: id });
}

function actualizarPago(p) {
  const sheet = getHoja();
  const filaNum = encontrarFila(sheet, p.id);
  if (!filaNum) return error("No encontrado. ID: " + p.id);
  sheet.getRange(filaNum, COL_FECHA).setValue(p.fecha).setNumberFormat("@");
  sheet.getRange(filaNum, COL_CLIENTE).setValue(p.cliente);
  sheet.getRange(filaNum, COL_MONTO).setValue(Number(p.monto));
  return ok({ success: true });
}

function eliminarPago(id) {
  const sheet = getHoja();
  const filaNum = encontrarFila(sheet, id);
  if (!filaNum) return error("No encontrado. ID: " + id);
  sheet.deleteRow(filaNum);
  return ok({ success: true });
}

function getHoja() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
}

function asegurarEncabezados(sheet) {
  if (sheet.getLastRow() === 0) sheet.appendRow(ENCABEZADOS);
}

function encontrarFila(sheet, idBuscado) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const ids = sheet.getRange(2, COL_ID, lastRow - 1, 1).getValues();
  const idStr = String(idBuscado).trim();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === idStr) return i + 2;
  }
  return null;
}

function ahoraLima() {
  return Utilities.formatDate(new Date(), "America/Lima", "dd/MM/yyyy HH:mm");
}

function ok(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function error(msg) {
  return ContentService.createTextOutput(
    JSON.stringify({ error: msg }),
  ).setMimeType(ContentService.MimeType.JSON);
}
