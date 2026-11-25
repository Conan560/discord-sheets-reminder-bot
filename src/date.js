function getDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day)
  };
}

function parseSheetDate(value) {
  if (value instanceof Date) {
    return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
  }

  const text = String(value ?? "").trim();
  if (!text) return null;

  let match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s.*)?$/);
  if (match) {
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }

  match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (match) {
    return { year: Number(match[3]), month: Number(match[2]), day: Number(match[1]) };
  }

  return null;
}

function dayNumber({ year, month, day }) {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function daysUntil(dueValue, now, timeZone) {
  const due = parseSheetDate(dueValue);
  if (!due) return null;
  const today = getDateParts(now, timeZone);
  return dayNumber(due) - dayNumber(today);
}

module.exports = { daysUntil, parseSheetDate };
