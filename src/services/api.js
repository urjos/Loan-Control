// ================================================================
// 🌐 src/services/api.js
// Todo por parámetros GET para evitar bloqueos de Google
// ================================================================

import { SCRIPT_URL } from "../config/constants";

// Helper: Convierte un objeto a query string (?key1=value1&key2=value2)
const buildQueryString = (params) => {
  return Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key]),
    )
    .join("&");
};

// Helper principal que hace la petición GET
/*const fetchAppsScript = async (params = {}) => {
  const queryString = buildQueryString(params);
  const urlConParametros = `${SCRIPT_URL}?${queryString}`;

  const res = await fetch(urlConParametros, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
};
*/
// Helper principal que hace la petición GET
const fetchAppsScript = async (params = {}) => {
  // 🟢 SOLUCIÓN 1: Engañamos a la caché de React Native enviando la hora actual
  params.t = Date.now();

  const queryString = buildQueryString(params);
  const urlConParametros = `${SCRIPT_URL}?${queryString}`;

  const res = await fetch(urlConParametros, {
    method: "GET",
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
};

// ── API pública ──────────────────────────────────────────────

export const getPagos = () => fetchAppsScript({ action: "list" });

export const createPago = (pago) =>
  fetchAppsScript({ action: "create", ...pago });

export const updatePago = (pago) =>
  fetchAppsScript({ action: "update", ...pago });

export const deletePago = (id) => fetchAppsScript({ action: "delete", id });
