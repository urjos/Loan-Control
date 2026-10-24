// Lógica compartida de los turnos de limpieza.
// Se usa tanto en la app (DishwashingCalendar) como en el widget de Android.

export const MY_NAME = "Josué";
export const BROTHER_NAME = "David";

// Día en el que arranca el ciclo de 4 días (2 días cada uno).
export const CYCLE_START_DATE = new Date("2024-01-01T00:00:00");

// Diferencia en días usando UTC para evitar problemas de horario de verano.
export const getDayDifference = (date1, date2) => {
  const date1UTC = Date.UTC(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate(),
  );
  const date2UTC = Date.UTC(
    date2.getFullYear(),
    date2.getMonth(),
    date2.getDate(),
  );
  return Math.floor((date1UTC - date2UTC) / (1000 * 60 * 60 * 24));
};

// Posición dentro del ciclo de 4 días: 0 y 1 = Josué, 2 y 3 = David.
export const getCyclePosition = (date) => {
  const dayDiff = getDayDifference(date, CYCLE_START_DATE);
  return ((dayDiff % 4) + 4) % 4;
};

export const isMyTurn = (date) => {
  const cyclePosition = getCyclePosition(date);
  return cyclePosition === 0 || cyclePosition === 1;
};

export const getAssigneeName = (date) =>
  isMyTurn(date) ? MY_NAME : BROTHER_NAME;

export const getTodayAssignee = () => getAssigneeName(new Date());

// Fecha local en formato YYYY-MM-DD (para claves de guardado diario).
export const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
