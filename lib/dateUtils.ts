export const getLocalTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset();
};

export const toUTC = (localDate: Date): Date => {
  // Create a UTC date string from local components
  const utc = Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    localDate.getHours(),
    localDate.getMinutes(),
    localDate.getSeconds()
  );
  return new Date(utc);
};

export const fromUTC = (utcString: string): Date => {
  const date = new Date(utcString);
  // Create a new date using local components
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};

export const formatLocalDate = (date: Date): string => {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Debug function to help us understand timezone conversions
export const debugDateTime = (date: Date, label: string) => {
  console.log(`[${label}]`, {
    iso: date.toISOString(),
    local: date.toString(),
    localeString: date.toLocaleString(),
    timezoneOffset: date.getTimezoneOffset(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
}; 