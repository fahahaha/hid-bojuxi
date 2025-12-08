/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#36CFC9',
        accent: '#722ED1',
        dark: '#1D2129',
        light: '#F2F3F5',
        success: '#00B42A',
        warning: '#FF7D00',
        danger: '#F53F3F',
        'gray-dark': '#4E5969',
        'gray-medium': '#86909C',
        'gray-light': '#C9CDD4'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
