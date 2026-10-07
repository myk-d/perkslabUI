import type { Preview } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { ConfirmProvider, ToastProvider, builtInThemes, uiStyles } from 'perkslab-ui';
import './preview.css';

const themeItems = builtInThemes.map((t) => ({ value: t.id, title: t.name }));

const preview: Preview = {
	globalTypes: {
		theme: { description: 'Colour theme', toolbar: { title: 'Theme', icon: 'paintbrush', items: themeItems, dynamicTitle: true } },
		ui: { description: 'UI style', toolbar: { title: 'UI', icon: 'component', items: uiStyles.map((s) => ({ value: s.id, title: s.name })), dynamicTitle: true } },
		brand: { description: 'Brand colour override (hex, empty = theme default)', toolbar: { title: 'Brand', icon: 'mirror', items: [{ value: '', title: 'Theme default' }, { value: '#e11d48', title: 'Rose' }, { value: '#0d9488', title: 'Teal' }, { value: '#7c3aed', title: 'Violet' }, { value: '#ea580c', title: 'Orange' }], dynamicTitle: true } },
	},
	initialGlobals: { theme: 'light', ui: 'perks', brand: '' },
	parameters: { layout: 'centered', controls: { expanded: true }, a11y: { test: 'todo' } },
	decorators: [
		(Story, ctx) => {
			const { theme, ui, brand } = ctx.globals as { theme: string; ui: string; brand: string };
			useEffect(() => {
				const root = document.documentElement;
				root.setAttribute('data-theme', theme);
				root.setAttribute('data-ui', ui);
				if (brand) {
					root.style.setProperty('--brand-color', brand);
					root.style.setProperty('--brand-hover', `color-mix(in srgb, ${brand} 85%, ${theme.endsWith('dark') || theme === 'dark' ? 'white' : 'black'})`);
					root.style.setProperty('--brand-bg', `color-mix(in srgb, ${brand} 14%, var(--bg-page))`);
				} else ['--brand-color', '--brand-hover', '--brand-bg'].forEach((p) => root.style.removeProperty(p));
			}, [theme, ui, brand]);
			return (
				<ToastProvider>
					<ConfirmProvider>
						<div className="min-h-40 min-w-72 bg-page-bg p-6 text-page-text">
							<Story />
						</div>
					</ConfirmProvider>
				</ToastProvider>
			);
		},
	],
	tags: ['autodocs'],
};

export default preview;
