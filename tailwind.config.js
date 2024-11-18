/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        gradient: 'linear-gradient(to bottom right, #1e3a8a, #6d28d9, #1f2937)',
      },
    },
  },
  plugins: [],
};
