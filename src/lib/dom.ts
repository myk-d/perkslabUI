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

// Several overlays can be open at once (a confirm on top of a modal): lock the page scroll until the last one closes,
// compensating for the system scrollbar width so the layout never shifts horizontally.
let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

export function useScrollLock(locked: boolean) {
	useEffect(() => {
		if (!locked || !isBrowser) return;
		if (lockCount === 0) {
			previousOverflow = document.body.style.overflow;
			previousPaddingRight = document.body.style.paddingRight;
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			if (scrollbarWidth > 0) {
				const existing = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
				document.body.style.paddingRight = `${existing + scrollbarWidth}px`;
				document.documentElement.style.setProperty('--pk-scrollbar-w', `${scrollbarWidth}px`);
			}
			document.body.style.overflow = 'hidden';
		}
		lockCount += 1;
		return () => {
			lockCount -= 1;
			if (lockCount === 0) {
				document.body.style.overflow = previousOverflow;
				document.body.style.paddingRight = previousPaddingRight;
				document.documentElement.style.removeProperty('--pk-scrollbar-w');
			}
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

export type Placement = 'bottom' | 'top' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';

export interface AnchorOptions {
	open: boolean;
	placement?: Placement;
	align?: Align;
	gap?: number;
	margin?: number;
	/** Make the floating element at least as wide as the anchor (selects, menus). */
	matchWidth?: boolean;
	/** Change to force immediate repositioning while already open (e.g. ContextMenu pointer coordinates). */
	repositionKey?: string | number;
	/** Hide the popup if the anchor scrolls completely outside its clipping ancestor or viewport. Default true. */
	hideWhenDetached?: boolean;
}

export interface AnchoredPosition {
	style: React.CSSProperties;
	side: Placement;
	align: Align;
	hidden: boolean;
}

const CLIP_OVERFLOW = /auto|scroll|hidden|clip/;

function isAnchorDetached(anchor: HTMLElement, rect: DOMRect): boolean {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) return true;
	// Fixed virtual anchors (e.g. ContextMenu pointer marker) aren't clipped by scroll containers.
	if (getComputedStyle(anchor).position === 'fixed') return false;

	let parent = anchor.parentElement;
	while (parent && parent !== document.body && parent !== document.documentElement) {
		const cs = getComputedStyle(parent);
		if (CLIP_OVERFLOW.test(cs.overflow + cs.overflowX + cs.overflowY)) {
			const pr = parent.getBoundingClientRect();
			if (rect.bottom < pr.top || rect.top > pr.bottom || rect.right < pr.left || rect.left > pr.right) {
				return true;
			}
		}
		parent = parent.parentElement;
	}
	return false;
}

function getTransformOrigin(side: Placement, align: Align): string {
	const alignH = align === 'end' ? 'right' : align === 'center' ? 'center' : 'left';
	const alignV = align === 'end' ? 'bottom' : align === 'center' ? 'center' : 'top';
	if (side === 'bottom') return `top ${alignH}`;
	if (side === 'top') return `bottom ${alignH}`;
	if (side === 'right') return `${alignV} left`;
	return `${alignV} right`;
}

/**
 * Positions a `position: fixed` floating element next to an anchor across all 4 sides,
 * flips when space is tight, clamps inside the viewport (both width and height), watches both
 * anchor and floating element resizes via ResizeObserver, hides if the anchor scrolls out of
 * view, and computes directional `transformOrigin` + `side` for origin-aware animations.
 */
export function useAnchoredPosition(
	anchorRef: React.RefObject<HTMLElement | null>,
	floatingRef: React.RefObject<HTMLElement | null>,
	{ open, placement = 'bottom', align = 'start', gap = 8, margin = 8, matchWidth = false, repositionKey, hideWhenDetached = true }: AnchorOptions,
): AnchoredPosition {
	const [state, setState] = useState<AnchoredPosition>({
		style: { position: 'fixed', top: 0, left: 0, opacity: 0 },
		side: placement,
		align,
		hidden: false,
	});

	useIsomorphicLayoutEffect(() => {
		if (!open) return;

		const update = () => {
			const anchor = anchorRef.current;
			const floating = floatingRef.current;
			if (!anchor || !floating) return;

			const a = anchor.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const maxWidth = Math.max(0, vw - margin * 2);

			// offset* ignore CSS transforms — an entering popup is mid-scale(0.96) and would measure too small.
			const fWidth = Math.min(floating.offsetWidth, maxWidth || floating.offsetWidth);
			// scrollHeight catches the true natural content height even when a previous maxHeight clamped offsetHeight.
			const borderY = floating.offsetHeight - floating.clientHeight;
			const naturalHeight = Math.max(floating.offsetHeight, floating.scrollHeight + borderY);

			const detached = hideWhenDetached && isAnchorDetached(anchor, a);

			let side: Placement = placement;
			let top = margin;
			let left = margin;
			let maxHeight = Math.max(120, vh - margin * 2);

			if (placement === 'bottom' || placement === 'top') {
				const spaceBelow = vh - a.bottom - gap - margin;
				const spaceAbove = a.top - gap - margin;
				const preferTop = placement === 'top';
				const opensTop = preferTop ? naturalHeight <= spaceAbove || spaceAbove >= spaceBelow : naturalHeight > spaceBelow && spaceAbove > spaceBelow;
				side = opensTop ? 'top' : 'bottom';

				const room = opensTop ? spaceAbove : spaceBelow;
				maxHeight = Math.max(120, Math.floor(Math.min(vh - margin * 2, Math.max(room, 120))));
				const effectiveHeight = Math.min(naturalHeight, maxHeight);

				top = opensTop ? Math.max(margin, a.top - effectiveHeight - gap) : Math.min(a.bottom + gap, Math.max(margin, vh - effectiveHeight - margin));

				const rawLeft = align === 'start' ? a.left : align === 'end' ? a.right - fWidth : a.left + a.width / 2 - fWidth / 2;
				left = Math.min(Math.max(rawLeft, margin), Math.max(margin, vw - fWidth - margin));
			} else {
				const spaceRight = vw - a.right - gap - margin;
				const spaceLeft = a.left - gap - margin;
				const preferLeft = placement === 'left';
				const opensLeft = preferLeft ? fWidth <= spaceLeft || spaceLeft >= spaceRight : fWidth > spaceRight && spaceLeft > spaceRight;
				side = opensLeft ? 'left' : 'right';

				const effectiveHeight = Math.min(naturalHeight, maxHeight);
				left = opensLeft ? Math.max(margin, a.left - fWidth - gap) : Math.min(a.right + gap, Math.max(margin, vw - fWidth - margin));

				const rawTop = align === 'start' ? a.top : align === 'end' ? a.bottom - effectiveHeight : a.top + a.height / 2 - effectiveHeight / 2;
				top = Math.min(Math.max(rawTop, margin), Math.max(margin, vh - effectiveHeight - margin));
			}

			const roundedTop = Math.round(top * 10) / 10;
			const roundedLeft = Math.round(left * 10) / 10;
			const minWidth = matchWidth ? Math.min(a.width, maxWidth || a.width) : undefined;
			const transformOrigin = getTransformOrigin(side, align);

			setState((prev) => {
				const ps = prev.style;
				if (
					prev.side === side &&
					prev.align === align &&
					prev.hidden === detached &&
					ps.top === roundedTop &&
					ps.left === roundedLeft &&
					ps.maxHeight === maxHeight &&
					ps.maxWidth === maxWidth &&
					ps.minWidth === minWidth &&
					ps.transformOrigin === transformOrigin &&
					ps.opacity === undefined
				) {
					return prev;
				}
				return {
					side,
					align,
					hidden: detached,
					style: {
						position: 'fixed',
						top: roundedTop,
						left: roundedLeft,
						minWidth,
						maxWidth,
						maxHeight,
						transformOrigin,
						...(detached ? { visibility: 'hidden', pointerEvents: 'none' } : undefined),
					},
				};
			});
		};

		// First measurement is synchronous (before paint); scroll/resize bursts coalesce to one per frame.
		let frame = 0;
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(() => ((frame = 0), update()));
		};

		update();

		let ro: ResizeObserver | undefined;
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver(schedule);
			if (anchorRef.current) ro.observe(anchorRef.current);
			if (floatingRef.current) ro.observe(floatingRef.current);
		}

		window.addEventListener('resize', schedule);
		window.addEventListener('scroll', schedule, true);
		return () => {
			cancelAnimationFrame(frame);
			ro?.disconnect();
			window.removeEventListener('resize', schedule);
			window.removeEventListener('scroll', schedule, true);
		};
	}, [open, placement, align, gap, margin, matchWidth, repositionKey, hideWhenDetached, anchorRef, floatingRef]);

	return state;
}
