/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New Design System
        bone: {
          DEFAULT: '#F4F1EA',
          /** Slightly lighter surface than default bone (e.g. nested cards on bone pages). */
          light: '#FAF8F3',
          /**
           * Bone, a few steps darker — the hairline a bone surface draws around
           * itself. Same hue and saturation as the fill, only less light, so the
           * edge reads as the paper's own rim rather than as a colour laid on it
           * (which is what a sage hairline on bone was doing).
           */
          edge: '#E0DBCC',
        },
        forest: {
          DEFAULT: '#1A2218',
          light: '#2C3E2D',
          /**
           * The hairline a forest-light surface draws around itself, and the
           * mirror of `bone-edge`: same hue, one step off the fill. Lighter
           * rather than darker, unlike bone's — a rim is only a rim if it can be
           * seen, and darker green on green disappears. Used where the body
           * plate's edge crosses the drop cap's block, so the card's hairline
           * runs unbroken round a corner that is not bone.
           */
          'light-edge': '#3B4F3C',
        },
        terracotta: {
          DEFAULT: '#D95D39',
          dark: '#C74E2E',
        },
        sage: {
          DEFAULT: '#A8B5A0',
          lite: '#D4DFD0',
          light: '#E8EDE6',
        },
        // Warm amber for secondary UI elements (timestamps, reply counts, stats)
        amber: {
          DEFAULT: '#D4A05A',
          dark: '#B8863D',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        /**
         * Atkinson Hyperlegible, for type set under ~10px — see the note in
         * `app/layout.tsx`. Manrope is the site's voice and holds down to about
         * 11px; below that its letterforms start converging on each other, and
         * this face is drawn so they cannot.
         */
        micro: ['var(--font-atkinson)', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(3rem, 10vw, 6.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'heading-lg': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'heading-md': ['clamp(1.25rem, 3vw, 1.75rem)', { lineHeight: '1.3' }],
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2.5rem',
        'xl': '4rem',
        '2xl': '6rem',
      },
      borderRadius: {
        'card': '20px',
        'dock': '24px',
      },
      boxShadow: {
        'dock': '0 20px 60px rgba(26, 34, 24, 0.15)',
        'card-hover': '0 20px 40px rgba(26, 34, 24, 0.12)',
        /*
         * The article's surfaces: the body sheet, the cover print beside it, and
         * the meta plaque under that. Shallow on purpose — these are objects
         * resting on a photograph, not floating above it, and the job is to say
         * where one stops and the picture starts now that none of them carries a
         * hairline.
         *
         * Two layers because one cannot do both halves of that. The 2px pass is
         * the contact shadow that seats the edge; the 12px pass is the ambient
         * one that separates the object from what is behind it. A single blur
         * wide enough to read as separation leaves the edge itself soft, which is
         * the smeared look the hero card's old tinted shadow had.
         *
         * Tinted forest (26,34,24) rather than black, per DESIGN.md: pure black
         * is forbidden system-wide, and a neutral grey shadow under a warm site
         * reads as grime rather than as light.
         *
         * Kept under 0.08 total. Anything heavier and the body sheet starts to
         * look like a card laid on the article instead of the article's own page.
         */
        'sheet': '0 1px 2px rgba(26, 34, 24, 0.05), 0 6px 16px rgba(26, 34, 24, 0.07)',
        /*
         * The same light, turned up: for an object resting on one of the site's
         * own paper surfaces rather than on a photograph.
         *
         * `sheet` is capped under 0.08 because it falls on a picture, where the
         * frame is already doing half the separating and anything heavier reads
         * as a card floating off the page. On bone with a grid printed on it
         * there is no such help — the article's meta widget lays its panel and
         * its tabs on exactly that — and at `sheet`'s strength the shadow was
         * present in the markup and invisible on screen.
         *
         * Same two-layer construction and the same tinted forest, roughly
         * doubled, with the ambient pass pulled tighter (12px, not 16) so the
         * extra weight arrives as a nearer object rather than as a wider haze.
         */
        'tray': '0 1px 2px rgba(26, 34, 24, 0.10), 0 4px 12px rgba(26, 34, 24, 0.16)',
        /*
         * `sheet`, plus a bezel turned inward: for a green surface that frames
         * something rather than holding it.
         *
         * A flat fill in a mid green has no edge of its own — the only thing
         * telling a reader where the article's meta plaque stops is the shadow it
         * throws, and that reads from the outside only.
         *
         * All three inset passes are aimed at the bottom and the sides, because
         * that is the whole of this frame anyone ever sees: its panel is flush to
         * the top and paints over it, so a highlight along the top edge is a
         * highlight nobody gets. A bone hairline the whole way round draws the rim;
         * a brighter one along the bottom is the light catching the inside face of
         * the near lip, which is the face turned up towards it; and a soft pass
         * rising off that lip gives the band between panel and rim somewhere to go,
         * so it reads as a surface curving away rather than as a stripe of flat
         * colour. The dark half of the bevel is already on screen — it is the
         * panel's own `shadow-tray`, falling exactly where the band meets it.
         *
         * The outer pair is `sheet` verbatim rather than a second token, because
         * Tailwind gives one `box-shadow` per element and this surface needs both
         * halves — the shadow it casts on the photograph and the rim it draws on
         * itself.
         */
        'bezel':
          'inset 0 0 0 1px rgba(244, 241, 234, 0.09), inset 0 -1px 0 rgba(244, 241, 234, 0.18), inset 0 -10px 12px -10px rgba(244, 241, 234, 0.08), 0 1px 2px rgba(26, 34, 24, 0.05), 0 6px 16px rgba(26, 34, 24, 0.07)',
      },
      transitionTimingFunction: {
        'out-custom': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s var(--ease-out) forwards',
        'scroll-bounce': 'scrollBounce 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'optimistic-pulse': 'optimisticPulse 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 1.5s ease-in-out infinite',
        'shake': 'shake 0.4s ease-out',
        'marquee': 'marquee 300s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scrollBounce: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
          '50%': { transform: 'translateX(-50%) translateY(8px)', opacity: '0.5' },
        },
        'poll-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        'poll-voter-appear': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        optimisticPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 93, 57, 0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(217, 93, 57, 0.2)' },
        },
        pulseSubtle: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 93, 57, 0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(217, 93, 57, 0.15)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
