/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand & Driver Colors (Sky Blue)
        "primary": "#6ED6F2",
        "primary-light": "#E0F7FE",
        "primary-dark": "#0284C7",
        "driver": "#6ED6F2",
        "driver-light": "#E0F7FE",
        "driver-dark": "#0284C7",

        // Merchant Colors (Orange)
        "merchant": "#EA580C",
        "merchant-light": "#FFEDD5",
        "merchant-dark": "#C2410C",

        // Neutrals
        "background": "#F8FAFC",
        "card": "#FFFFFF",
        "text-main": "#0F172A",
        "text-secondary": "#64748B",
        "text-light": "#94A3B8",
        "border": "#E2E8F0",
        
        // Statuses
        "error": "#EF4444",
        "success": "#22C55E",
        "warning": "#F59E0B",
      },
    },
  },
  plugins: [],
}
