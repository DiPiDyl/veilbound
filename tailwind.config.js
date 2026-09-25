/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veil: {
          dark: '#080914',
          surface: '#111322',
          panel: '#181b30',
          border: '#282d4f',
          calm: '#38bdf8',
          wild: '#f97316',
          corrupted: '#a855f7',
          celestial: '#eab308',
          fractured: '#ec4899',
        },
        faction: {
          aetherbound: '#6366f1',
          ashen: '#ef4444',
          viridian: '#10b981',
          umbral: '#8b5cf6',
          chronocast: '#f59e0b',
          astral: '#06b6d4',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
