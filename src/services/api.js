// ================================================================
// 🌐  src/services/api.js
// Capa de servicio: toda comunicación con Google Apps Script.
// Las pantallas nunca hacen fetch() directamente; usan este módulo.
// ================================================================

import { SCRIPT_URL } from '../config/constants';

// Helper: POST con JSON al script
async function post(payload) {
  const res = await fetch(SCRIPT_URL, {
    method:   'POST',
    headers:  { 'Content-Type': 'text/plain' }, // Apps Script requiere esto
    body:     JSON.stringify(payload),
    redirect: 'follow', // Apps Script hace una redirección 302
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// Helper: GET todos los pagos
async function get() {
  const res = await fetch(SCRIPT_URL, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ── API pública ──────────────────────────────────────────────

/**
 * Obtiene todos los pagos desde Google Sheets.
 * @returns {Promise<Array>} Lista de objetos pago
 */
export const getPagos = () => get();

/**
 * Crea un pago nuevo.
 * @param {{ fecha, cliente, monto }} pago
 */
export const createPago = (pago) =>
  post({ action: 'create', ...pago });

/**
 * Actualiza un pago existente.
 * @param {{ id, fecha, cliente, monto }} pago
 */
export const updatePago = (pago) =>
  post({ action: 'update', ...pago });

/**
 * Elimina un pago por su id.
 * @param {string} id
 */
export const deletePago = (id) =>
  post({ action: 'delete', id });
