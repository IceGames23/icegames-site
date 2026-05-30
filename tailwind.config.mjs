/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      colors: {
        ice: {
          50: '#f7fbfe',
          100: '#eaf4fb',
          200: '#d4e9f7',
          300: '#9fc6e0',
          400: '#5fbfe6',
          500: '#2f9fd6',
          600: '#1c6fb0',
          700: '#155488',
          cyan: '#38bdf8',
          ink: '#0a1a2b',
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        frost: '0 10px 30px rgba(60,130,180,0.12)',
        glow: '0 0 0 1px rgba(56,189,248,0.4), 0 8px 30px rgba(56,189,248,0.18)',
      },
      backgroundImage: {
        'frost-gradient': 'linear-gradient(160deg,#f7fbfe 0%,#eaf4fb 55%,#d8ebf8 100%)',
        'ice-accent': 'linear-gradient(135deg,#38bdf8,#1c6fb0)',
        'frost-mesh':
          'radial-gradient(60% 50% at 15% 0%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(50% 50% at 90% 10%, rgba(125,211,252,0.16), transparent 60%)',
      },
    },
  },
  plugins: [],
}
