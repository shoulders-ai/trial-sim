import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts,js}',
    './shared/**/*.ts',
  ],
  theme: {
    fontSize: {
      xs:   ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
      sm:   ['13px', { lineHeight: '20px', letterSpacing: '0.01em' }],
      base: ['15px', { lineHeight: '26px', letterSpacing: '0' }],
      lg:   ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      xl:   ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
      '2xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.025em' }],
      '3xl': ['44px', { lineHeight: '52px', letterSpacing: '-0.03em' }],
      '4xl': ['56px', { lineHeight: '64px', letterSpacing: '-0.03em' }],
    },
    extend: {
      fontFamily: {
        serif: ['"Crimson Text"', 'Georgia', 'serif'],
        sans: ['"Open Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cadet: {
          400: '#7BB0B2',
          500: '#5F9EA0',
          600: '#4E8486',
        },
        sea: {
          400: '#66CDAA',
          500: '#3CB371',
          600: '#2E8B57',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
