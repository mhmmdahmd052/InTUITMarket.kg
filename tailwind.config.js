/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        'on-background': 'var(--color-on-background)',
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        secondary: 'var(--color-secondary)',
        'on-secondary': 'var(--color-on-secondary)',
        tertiary: 'var(--color-tertiary)',
        'on-tertiary': 'var(--color-on-tertiary)',
        surface: 'var(--color-surface)',
        'on-surface': 'var(--color-on-surface)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'outline-variant': 'var(--color-outline-variant)',
        error: 'var(--color-error)',
        'on-error': 'var(--color-on-error)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      }
    },
  },
  plugins: [],
}
