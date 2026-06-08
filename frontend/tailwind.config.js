/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        q: {
          bg:      '#050810',
          bg2:     '#080c18',
          surface: '#0d1220',
          card:    '#111827',
          border:  '#1e2d4a',
          blue:    '#3b82f6',
          cyan:    '#06b6d4',
          indigo:  '#6366f1',
          glow:    '#1d4ed8',
          text:    '#e2e8f0',
          muted:   '#64748b',
          dim:     '#1e2d4a',
          green:   '#10b981',
          gold:    '#f59e0b',
          red:     '#ef4444',
          purple:  '#8b5cf6',
        }
      },
      fontFamily: {
        sans:  ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'monospace'],
        orb:   ['var(--font-display)', 'sans-serif'],
      },
      backgroundImage: {
        'grid':      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%231e2d4a' stroke-width='0.5'/%3E%3C/svg%3E\")",
        'grd-blue':  'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 70%)',
        'grd-card':  'linear-gradient(135deg, rgba(30,45,74,0.5) 0%, rgba(13,18,32,0.8) 100%)',
        'grd-btn':   'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
        'grd-gold':  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        'grd-green': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'grd-purple':'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      },
      boxShadow: {
        'blue':   '0 0 30px rgba(59,130,246,0.25), 0 0 60px rgba(59,130,246,0.1)',
        'cyan':   '0 0 30px rgba(6,182,212,0.25)',
        'card':   '0 4px 32px rgba(0,0,0,0.5)',
        'glow':   '0 0 20px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'gold':   '0 0 20px rgba(245,158,11,0.3)',
        'inner':  'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 4s ease-in-out infinite',
        'scan':       'scan 3s linear infinite',
        'appear':     'appear 0.4s ease-out',
        'shimmer':    'shimmer 2s linear infinite',
        'orbit':      'orbit 8s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        scan:       { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        appear:     { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        orbit:      { '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' }, '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' } },
        glowPulse:  { '0%': { boxShadow: '0 0 10px rgba(59,130,246,0.3)' }, '100%': { boxShadow: '0 0 30px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.2)' } },
      },
    }
  },
  plugins: [],
}
