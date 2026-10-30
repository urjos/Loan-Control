// Shared cleaning shift logic.
// Used in both the app (DishwashingCalendar) and the Android widget.

export const MY_NAME = "Josué";
export const BROTHER_NAME = "David";

// Day on which the 4-day cycle starts (2 days each).
export const CYCLE_START_DATE = new Date("2024-01-01T00:00:00");

// Difference in days using UTC to avoid daylight saving issues.
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

// Position within the 4-day cycle: 0 and 1 = Josué, 2 and 3 = David.
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

// Local date in YYYY-MM-DD format (for daily save keys).
export const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
