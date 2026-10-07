import themeData from './themes.json';

export type UiStyle = 'perks' | 'panel' | 'soft' | 'silk' | 'shadcn';

export const uiStyles: { id: UiStyle; name: string; description: string }[] = [
	{ id: 'perks', name: 'Perks', description: 'Rounded, brand-coloured borders, bold uppercase headings' },
	{ id: 'panel', name: 'Panel', description: 'Flat and dense, neutral borders — for dashboards and admin tools' },
	{ id: 'soft', name: 'Soft', description: 'Pill buttons, hairline borders, calm headings' },
	{ id: 'shadcn', name: 'Shadcn', description: 'Neutral, compact controls, 0.5rem radii — the shadcn/ui look' },
	{ id: 'silk', name: 'Silk', description: 'Editorial: square corners, 2px ink borders, serif headings' },
];

/** Colour slots a theme can define. Only `brand`, `background` and `foreground` are required — the rest is derived. */
export interface ThemeColors {
	brand: string;
	background: string;
	foreground: string;
	/** Hover shade of `brand`. Derived (darkened / lightened) when omitted. */
	brandHover?: string;
	/** Soft tint of `brand` used for hover/selected backgrounds. Derived when omitted. */
	brandBg?: string;
	/** Text on top of `brand`. Defaults to `background`. */
	brandFg?: string;
	/** Raised surfaces (cards in panel/soft/silk). Derived from background when omitted. */
	panel?: string;
	border?: string;
	muted?: string;
	danger?: string;
	ok?: string;
	warning?: string;
	info?: string;
}

export interface ThemeDefinition {
	id: string;
	name: string;
	mode: 'light' | 'dark';
	group?: string;
	colors: ThemeColors;
}

export type BuiltInTheme =
	| 'light'
	| 'dark'
	| 'blue-light'
	| 'blue-dark'
	| 'green-light'
	| 'green-dark'
	| 'purple-light'
	| 'purple-dark'
	| 'red-light'
	| 'red-dark'
	| 'yellow-light'
	| 'yellow-dark'
	| 'indigo-light'
	| 'indigo-dark'
	| 'orange-light'
	| 'orange-dark'
	| 'paper-light'
	| 'paper-dark'
	| 'neutral-light'
	| 'neutral-dark';

/** A built-in theme id, 'system' (follow the OS), or the id of a theme you registered via `<ThemeProvider themes>`. */
export type Theme = BuiltInTheme | 'system' | (string & {});

export const builtInThemes = themeData as (ThemeDefinition & { id: BuiltInTheme })[];

/** CSS custom property behind each colour slot. */
export const themeCssVars: Record<keyof ThemeColors, string> = {
	brand: '--brand-color',
	brandHover: '--brand-hover',
	brandBg: '--brand-bg',
	brandFg: '--brand-fg',
	background: '--bg-page',
	foreground: '--text-main',
	panel: '--bg-panel',
	border: '--panel-border',
	muted: '--text-muted',
	danger: '--c-danger',
	ok: '--c-ok',
	warning: '--c-warning',
	info: '--c-info',
};

/** Brand colour (hex, no `#`) per built-in theme — handy for favicons / `<meta name="theme-color">`. */
export const themeHexColors: Record<string, string> = Object.fromEntries(builtInThemes.map((t) => [t.id, t.colors.brand.replace('#', '')]));

/** CSS declarations for a colour set, deriving whatever was not given explicitly. */
export function colorsToDeclarations(colors: Partial<ThemeColors>, mode: 'light' | 'dark' = 'light'): string[] {
	const out: string[] = [];
	const merged: Partial<ThemeColors> = { ...colors };
	const toward = mode === 'dark' ? 'white' : 'black';

	if (colors.brand) {
		if (!colors.brandHover) merged.brandHover = `color-mix(in srgb, ${colors.brand} 85%, ${toward})`;
		if (!colors.brandBg) merged.brandBg = `color-mix(in srgb, ${colors.brand} ${mode === 'dark' ? 22 : 12}%, ${colors.background ?? 'var(--bg-page)'})`;
	}
	for (const key of Object.keys(merged) as (keyof ThemeColors)[]) {
		const value = merged[key];
		if (value) out.push(`${themeCssVars[key]}: ${value};`);
	}
	return out;
}

export function themeToCss(theme: ThemeDefinition): string {
	const decls = [...colorsToDeclarations(theme.colors, theme.mode), `color-scheme: ${theme.mode};`];
	return `[data-theme='${theme.id}'] {\n\t${decls.join('\n\t')}\n}`;
}

/** Brand colour for any theme id (built-in or custom); `undefined` when unknown. */
export function getThemeBrandHex(id: string, custom: ThemeDefinition[] = []): string | undefined {
	const def = [...custom, ...builtInThemes].find((t) => t.id === id);
	return def?.colors.brand.replace('#', '');
}
