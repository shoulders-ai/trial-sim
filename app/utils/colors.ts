/** Shoulders-derived palette for canvas rendering */
export const COLORS = {
  // Text
  textPrimary: '#1c1917',    // stone-900
  textBody: '#57534e',       // stone-600
  textMuted: '#a8a29e',      // stone-400
  textFaint: '#d6d3d1',      // stone-300

  // Borders
  borderLight: '#f5f5f4',    // stone-100
  borderMedium: '#e7e5e4',   // stone-200

  // Background
  white: '#ffffff',

  // Accent (section labels only)
  cadet: '#5F9EA0',          // cadet-500

  // Functional arm colors (muted, restrained)
  control: '#a8a29e',        // stone-400
  armA: '#5F9EA0',           // cadet-500
  armB: '#3CB371',           // sea-500
  armC: '#78716c',           // stone-500
  armD: '#7BB0B2',           // cadet-400

  // States
  dropped: '#d6d3d1',        // stone-300
  efficacy: '#3CB371',       // sea-500
  outcome: '#1c1917',        // stone-900

  // Canvas background
  canvasBg: '#ffffff',
  canvasDivider: '#e7e5e4',  // stone-200
} as const

export const ARM_COLORS = [
  COLORS.control,
  COLORS.armA,
  COLORS.armB,
  COLORS.armC,
  COLORS.armD,
]
