import { useCallback, useSyncExternalStore } from 'react';

/** Subscribes to a CSS media query. SSR-safe: `false` on the server and during hydration (`defaultValue` overrides that). */
export function useMediaQuery(query: string, defaultValue = false): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			if (typeof window === 'undefined' || !window.matchMedia) return () => {};
			const mql = window.matchMedia(query);
			mql.addEventListener('change', onChange);
			return () => mql.removeEventListener('change', onChange);
		},
		[query],
	);
	const getSnapshot = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : defaultValue);
	return useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
}
