import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const subscribe = () => () => {};

/**
 * Renders children into document.body. `false` on the server and during hydration, `true` on every client render after,
 * so a popup opened later is in the DOM during its very first render (anchored positioning can measure it right away)
 * while SSR/hydration stays mismatch-free.
 */
export function Portal({ children }: { children: React.ReactNode }) {
	const mounted = useSyncExternalStore(subscribe, () => true, () => false);
	return mounted ? createPortal(children, document.body) : null;
}
