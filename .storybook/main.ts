import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../src', import.meta.url));

const config: StorybookConfig = {
	stories: ['../stories/**/*.stories.@(ts|tsx)'],
	addons: ['@storybook/addon-docs'],
	framework: '@storybook/react-vite',
	core: { disableTelemetry: true },
	viteFinal: async (config) => {
		config.plugins = [...(config.plugins ?? []), tailwindcss()];
		config.resolve = {
			...config.resolve,
			alias: { ...(config.resolve?.alias as Record<string, string>), 'perkslab-ui/styles.css': `${src}/styles/index.css`, 'perkslab-ui': `${src}/index.ts` },
		};
		return config;
	},
};

export default config;
