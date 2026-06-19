/** @type {import('tailwindcss').Config} */
// Design System: Martins AI Automation — Brand Book (docs/brandbook_martinsautomation.pdf)
// Paleta extraída do MCP Stitch: projeto "Martins AI Scheduler SaaS" (#17000851020986356175)

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Paleta Principal ───────────────────────────────────────
        brand: {
          // Navy Dark — fundos de navegação, headers, botões primários
          navy:     '#0D1B3E',
          'navy-light': '#152448',
          // Cyan Neon — ações AI/Automate, destaques tech
          cyan:     '#00D4FF',
          'cyan-dim': '#00A8CC',
          // Blue Bright — interação em superfícies claras, foco/active
          blue:     '#2563EB',
          'blue-dark': '#1E4DB7',
          // Off White — background principal (surface)
          offwhite: '#F4F7FB',
          // Cards elevados (surface-container-lowest)
          white:    '#FFFFFF',
        },
        // ─── Status de Agendamentos ─────────────────────────────────
        status: {
          pendente:  { DEFAULT: '#F59E0B', bg: '#FEF3C7', text: '#92400E' },
          confirmado:{ DEFAULT: '#10B981', bg: '#D1FAE5', text: '#065F46' },
          cancelado: { DEFAULT: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
          remarcado: { DEFAULT: '#6366F1', bg: '#EDE9FE', text: '#4C1D95' },
        },
        // ─── Tokens Semânticos do Brand Book ───────────────────────
        surface: {
          DEFAULT:  '#F4F7FB',  // off-white — background principal
          bright:   '#F7FAFE',
          card:     '#FFFFFF',  // cards elevados
          dim:      '#D7DADE',
          container: {
            DEFAULT: '#EBEEF2',
            low:     '#F1F4F8',
            high:    '#E5E8EC',
            highest: '#E0E3E7',
            lowest:  '#FFFFFF',
          },
        },
        on: {
          surface:   '#181C1F',
          'surface-variant': '#45464E',
        },
        outline: {
          DEFAULT: '#76767F',
          variant: '#C6C6CF',
        },
        error: {
          DEFAULT:   '#BA1A1A',
          container: '#FFDAD6',
          on:        '#FFFFFF',
          'on-container': '#93000A',
        },
      },

      // ─── Tipografia ─────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-hero': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-h1':  ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        'headline-h2':  ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'body-main':    ['14.6px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-bold':   ['14px',   { lineHeight: '1',   fontWeight: '700' }],
      },

      // ─── Border Radius ──────────────────────────────────────────
      // Brand Book: "Soft-Geometric" — nunca pill-shaped nos botões
      borderRadius: {
        none:    '0',
        sm:      '0.125rem', // 2px
        DEFAULT: '0.25rem',  // 4px — inputs, small buttons
        md:      '0.375rem', // 6px — botões principais, tags
        lg:      '0.5rem',   // 8px — cards, modais
        xl:      '0.75rem',  // 12px — dashboard cards grandes
        '2xl':   '1rem',
        full:    '9999px',   // exclusivo para status chips
      },

      // ─── Espaçamento (8px Rhythmic Scale) ───────────────────────
      spacing: {
        'stack-xs': '4px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '24px',
        'stack-xl': '48px',
        'margin-mobile':  '16px',
        'margin-desktop': '32px',
        'gutter':         '16px',
      },

      // ─── Sombras (Brand Book — sem bordas rígidas) ──────────────
      boxShadow: {
        card:   '0 4px 20px rgba(0, 0, 0, 0.08)',
        active: '0 0 0 1px #2563EB',
        focus:  '0 0 0 2px rgba(0, 212, 255, 0.3)',
        nav:    '0 1px 3px rgba(13, 27, 62, 0.15)',
      },

      // ─── Grid ────────────────────────────────────────────────────
      // 12 colunas desktop, 8 tablet, 4 mobile
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
        '8':  'repeat(8, minmax(0, 1fr))',
        '4':  'repeat(4, minmax(0, 1fr))',
      },

      // ─── Animações ───────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 212, 255, 0.4)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(0, 212, 255, 0)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.2s ease-out',
        'slide-in':   'slide-in 0.25s ease-out',
        'pulse-cyan': 'pulse-cyan 2s infinite',
      },
    },
  },
  plugins: [],
};

module.exports = config;
