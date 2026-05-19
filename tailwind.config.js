const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [path.join(__dirname, './dist/**/*.{js,ts,jsx,tsx}')],
};
