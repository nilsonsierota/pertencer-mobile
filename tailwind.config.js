module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#189E50',
        primary: '#273107',
        secondary: '#189E50',
        chapter: '#6C7278',
        textarea: '#D9D9D9',
      },
    },
  },
  plugins: [],
};