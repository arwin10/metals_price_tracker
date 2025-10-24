import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9ec',
          100: '#fdf3d9',
          200: '#fae7b3',
          300: '#f8db8d',
          400: '#f5cf67',
          500: '#f3c341',
          600: '#d4a935',
          700: '#b58f29',
          800: '#96751d',
          900: '#775b11',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#e4e9f0',
          200: '#cad3e1',
          300: '#a5b5ca',
          400: '#7a91ae',
          500: '#5a7394',
          600: '#475d7b',
          700: '#3a4b64',
          800: '#334054',
          900: '#2e3747',
        },
      },
    },
  },
  plugins: [],
}
export default config
