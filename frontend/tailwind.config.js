/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#09090b',
        'cyber-gray': '#18181b',
        'neon-blue': '#00f3ff',
        'neon-purple': '#b535f6',
        'alert-red': '#ff2a2a',
      },
      boxShadow: {
        'glow-blue': '0 0 10px #00f3ff, 0 0 20px #00f3ff',
        'glow-purple': '0 0 10px #b535f6, 0 0 20px #b535f6',
        'glow-red': '0 0 10px #ff2a2a, 0 0 20px #ff2a2a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
