/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'selector',
    content: ["./src/**/*.vue", "./index.html"],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography')
    ],
}

