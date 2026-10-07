// Kept for projects that still load the package through `@config "perkslab-ui/tailwind.config"`.
// New setups only need `@import 'perkslab-ui/styles.css'` (it declares its own @source).
const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [path.join(__dirname, './dist/**/*.js')],
};
