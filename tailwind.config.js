/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rail: {
          50: '#effaf7',
          100: '#d7f3eb',
          500: '#0f8a70',
          600: '#08725d',
          700: '#075e54',
          900: '#073b35',
        },
      },
      boxShadow: { soft: '0 16px 40px rgba(7, 94, 84, 0.12)' },
    },
  },
  plugins: [],
}
