import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  ssr: false,
  future: { compatibilityVersion: 4 },

  alias: {
    '@lib': resolve(__dirname, 'lib'),
    '@shared': resolve(__dirname, 'shared'),
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      'Crimson Text': [400, 600, 700],
      'Open Sans': [400, 500, 600],
    },
    display: 'swap',
    download: true,
    preload: true,
  },

  vite: {
    worker: {
      format: 'es' as const,
    },
  },

  app: {
    head: {
      title: 'SimTrial — Interactive Clinical Trial Simulation',
      meta: [
        { name: 'description', content: 'Watch adaptive and conventional clinical trials race side-by-side. See why adaptive designs save patients and time.' },
      ],
    },
  },
})
