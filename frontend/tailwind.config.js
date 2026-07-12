/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
        colors: {
          primary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
            950: '#2e1065',
          },
          brandblue: {
            DEFAULT: '#2563EB',
            hover: '#1D4ED8',
            light: '#DBEAFE',
          },
          brandbg: {
            base: '#FFFFFF',
            subtle: '#F8FAFC',
          },
          brandborder: '#E2E8F0',
          brandtext: {
            primary: '#0F172A',
            secondary: '#64748B',
          }
        },
        boxShadow: {
          soft: '0 8px 30px rgba(15, 23, 42, 0.06)',
        },
        animation: {
          'fade-up': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          'float-slow': 'floatSlow 6s ease-in-out infinite',
          'float-medium': 'floatMedium 5s ease-in-out infinite',
          'float-fast': 'floatFast 4s ease-in-out infinite',
        },
        keyframes: {
          fadeUp: {
            '0%': { opacity: '0', transform: 'translateY(12px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          floatSlow: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-8px)' },
          },
          floatMedium: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-6px)' },
          },
          floatFast: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-4px)' },
          },
        },
    },
  },
  plugins: [],
}
