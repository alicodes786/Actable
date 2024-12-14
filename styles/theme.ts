export const colors = {
    upcoming: '#6366F1',    // Darker indigo
    missed: '#B91C1C',      // Darker red
    completed: '#15803D',   // Darker green
    pending: '#C2410C',     // Darker orange
    late: '#854D0E',        // Darker amber
    invalid: '#737373',     // Darker gray
} as const;

export const fonts = {
  primary: 'Manrope',
  secondary: 'Roboto',
} as const;

// Type definitions for better TypeScript support
export type ColorKeys = keyof typeof colors;
export type FontKeys = keyof typeof fonts; 