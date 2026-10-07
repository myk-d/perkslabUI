import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isBrowser, useIsomorphicLayoutEffect } from '../../lib/dom';
import { builtInThemes, colorsToDeclarations, themeCssVars, themeToCss, type Theme, type ThemeColors, type ThemeDefinition, type UiStyle } from '../../theme/themes';

export { themeHexColors } from '../../theme/themes';
export type { Theme, ThemeColors, ThemeDefinition, UiStyle } from '../../theme/themes';

interface ThemeContextType {
	/** What the user picked — may be 'system'. */
	theme: Theme;
	/** What is actually applied (never 'system'). */
	resolvedTheme: string;
	setTheme: (theme: Theme) => void;
	ui: UiStyle;
	setUi: (ui: UiStyle) => void;
	/** Per-user colour overrides on top of the active theme (e.g. a custom brand colour). */
	colors: Partial<ThemeColors>;
	setColors: (colors: Partial<ThemeColors> | null) => void;
	/** Built-in + custom themes. */
	themes: ThemeDefinition[];
}

export interface ThemeProviderProps {
	children: React.ReactNode;
	/** Theme used until the user picks one. Default 'light'. */
	defaultTheme?: Theme;
	/** UI style used until the user picks one. Default 'perks'. */
	defaultUi?: UiStyle;
	/** Your own colour themes, usable by id everywhere a built-in id is. Same shape as the built-in ones. */
	themes?: ThemeDefinition[];
	/** Colours forced on top of every theme (app-wide brand override). Users can still layer `setColors` on top. */
	colors?: Partial<ThemeColors>;
	/** localStorage key for the colour theme. Default 'app-theme' (what earlier versions used). */
	storageKey?: string;
	/** Set false to keep the choice in memory only. */
	persist?: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const readStorage = (key: string): string | null => {
	if (!isBrowser) return null;
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
};
const writeStorage = (key: string, value: string | null) => {
	if (!isBrowser) return;
	try {
		if (value === null) window.localStorage.removeItem(key);
		else window.localStorage.setItem(key, value);
	} catch {
		/* private mode / quota — the choice just won't persist */
	}
};

const systemTheme = () => (isBrowser && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function parseColors(raw: string | null): Partial<ThemeColors> {
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
	children,
	defaultTheme = 'light',
	defaultUi = 'perks',
	themes: customThemes,
	colors: forcedColors,
	storageKey = 'app-theme',
	persist = true,
}) => {
	const uiKey = `${storageKey}-ui`;
	const colorsKey = `${storageKey}-colors`;

	const [theme, setThemeState] = useState<Theme>(() => (persist ? readStorage(storageKey) : null) || defaultTheme);
	const [ui, setUiState] = useState<UiStyle>(() => ((persist ? readStorage(uiKey) : null) as UiStyle) || defaultUi);
	const [userColors, setUserColors] = useState<Partial<ThemeColors>>(() => (persist ? parseColors(readStorage(colorsKey)) : {}));
	const [systemMode, setSystemMode] = useState<'light' | 'dark'>(systemTheme);

	const themes = useMemo(() => [...builtInThemes, ...(customThemes ?? [])], [customThemes]);
	const resolvedTheme = theme === 'system' ? systemMode : theme;

	useEffect(() => {
		if (theme !== 'system' || !isBrowser || !window.matchMedia) return;
		const query = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = () => setSystemMode(query.matches ? 'dark' : 'light');
		onChange();
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	}, [theme]);

	// Custom themes become real CSS rules, so they behave exactly like the built-in ones (nested scopes, SSR snapshots, devtools).
	useIsomorphicLayoutEffect(() => {
		if (!customThemes?.length) return;
		const style = document.createElement('style');
		style.setAttribute('data-perkslab-themes', '');
		style.textContent = customThemes.map(themeToCss).join('\n');
		document.head.appendChild(style);
		return () => style.remove();
	}, [customThemes]);

	useIsomorphicLayoutEffect(() => {
		const root = document.documentElement;
		root.setAttribute('data-theme', resolvedTheme);
		root.setAttribute('data-ui', ui);
		if (persist) {
			writeStorage(storageKey, theme);
			writeStorage(uiKey, ui);
		}
	}, [theme, resolvedTheme, ui, persist, storageKey, uiKey]);

	// Colour overrides are inline custom properties on <html>: they beat every [data-theme] rule, and are removed again when cleared.
	const colors = useMemo(() => ({ ...forcedColors, ...userColors }), [forcedColors, userColors]);
	useIsomorphicLayoutEffect(() => {
		const root = document.documentElement;
		const mode = themes.find((t) => t.id === resolvedTheme)?.mode ?? (resolvedTheme.endsWith('dark') ? 'dark' : 'light');
		const applied: string[] = [];
		for (const decl of colorsToDeclarations(colors, mode)) {
			const [prop, ...rest] = decl.replace(/;$/, '').split(': ');
			root.style.setProperty(prop, rest.join(': '));
			applied.push(prop);
		}
		return () => applied.forEach((prop) => root.style.removeProperty(prop));
	}, [colors, resolvedTheme, themes]);

	const setTheme = useCallback((next: Theme) => setThemeState(next), []);
	const setUi = useCallback((next: UiStyle) => setUiState(next), []);
	const setColors = useCallback(
		(next: Partial<ThemeColors> | null) => {
			setUserColors(next ?? {});
			if (persist) writeStorage(colorsKey, next && Object.keys(next).length ? JSON.stringify(next) : null);
		},
		[persist, colorsKey],
	);

	const value = useMemo(
		() => ({ theme, resolvedTheme, setTheme, ui, setUi, colors, setColors, themes }),
		[theme, resolvedTheme, setTheme, ui, setUi, colors, setColors, themes],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
	return context;
};

/**
 * Inline this in <head> (before your bundle) so the saved theme is applied before first paint — no flash of the wrong theme:
 *   <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
 */
// eslint-disable-next-line react-refresh/only-export-components
export function themeInitScript({ storageKey = 'app-theme', defaultTheme = 'light', defaultUi = 'perks' } = {}): string {
	const vars = JSON.stringify(themeCssVars);
	return `(function(){try{var d=document.documentElement,k=${JSON.stringify(storageKey)},t=localStorage.getItem(k)||${JSON.stringify(defaultTheme)},u=localStorage.getItem(k+'-ui')||${JSON.stringify(defaultUi)};if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t);d.setAttribute('data-ui',u);var c=JSON.parse(localStorage.getItem(k+'-colors')||'{}'),m=${vars};for(var n in c)if(m[n])d.style.setProperty(m[n],c[n])}catch(e){}})();`;
}
