// Convert local time to UTC for storage
export const toUTC = (localDate: Date): Date => {
  // Just return the date as is - JavaScript will handle timezone conversion
  return localDate;
};

// Convert UTC to user's local time for display
export const fromUTC = (utcString: string): Date => {
  // JavaScript automatically converts to local timezone
  return new Date(utcString);
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

export const isExpired = (dateString: string): boolean => {
  const localDeadline = fromUTC(dateString);
  const now = new Date();
  return localDeadline.getTime() <= now.getTime();
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