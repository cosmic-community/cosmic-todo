/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          foreground: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        confetti: 'confetti 0.8s ease-out forwards',
      },
      keyframes: {
        confetti: {
          '0%': {
            transform: 'translateY(0) rotate(0deg) scale(1)',
            opacity: '1',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(-60px) rotate(720deg) scale(0)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}