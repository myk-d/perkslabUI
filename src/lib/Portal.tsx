import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const subscribe = () => () => {};

interface PortalProps {
	children: React.ReactNode;
	/**
	 * Optional anchor element inside the React tree. When the anchor lives inside a nested
	 * `[data-theme]`, `[data-ui]` or `[dir]` scope (not on `<html>`), the portalled content
	 * inherits those attributes so scoped themes and RTL never break in popups.
	 */
	anchorRef?: React.RefObject<HTMLElement | null>;
}

function resolveScope(el: HTMLElement | null) {
	if (!el || typeof document === 'undefined') return null;
	const root = document.documentElement;
	const themeHost = el.closest('[data-theme]');
	const uiHost = el.closest('[data-ui]');
	const dirHost = el.closest('[dir]');

	const theme = themeHost && themeHost !== root ? themeHost.getAttribute('data-theme') : null;
	const ui = uiHost && uiHost !== root ? uiHost.getAttribute('data-ui') : null;
	const dir = dirHost && dirHost !== root ? dirHost.getAttribute('dir') : null;

	if (!theme && !ui && !dir) return null;
	return { theme: theme ?? undefined, ui: ui ?? undefined, dir: dir ?? undefined };
}

/**
 * Renders children into document.body. `false` on the server and during hydration, `true` on every client render after,
 * so a popup opened later is in the DOM during its very first render (anchored positioning can measure it right away)
 * while SSR/hydration stays mismatch-free.
 */
export function Portal({ children, anchorRef }: PortalProps) {
	const mounted = useSyncExternalStore(subscribe, () => true, () => false);
	if (!mounted) return null;

	const scope = anchorRef ? resolveScope(anchorRef.current) : null;
	const content = scope ? (
		<div data-theme={scope.theme} data-ui={scope.ui} dir={scope.dir} style={{ display: 'contents' }}>
			{children}
		</div>
	) : (
		children
	);

	return createPortal(content, document.body);
}
