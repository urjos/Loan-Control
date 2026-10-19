import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

if (!API_URL) {
  console.error(
    "[API] ⚠️  apiUrl no está definida.\n" +
      "  En desarrollo: verifica que EXPO_PUBLIC_API_URL esté en tu .env\n" +
      "  En EAS Build:  verifica el EAS Secret con `eas secret:list`",
  );
}

const buildUrl = (params) => {
  if (!API_URL) throw new Error("API URL no configurada.");
  const qs = new URLSearchParams(params).toString();
  return `${API_URL}?${qs}`;
};

export const api = {
  getPayments: async () => {
    const response = await fetch(buildUrl({ action: "get" }));
    if (!response.ok) throw new Error("Error al obtener pagos");
    return response.json();
  },

  createPayment: async (payment) => {
    const response = await fetch(buildUrl({ action: "create" }), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error("Error al crear el pago");
    return response.json();
  },

  updatePayment: async (id, payment) => {
    const response = await fetch(buildUrl({ action: "update", id }), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error("Error al actualizar el pago");
    return response.json();
  },

  deletePayment: async (id) => {
    const response = await fetch(buildUrl({ action: "delete", id }), {
      method: "POST",
    });
    if (!response.ok) throw new Error("Error al eliminar el pago");
    return { ok: true };
  },
};
