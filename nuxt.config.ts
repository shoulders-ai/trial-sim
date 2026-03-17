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
    // Set baseURL for GitHub Pages subpath deployment (e.g., /trial-sim/)
    // Override with NUXT_APP_BASE_URL env var in CI
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'SimTrial — Interactive Clinical Trial Simulation',
      meta: [
        { name: 'description', content: 'An interactive exploration of the OCTAVE framework for clinical trial simulation.' },
      ],
    },
  },
})
