/** @type {import('tailwindcss').Config} */
export default {
  //  Le decimos a Tailwind dónde están nuestros archivos
  // para que solo genere las clases CSS que realmente usamos
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}