/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#f6f2ea',
        'canvas-tint': '#fbf7ef',
        card: '#fffaf3',
        hairline: '#e3dbcd',
        'row-divider': '#efe8db',
        forest: {
          DEFAULT: '#2c4a3a',
          dark: '#243d30',
          deep: '#22382c',
        },
        ink: {
          DEFAULT: '#1f2a24',
          muted: '#5c675f',
          faint: '#8b938a',
        },
        clay: {
          DEFAULT: '#c46a48',
          light: '#e8a184',
          tint: '#fbeee7',
          hairline: '#e7c9bb',
        },
        sage: {
          DEFAULT: '#7a9a86',
          tint: '#eef2ea',
        },
        overdue: '#9b2c2c',
        cream: '#f4efe4',
        'error-tint': '#f4dfd5',
      },
      fontFamily: {
        sans: ['Outfit_400Regular'],
        'sans-medium': ['Outfit_500Medium'],
        'sans-semibold': ['Outfit_600SemiBold'],
        serif: ['Fraunces_500Medium'],
        'serif-semibold': ['Fraunces_600SemiBold'],
        'serif-bold': ['Fraunces_700Bold'],
      },
      borderRadius: {
        card: 16,
        input: 14,
        button: 14,
        tile: 16,
      },
      spacing: {
        screen: 20,
        touch: 44,
      },
    },
  },
  plugins: [],
};
