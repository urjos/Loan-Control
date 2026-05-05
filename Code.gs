// ================================================================
// 🗄️  BACKEND — Google Apps Script (pegar en script.google.com)
// Soporta: CREATE · UPDATE · DELETE · GET
// Columnas del Sheet: id | fecha | cliente | monto | registrado_en
// ================================================================

const NOMBRE_HOJA    = 'Pagos';
const COL_ID         = 1;   // Columna A
const COL_FECHA      = 2;   // Columna B
const COL_CLIENTE    = 3;   // Columna C
const COL_MONTO      = 4;   // Columna D
const COL_TIMESTAMP  = 5;   // Columna E

// ── Encabezados que se crearán si la hoja está vacía ──
const ENCABEZADOS = ['id', 'fecha', 'cliente', 'monto', 'registrado_en'];

// ── GET: Devuelve todos los pagos como array de objetos ──
function doGet() {
  try {
    const sheet = getHoja();
    const data  = sheet.getDataRange().getValues();

    if (data.length <= 1) return ok([]);

    const headers = data[0];
    const filas   = data.slice(1).map(fila => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = fila[i]; });
      return obj;
    });

    return ok(filas);
  } catch (e) {
    return error(e.message);
  }
}

// ── POST: Enrutador de acciones (create / update / delete) ──
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const accion  = payload.action || 'create';

    if (accion === 'create') return crearPago(payload);
    if (accion === 'update') return actualizarPago(payload);
    if (accion === 'delete') return eliminarPago(payload);

    return error('Acción desconocida: ' + accion);
  } catch (e) {
    return error(e.message);
  }
}

// ── Crear un pago nuevo ──
function crearPago(p) {
  const sheet = getHoja();
  asegurarEncabezados(sheet);

  const id = String(Date.now()); // ID único basado en timestamp
  sheet.appendRow([
    id,
    p.fecha,
    p.cliente,
    p.monto,
    ahoraLima()
  ]);

  return ok({ success: true, id });
}

// ── Actualizar un pago existente (busca por id) ──
function actualizarPago(p) {
  const sheet    = getHoja();
  const filaNum  = encontrarFila(sheet, p.id);

  if (!filaNum) return error('Pago no encontrado: ' + p.id);

  // Solo actualizamos los campos editables (fecha, cliente, monto)
  sheet.getRange(filaNum, COL_FECHA).setValue(p.fecha);
  sheet.getRange(filaNum, COL_CLIENTE).setValue(p.cliente);
  sheet.getRange(filaNum, COL_MONTO).setValue(p.monto);

  return ok({ success: true });
}

// ── Eliminar un pago (busca por id y borra la fila entera) ──
function eliminarPago(p) {
  const sheet   = getHoja();
  const filaNum = encontrarFila(sheet, p.id);

  if (!filaNum) return error('Pago no encontrado: ' + p.id);

  sheet.deleteRow(filaNum);
  return ok({ success: true });
}

// ── Helpers internos ──

function getHoja() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
}

function asegurarEncabezados(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ENCABEZADOS);
  }
}

// Recorre la columna A buscando el id; devuelve el número de fila (1-based)
function encontrarFila(sheet, id) {
  const ids = sheet.getRange(1, COL_ID, sheet.getLastRow(), 1).getValues();
  for (let i = 1; i < ids.length; i++) { // i=1 saltamos encabezado
    if (String(ids[i][0]) === String(id)) return i + 1;
  }
  return null;
}

function ahoraLima() {
  return new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
