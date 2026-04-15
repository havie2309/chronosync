const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isDateOnlyString(value: string) {
  return DATE_ONLY_REGEX.test(value);
}

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function parseDateOnly(value: string) {
  if (!isDateOnlyString(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }

  return startOfDay(parsed);
}

function resolveWeekStart(weekStart?: string) {
  if (weekStart) {
    const parsed = parseDateOnly(weekStart);

    if (parsed) {
      return parsed;
    }
  }

  return startOfDay(new Date());
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekEnd(weekStart: Date) {
  return addDays(weekStart, 7);
}

export { DATE_ONLY_REGEX, addDays, getWeekEnd, isDateOnlyString, isValidDateString, parseDateOnly, resolveWeekStart, startOfDay };
