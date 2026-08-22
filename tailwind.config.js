export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#050507",
        surface: {
          DEFAULT: "rgba(18, 18, 22, 0.7)",
          solid: "#0d0d12",
          card: "rgba(22, 22, 29, 0.65)",
          hover: "rgba(35, 35, 45, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
          'border-strong': "rgba(255, 255, 255, 0.18)",
          highlight: "rgba(255, 255, 255, 0.04)"
        },
        brand: {
          DEFAULT: "#ffffff",
          muted: "#a1a1aa",
          faint: "#52525b",
          dark: "#18181b",
          accent: "#27272a"
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-hover': '0 16px 40px 0 rgba(0, 0, 0, 0.65)',
        'glow-white': '0 0 24px -4px rgba(255, 255, 255, 0.25)',
        'glow-sm': '0 0 15px -2px rgba(255, 255, 255, 0.15)',
        'card-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'marquee-x': 'marqueeX 35s linear infinite',
        'marquee-x-reverse': 'marqueeXRev 35s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        marqueeX: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeXRev: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
        '3xl': '64px',
      }
    },
  },
  plugins: [],
}
