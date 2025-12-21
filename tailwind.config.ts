import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Terminal Luxe palette
        surface: {
          0: '#09090B',
          1: '#0F0F11',
          2: '#18181B',
          3: '#1F1F23',
          4: '#27272A',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dim: '#D97706',
          bright: '#FBBF24',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
        official: {
          DEFAULT: '#8B5CF6',
          dim: '#7C3AED',
          glow: 'rgba(139, 92, 246, 0.15)',
        },
        community: {
          DEFAULT: '#10B981',
          dim: '#059669',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        text: {
          primary: '#FAFAF9',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
      },
      fontFamily: {
        sans: ['Geist Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0v60h60V0zM1 1h58v58H1V1z' fill='%23ffffff' fill-opacity='0.02'/%3E%3C/svg%3E")`,
        'noise': `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px var(--glow-color, rgba(245, 158, 11, 0.3))',
        'glow': '0 0 30px -5px var(--glow-color, rgba(245, 158, 11, 0.4))',
        'glow-lg': '0 0 50px -10px var(--glow-color, rgba(245, 158, 11, 0.5))',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
