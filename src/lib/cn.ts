import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom utilities generated from the design tokens, otherwise a consumer's
// `rounded-full` / `shadow-lg` would not override the component's `rounded-control` / `shadow-box`.
const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			radius: ['control', 'field', 'box', 'item'],
			shadow: ['box', 'pop'],
		},
		classGroups: {
			'font-family': [{ font: ['heading'] }],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
