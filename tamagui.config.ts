import { createTamagui } from '@tamagui/core';
import { tokens } from '@tamagui/config/v3'
import * as themes from './theme/theme-output'; // Add your generated theme here

export default createTamagui({
  themes: {
    light: themes.light,   // Add your light theme here
    dark: themes.dark,     // Add your dark theme if applicable
  },
  tokens,                   // Define your tokens (colors, spaces, etc.)
  shorthands: {
    // Add any shorthand styles you want to use
  },                 // Import and define your fonts
});
