import { createFont, createTamagui } from '@tamagui/core';
import { tokens } from '@tamagui/config/v3'
import * as themes from './theme/theme-output'; // Add your generated theme here

const Arial = createFont({
  family: 'System',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    true: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 23,
    9: 30,
    10: 46,
    11: 55,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 134
  },
});
export default createTamagui({
  themes: {
    light: themes.light,   // Add your light theme here
    dark: themes.dark,     // Add your dark theme if applicable
  },
  tokens,                   // Define your tokens (colors, spaces, etc.)
  shorthands: {
    // Add any shorthand styles you want to use
  },
  fonts: {
    heading: Arial, // overrides the default heading font
    body: Arial, // overrides the default body font
    nunito: Arial // introduce a specific token for your new font
  }                 // Import and define your fonts
});
