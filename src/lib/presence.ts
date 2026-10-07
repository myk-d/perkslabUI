import { useEffect, useState } from 'react';

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Keeps an element mounted for `exitMs` after `open` turns false so it can play an exit animation.
 * `mounted` is true in the very same render `open` becomes true (no invisible frame), and with
 * prefers-reduced-motion the exit delay is 0.
 */
export function usePresence(open: boolean, exitMs = 150): { mounted: boolean; state: 'open' | 'closed' } {
	const [prevOpen, setPrevOpen] = useState(open);
	const [lingering, setLingering] = useState(false);

	// Derived state during render: flips in the same render as `open`, so the DOM node never unmounts between.
	if (prevOpen !== open) {
		setPrevOpen(open);
		setLingering(!open && exitMs > 0 && !prefersReducedMotion());
	}

	useEffect(() => {
		if (!lingering) return;
		const t = setTimeout(() => setLingering(false), exitMs);
		return () => clearTimeout(t);
	}, [lingering, exitMs]);

	return { mounted: open || lingering, state: open ? 'open' : 'closed' };
}

/** Attributes for an element that is playing its exit animation: not interactive, hidden from AT, not focusable. */
export function presenceAttrs(state: 'open' | 'closed') {
	return state === 'closed' ? { 'data-state': 'closed', 'aria-hidden': true, inert: '' } : { 'data-state': 'open' };
}
