/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./**/*.razor",
        "./**/*.html",
        "./**/*.cshtml",
    ],
    darkMode: 'class', // Add this line for default disabled dark mode
    theme: {
        extend: {},
    },
    plugins: [],
}