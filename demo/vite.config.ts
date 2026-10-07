import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const src = fileURLToPath(new URL('../src', import.meta.url));

export default defineConfig({
	root: fileURLToPath(new URL('.', import.meta.url)),
	plugins: [react(), tailwindcss()],
	resolve: { alias: { 'perkslab-ui/styles.css': `${src}/styles/index.css`, 'perkslab-ui': `${src}/index.ts` } },
	build: { outDir: 'dist', emptyOutDir: true },
});
