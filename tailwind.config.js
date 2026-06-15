/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        surface: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          hover: '#334155',
        },
        accent: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
          dim: '#22C55E20',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
        },
      },
    },
  },
  plugins: [],
}
