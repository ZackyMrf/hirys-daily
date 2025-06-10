/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        irysBlack: '#0f0f0f',
        irysGray: '#1a1a1a',
        irysText: '#f4f4f4',
        irysAccent: '#7E46F2',
        'primary-green': '#00ffd2', // Irys green color
        irysDanger: '#ff4b4b'
      },
      backgroundImage: {
        'landing': "url('/assets/background1.jpg')",
        'dashboard': "url('/assets/background2.jpg')"
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
        'bounce-slow': 'bounce 6s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
        'pulse-slow': 'pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease forwards'
      }
    },
  },
  plugins: [],
}