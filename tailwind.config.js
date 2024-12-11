/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        upcoming: '#979CFF',
        missed: '#A50505',
        completed: '#5EBD3C',
        pending: '#D96A4E',
        late: '#A07705',
      },
      fontFamily: {
        primary: ['Manrope'],
        secondary: ['Roboto'],
      },
    },
  },
  plugins: [],
}

