export const colors = {
  // Deadline status colors
  upcoming: '#979CFF',
  missed: '#A50505',
  completed: '#5EBD3C',
  pending: '#D96A4E',
  late: '#A07705',
} as const;

export const fonts = {
  primary: 'Manrope',
  secondary: 'Roboto',
} as const;

// Type definitions for better TypeScript support
export type ColorKeys = keyof typeof colors;
export type FontKeys = keyof typeof fonts; 