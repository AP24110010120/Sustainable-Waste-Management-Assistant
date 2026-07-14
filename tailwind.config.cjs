module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'dark-green': '#042a1b',
        'accent-green': '#1f7a4c'
      },
      fontFamily: {
        'space-mono': ['"Space Mono"', 'monospace'],
        'dm-sans': ['"DM Sans"', 'sans-serif'],
        'barlow-condensed': ['"Barlow Condensed"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
