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
        primary: '#e94560',
        secondary: '#00d4ff',
        dark: {
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
        },
      },
    },
  },
  plugins: [],
}
