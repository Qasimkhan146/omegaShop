/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // for Pages Router
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // for shared UI
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // for App Router (Next.js 13+)
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px", // 👈 Custom breakpoint
      },
    },
  },
  plugins: [],
};
