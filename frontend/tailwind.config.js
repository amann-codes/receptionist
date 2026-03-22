/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        // ── Backgrounds ────────────────────────────────────────────────
        bg:         '#0d0d10',
        surface:    '#131318',
        'surface-2':'#1a1a22',

        // ── Borders ────────────────────────────────────────────────────
        border:     'rgba(255,255,255,0.08)',
        'border-2': 'rgba(255,255,255,0.14)',

        // ── Text ───────────────────────────────────────────────────────
        tx:         '#f0f0f5',
        'tx-2':     '#9898a8',
        'tx-3':     '#5a5a6a',

        // ── Accent (indigo-ish) ─────────────────────────────────────────
        accent:         '#6366f1',
        'accent-dim':   'rgba(99,102,241,0.12)',

        // ── Brand colours ──────────────────────────────────────────────
        'brand-red':        '#ef4444',
        'brand-red-dim':    'rgba(239,68,68,0.12)',

        'brand-blue':       '#3b82f6',
        'brand-blue-dim':   'rgba(59,130,246,0.12)',

        'brand-green':      '#22c55e',
        'brand-green-dim':  'rgba(34,197,94,0.12)',

        'brand-amber':      '#f59e0b',
        'brand-amber-dim':  'rgba(245,158,11,0.12)',
      },
      borderRadius: {
        sm: '6px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        fadeIn:  'fadeIn 0.2s ease-out both',
        slideIn: 'slideIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
        slideUp: 'slideUp 0.18s ease-out both',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
