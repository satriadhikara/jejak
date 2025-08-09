/** @type {import('tailwindcss').Config} */
module.exports = {
  // Make sure Tailwind scans all screens/components that use className
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
  nativewind: { rem: 16 },
}