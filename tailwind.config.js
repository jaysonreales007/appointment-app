/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'law-primary': '#1a365d',    // Deep navy blue - authority and trust
        'law-secondary': '#2c5282',   // Royal blue - professionalism
        'law-accent': '#2b6cb0',      // Bright blue - reliability
        'law-neutral': '#e2e8f0',     // Light blue-gray - calm and clarity
        'law-light': '#f7fafc'        // Off-white with blue tint - clean and professional
      }
    },
  },
  plugins: [],
} 