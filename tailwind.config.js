/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arith: {
          bg: '#030508',
          card: '#080c14',
          cardHover: '#0d1320',
          border: '#162030',
          accent: '#00dc82',
          emerald: '#10b981',
          teal: '#0d9488',
          darkEmerald: '#022c22',
          textMuted: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'emerald-pulse': 'emeraldPulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-float': 'subtleFloat 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        emeraldPulse: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px rgba(0, 220, 130, 0.2)' },
          '50%': { opacity: 0.7, boxShadow: '0 0 35px rgba(0, 220, 130, 0.5)' },
        },
        subtleFloat: {
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
