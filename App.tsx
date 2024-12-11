import { useEffect } from 'react';
import { loadAsync } from 'expo-font';

// Load fonts in your app entry point
const loadFonts = async () => {
  await loadAsync({
    'Manrope': require('./assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Bold': require('./assets/fonts/Manrope-Bold.ttf'),
    'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
  });
}; 