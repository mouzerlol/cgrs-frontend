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
        bone: '#F4F1EA',
        forest: {
          DEFAULT: '#1A2218',
          light: '#2C3E2D',
        },
        terracotta: {
          DEFAULT: '#D95D39',
          dark: '#C74E2E',
        },
        sage: {
          DEFAULT: '#A8B5A0',
          light: '#E8EDE6',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 8vw, 5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
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
      },
      transitionTimingFunction: {
        'out-custom': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s var(--ease-out) forwards',
        'scroll-bounce': 'scrollBounce 2s ease-in-out infinite',
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
      },
    },
  },
  plugins: [],
}
