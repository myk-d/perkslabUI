import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/** useLayoutEffect warns during SSR; this falls back to useEffect there. */
export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

/** Calls `handler` for mousedown/touchstart outside every given element. */
export function useClickOutside(refs: React.RefObject<HTMLElement | null> | React.RefObject<HTMLElement | null>[], handler: () => void, enabled = true) {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!enabled) return;
		const list = Array.isArray(refs) ? refs : [refs];
		const onPointer = (e: MouseEvent | TouchEvent) => {
			const target = e.target as Node;
			if (list.some((ref) => ref.current?.contains(target))) return;
			// A click inside a layer opened *after* this one (a DatePicker inside a Popover) is not "outside" of it.
			const own = list.map((r) => r.current).find((el) => el?.hasAttribute('data-pk-layer'));
			const hit = (target as Element).closest?.('[data-pk-layer]');
			if (own && hit && hit !== own && own.compareDocumentPosition(hit) & Node.DOCUMENT_POSITION_FOLLOWING) return;
			handlerRef.current();
		};
		document.addEventListener('mousedown', onPointer);
		document.addEventListener('touchstart', onPointer);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('touchstart', onPointer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled]);
}

export function useEscape(handler: () => void, enabled = true) {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!enabled) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') handlerRef.current();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [enabled]);
}

// Several overlays can be open at once (a confirm on top of a modal): lock the page scroll until the last one closes.
let lockCount = 0;
let previousOverflow = '';

export function useScrollLock(locked: boolean) {
	useEffect(() => {
		if (!locked) return;
		if (lockCount === 0) {
			previousOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}
		lockCount += 1;
		return () => {
			lockCount -= 1;
			if (lockCount === 0) document.body.style.overflow = previousOverflow;
		};
	}, [locked]);
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Moves focus into `containerRef` when active, keeps Tab inside it, and restores focus to the previous element on close. */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
	// Remember the opener while rendering: an `autoFocus` child is focused during commit, i.e. BEFORE any effect runs,
	// so reading document.activeElement in the effect would capture the dialog's own input instead of the opener.
	const opener = useRef<HTMLElement | null>(null);
	const wasActive = useRef(false);
	if (isBrowser && active && !wasActive.current) opener.current = document.activeElement as HTMLElement | null;
	wasActive.current = active;

	useEffect(() => {
		const container = containerRef.current;
		if (!active || !container) return;
		const previouslyFocused = opener.current;

		if (!container.contains(document.activeElement)) {
			const first = container.querySelector<HTMLElement>('[data-autofocus]') ?? container.querySelector<HTMLElement>(FOCUSABLE);
			(first ?? container).focus({ preventScroll: true });
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') return;
			const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
			if (items.length === 0) {
				e.preventDefault();
				return;
			}
			const first = items[0];
			const last = items[items.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		container.addEventListener('keydown', onKeyDown);
		return () => {
			container.removeEventListener('keydown', onKeyDown);
			previouslyFocused?.focus?.({ preventScroll: true });
		};
	}, [active, containerRef]);
}

export type Placement = 'bottom' | 'top';
export type Align = 'start' | 'center' | 'end';

interface AnchorOptions {
	open: boolean;
	placement?: Placement;
	align?: Align;
	gap?: number;
	margin?: number;
	/** Make the floating element at least as wide as the anchor (selects, menus). */
	matchWidth?: boolean;
}

/**
 * Positions a `position: fixed` floating element next to an anchor, flips to the other side when
 * there is no room, and clamps it inside the viewport. Floating elements are rendered through a
 * portal, so they are never clipped by an `overflow-hidden` ancestor and never make the page scroll.
 */
export function useAnchoredPosition(
	anchorRef: React.RefObject<HTMLElement | null>,
	floatingRef: React.RefObject<HTMLElement | null>,
	{ open, placement = 'bottom', align = 'start', gap = 8, margin = 8, matchWidth = false }: AnchorOptions,
) {
	const [style, setStyle] = useState<React.CSSProperties>({ position: 'fixed', top: 0, left: 0, opacity: 0 });

	useIsomorphicLayoutEffect(() => {
		if (!open) return;

		const update = () => {
			const anchor = anchorRef.current;
			const floating = floatingRef.current;
			if (!anchor || !floating) return;
			const a = anchor.getBoundingClientRect();
			// offset* ignore CSS transforms — an entering popup is mid-scale(0.96) and would measure too small
			const f = { width: floating.offsetWidth, height: floating.offsetHeight };

			const spaceBelow = window.innerHeight - a.bottom - gap - margin;
			const spaceAbove = a.top - gap - margin;
			const preferTop = placement === 'top';
			const opensTop = preferTop ? f.height <= spaceAbove || spaceAbove >= spaceBelow : f.height > spaceBelow && spaceAbove > spaceBelow;
			const top = opensTop ? Math.max(margin, a.top - f.height - gap) : a.bottom + gap;

			const rawLeft = align === 'start' ? a.left : align === 'end' ? a.right - f.width : a.left + a.width / 2 - f.width / 2;
			const left = Math.min(Math.max(rawLeft, margin), Math.max(margin, window.innerWidth - f.width - margin));

			const room = opensTop ? spaceAbove : spaceBelow;
			setStyle({
				position: 'fixed',
				top,
				left,
				minWidth: matchWidth ? a.width : undefined,
				maxHeight: Math.max(160, room),
			});
		};

		// the first measurement is synchronous (before paint); scroll/resize bursts are coalesced to one per frame
		let frame = 0;
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(() => ((frame = 0), update()));
		};
		update();
		window.addEventListener('resize', schedule);
		window.addEventListener('scroll', schedule, true);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('resize', schedule);
			window.removeEventListener('scroll', schedule, true);
		};
	}, [open, placement, align, gap, margin, matchWidth, anchorRef, floatingRef]);

	return style;
}
