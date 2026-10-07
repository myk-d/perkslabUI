import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { CloseIcon } from '../lib/icons';
import { isBrowser, useClickOutside, useEscape, useFocusTrap, useScrollLock } from '../lib/dom';
import { useLayer } from '../lib/layers';
import { presenceAttrs, usePresence } from '../lib/presence';
import { useControllableState } from '../lib/useControllableState';
import { Pressable } from './Dialog';

/**
 * Gesture-capable drawer (vaul / Base UI style). Bottom sheet by default, dragged down to dismiss.
 * `swipeDirection` is the direction the panel is swiped to dismiss and decides where it sits: down = bottom, up = top, left = left edge, right = right edge.
 */
export type DrawerSwipeDirection = 'up' | 'down' | 'left' | 'right';
export type DrawerSnapPoint = number | string;
export type DrawerModal = boolean | 'trap-focus';

interface DrawerContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	titleId: string;
	descriptionId: string;
	swipeDirection?: DrawerSwipeDirection;
	modal: DrawerModal;
	disablePointerDismissal: boolean;
	snapPoints?: DrawerSnapPoint[];
	snapPoint: DrawerSnapPoint | null;
	setSnapPoint: (p: DrawerSnapPoint | null) => void;
	showSwipeHandle?: boolean;
	triggerRef: React.RefObject<HTMLElement | null>;
	completeRef: React.MutableRefObject<((open: boolean) => void) | undefined>;
	nested: number;
	registerNested: () => () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawer(part: string) {
	const ctx = useContext(DrawerContext);
	if (!ctx) throw new Error(`${part} must be used within <Drawer>`);
	return ctx;
}

export interface DrawerProps {
	children: React.ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Direction the panel is swiped to dismiss (and the edge it sits on, opposite). Default 'down' (bottom drawer). */
	swipeDirection?: DrawerSwipeDirection;
	/** Numbers 0-1 are a fraction of the viewport, > 1 are px, strings accept px / rem / %. Largest = fully open. */
	snapPoints?: DrawerSnapPoint[];
	/** Controlled active snap point (one of `snapPoints`). */
	snapPoint?: DrawerSnapPoint | null;
	defaultSnapPoint?: DrawerSnapPoint | null;
	onSnapPointChange?: (snapPoint: DrawerSnapPoint | null) => void;
	/** true: overlay + scroll lock + focus trap. 'trap-focus': focus trap only. false: non-modal. */
	modal?: DrawerModal;
	/** Don't close on overlay / outside press (swipe and Escape still close). */
	disablePointerDismissal?: boolean;
	/** Default for DrawerContent: show the grab handle (default: true for bottom drawers). */
	showSwipeHandle?: boolean;
	/** Called after the open/close transition has finished. */
	onOpenChangeComplete?: (open: boolean) => void;
}

export const Drawer = ({
	children,
	open,
	defaultOpen = false,
	onOpenChange,
	swipeDirection,
	snapPoints,
	snapPoint,
	defaultSnapPoint,
	onSnapPointChange,
	modal = true,
	disablePointerDismissal = false,
	showSwipeHandle,
	onOpenChangeComplete,
}: DrawerProps) => {
	const parent = useContext(DrawerContext);
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const initialSnap = defaultSnapPoint ?? snapPoints?.[0] ?? null;
	const [activeSnap, setSnapPoint] = useControllableState<DrawerSnapPoint | null>(snapPoint, initialSnap, onSnapPointChange);
	const [nested, setNested] = useState(0);
	const titleId = useId();
	const descriptionId = useId();
	const triggerRef = useRef<HTMLElement | null>(null);
	const completeRef = useRef(onOpenChangeComplete);
	completeRef.current = onOpenChangeComplete;

	const registerNested = useCallback(() => {
		setNested((n) => n + 1);
		return () => setNested((n) => n - 1);
	}, []);
	const parentRegister = parent?.registerNested;
	useEffect(() => {
		if (!isOpen || !parentRegister) return;
		return parentRegister();
	}, [isOpen, parentRegister]);

	// Uncontrolled snap goes back to the default when the drawer closes.
	useEffect(() => {
		if (!isOpen && snapPoint === undefined && activeSnap !== initialSnap) setSnapPoint(initialSnap);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const value = useMemo<DrawerContextValue>(
		() => ({ open: isOpen, setOpen, titleId, descriptionId, swipeDirection, modal, disablePointerDismissal, snapPoints, snapPoint: activeSnap, setSnapPoint, showSwipeHandle, triggerRef, completeRef, nested, registerNested }),
		[isOpen, setOpen, titleId, descriptionId, swipeDirection, modal, disablePointerDismissal, snapPoints, activeSnap, setSnapPoint, showSwipeHandle, nested, registerNested],
	);
	return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
};

export const DrawerTrigger = ({ children, className, asChild }: { children: React.ReactNode; className?: string; asChild?: boolean }) => {
	const ctx = useDrawer('DrawerTrigger');
	return (
		<Pressable ref={ctx.triggerRef as React.Ref<HTMLElement>} asChild={asChild} wrapperClass="inline-flex w-fit cursor-pointer" className={className} aria-haspopup="dialog" aria-expanded={ctx.open} data-state={ctx.open ? 'open' : 'closed'} press={() => ctx.setOpen(true)}>
			{children}
		</Pressable>
	);
};

export const DrawerClose = ({ children, className, asChild }: { children: React.ReactNode; className?: string; asChild?: boolean }) => {
	const ctx = useDrawer('DrawerClose');
	return (
		<Pressable asChild={asChild} wrapperClass="inline-flex cursor-pointer" className={className} press={() => ctx.setOpen(false)}>
			{children}
		</Pressable>
	);
};

/** Low-level: portal to document.body (DrawerContent already portals itself). */
export const DrawerPortal = ({ children }: { children: React.ReactNode }) => <Portal>{children}</Portal>;

export const DrawerOverlay = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const ctx = useDrawer('DrawerOverlay');
	return (
		<div
			className={cn('absolute inset-0 bg-page-text/30 backdrop-blur-sm', ctx.open ? 'animate-pk-fade-in' : 'animate-pk-fade-out', className)}
			data-state={ctx.open ? 'open' : 'closed'}
			onClick={ctx.disablePointerDismissal ? undefined : () => ctx.setOpen(false)}
			aria-hidden="true"
			{...props}
		/>
	);
};

export const DrawerSwipeHandle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div aria-hidden="true" data-slot="drawer-swipe-handle" className={cn('mx-auto h-1.5 w-12 shrink-0 rounded-full bg-line/50', className)} {...props} />
);

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-slot="drawer-header" className={cn('flex flex-col gap-1.5 text-center sm:text-start', className)} {...props} />;
export const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2', className)} {...props} />;
/** Scrollable section (touch-scrollable; a drag that starts here while it can still scroll scrolls instead of swiping). */
export const DrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div data-slot="drawer-body" className={cn('min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain', className)} {...props} />
);
export const DrawerTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
	const ctx = useDrawer('DrawerTitle');
	return <h2 id={ctx.titleId} className={cn('ui-heading text-lg text-page-text', className)} {...props} />;
};
export const DrawerDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
	const ctx = useDrawer('DrawerDescription');
	return <p id={ctx.descriptionId} className={cn('text-sm text-page-text/70 leading-relaxed', className)} {...props} />;
};

const SIDE_TO_DIRECTION = { bottom: 'down', top: 'up', left: 'left', right: 'right' } as const;
const AXIS: Record<DrawerSwipeDirection, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

// Literal classes so Tailwind emits them.
const PANEL_CLASS: Record<DrawerSwipeDirection, string> = {
	down: 'inset-x-0 bottom-0 mx-auto w-full max-w-lg max-h-[calc(100dvh-6rem)] rounded-t-box border-x border-t origin-bottom',
	up: 'inset-x-0 top-0 mx-auto w-full max-w-lg max-h-[calc(100dvh-6rem)] rounded-b-box border-x border-b origin-top',
	left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-box border-r origin-left',
	right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-box border-l origin-right',
};
const HANDLE_CLASS: Record<DrawerSwipeDirection, string> = {
	down: '-mt-2',
	up: 'mt-auto',
	left: 'absolute inset-y-0 end-auto right-1.5 my-auto h-12 w-1.5',
	right: 'absolute inset-y-0 left-1.5 my-auto h-12 w-1.5',
};

const NO_DRAG = 'input,textarea,select,button,a[href],label,[contenteditable=""],[contenteditable="true"],[role="slider"],[data-pk-no-drag]';
const VELOCITY_THRESHOLD = 0.4; // px/ms
const CLOSE_THRESHOLD = 0.25; // fraction of the panel

function resolveSnap(p: DrawerSnapPoint, viewport: number, rem: number): number {
	if (typeof p === 'number') return p <= 1 ? p * viewport : p;
	const m = /^\s*(-?[\d.]+)\s*(px|rem|%)?\s*$/.exec(p);
	if (!m) return 0;
	const n = parseFloat(m[1]);
	return m[2] === 'rem' ? n * rem : m[2] === '%' ? (n / 100) * viewport : n;
}

/** Walks from `el` up to `root` (inclusive) looking for a scroll container that can still scroll when the finger moves by `sign` (+1 = toward end of axis). */
function canScroll(el: HTMLElement | null, root: HTMLElement, vertical: boolean, sign: number) {
	for (let n: HTMLElement | null = el; n; n = n.parentElement) {
		const overflow = getComputedStyle(n)[vertical ? 'overflowY' : 'overflowX'];
		if ((overflow === 'auto' || overflow === 'scroll') && (vertical ? n.scrollHeight > n.clientHeight : n.scrollWidth > n.clientWidth)) {
			const pos = vertical ? n.scrollTop : n.scrollLeft;
			const max = vertical ? n.scrollHeight - n.clientHeight : n.scrollWidth - n.clientWidth;
			// finger moving toward +axis scrolls content back toward 0; toward -axis scrolls it toward max.
			if (sign > 0 ? pos > 0 : pos < max - 1) return true;
		}
		if (n === root) break;
	}
	return false;
}

const rubber = (x: number) => Math.min(Math.sqrt(x) * 2.5, 40);

export interface DrawerContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
	children: React.ReactNode;
	className?: string;
	/** @deprecated use `swipeDirection` on <Drawer>. bottom|top|left|right placement when the root has no swipeDirection. */
	side?: 'left' | 'right' | 'top' | 'bottom';
	/** Overrides <Drawer showSwipeHandle>. Default: true for bottom drawers. */
	showSwipeHandle?: boolean;
	/** Renders an X button in the corner. Default false. */
	showCloseButton?: boolean;
	closeLabel?: string;
	role?: 'dialog' | 'alertdialog';
}

export const DrawerContent = ({ children, className, side, showSwipeHandle, showCloseButton = false, closeLabel = 'Close', role = 'dialog', style, ...panelProps }: DrawerContentProps) => {
	const ctx = useDrawer('DrawerContent');
	const dir: DrawerSwipeDirection = ctx.swipeDirection ?? (side ? SIDE_TO_DIRECTION[side] : 'down');
	const vertical = dir === 'down' || dir === 'up';
	const [ax, ay] = AXIS[dir];
	const sign = vertical ? ay : ax;
	const panelRef = useRef<HTMLDivElement>(null);
	const isTop = useLayer(ctx.open);
	const { modal, disablePointerDismissal, snapPoints } = ctx;

	useScrollLock(ctx.open && modal === true);
	useEscape(() => isTop() && ctx.setOpen(false), ctx.open);
	useFocusTrap(panelRef, ctx.open && modal !== false);
	useClickOutside([panelRef, ctx.triggerRef], () => {
		if (!disablePointerDismissal && isTop()) ctx.setOpen(false);
	}, ctx.open && modal !== true);

	const { mounted, state } = usePresence(ctx.open, 320);
	const [entered, setEntered] = useState(false);
	useEffect(() => {
		if (!mounted) return setEntered(false);
		if (!ctx.open) return;
		let r2 = 0;
		const r1 = requestAnimationFrame(() => {
			r2 = requestAnimationFrame(() => setEntered(true));
		});
		return () => {
			cancelAnimationFrame(r1);
			cancelAnimationFrame(r2);
		};
	}, [mounted, ctx.open]);
	const shown = ctx.open && entered;

	const wasMounted = useRef(false);
	useEffect(() => {
		if (mounted) wasMounted.current = true;
		else if (wasMounted.current) {
			wasMounted.current = false;
			ctx.completeRef.current?.(false);
		}
	}, [mounted, ctx.completeRef]);
	useEffect(() => {
		if (!shown) return;
		const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const t = setTimeout(() => ctx.completeRef.current?.(true), reduced ? 0 : 320);
		return () => clearTimeout(t);
	}, [shown, ctx.completeRef]);

	// Snap points -> px along the swipe axis.
	const [viewport, setViewport] = useState(() => (isBrowser ? { w: window.innerWidth, h: window.innerHeight } : { w: 0, h: 0 }));
	useEffect(() => {
		const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);
	const snaps = useMemo(() => {
		if (!snapPoints?.length) return null;
		const vp = vertical ? viewport.h : viewport.w;
		const cap = vertical ? vp - 96 : vp;
		const rem = isBrowser ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;
		return snapPoints.map((p) => Math.max(0, Math.min(resolveSnap(p, vp, rem), cap)));
	}, [snapPoints, vertical, viewport]);
	const maxSnap = snaps ? Math.max(...snaps) : 0;
	const activeIndex = snapPoints ? Math.max(0, snapPoints.findIndex((p) => p === ctx.snapPoint)) : 0;
	const offset = snaps ? maxSnap - snaps[activeIndex] : 0;
	const expanded = !snaps || snaps[activeIndex] >= maxSnap;

	// Gesture.
	const drag = useRef<{ id: number; x: number; y: number; started: boolean; target: HTMLElement | null; d: number; samples: { t: number; d: number }[] } | null>(null);

	// Move/up listeners live on the document while a press is in flight: the pointer leaves the panel as soon as it is dragged away from it.
	const stopListening = useRef<(() => void) | null>(null);
	useEffect(() => () => stopListening.current?.(), []);

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		panelProps.onPointerDown?.(e);
		if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
		const target = e.target as HTMLElement;
		if (target.closest(NO_DRAG)) return;
		drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, started: false, target, d: 0, samples: [] };
		stopListening.current?.();
		const move = (ev: PointerEvent) => onPointerMove(ev);
		const up = (ev: PointerEvent) => finish(ev, false);
		const cancel = (ev: PointerEvent) => finish(ev, true);
		document.addEventListener('pointermove', move);
		document.addEventListener('pointerup', up);
		document.addEventListener('pointercancel', cancel);
		stopListening.current = () => {
			document.removeEventListener('pointermove', move);
			document.removeEventListener('pointerup', up);
			document.removeEventListener('pointercancel', cancel);
			stopListening.current = null;
		};
	};

	const onPointerMove = (e: PointerEvent) => {
		const g = drag.current;
		const panel = panelRef.current;
		if (!g || !panel || g.id !== e.pointerId) return;
		const dx = e.clientX - g.x;
		const dy = e.clientY - g.y;
		const along = vertical ? dy : dx;
		if (!g.started) {
			if (Math.hypot(dx, dy) < 6) return;
			const across = vertical ? dx : dy;
			if (Math.abs(across) > Math.abs(along) || canScroll(g.target, panel, vertical, Math.sign(along))) {
				drag.current = null;
				return;
			}
			g.started = true;
			panel.setPointerCapture(e.pointerId);
			panel.setAttribute('data-swiping', '');
		}
		let d = along * sign; // positive = toward dismissal
		if (d < -offset) d = -offset - rubber(-d - offset);
		g.d = d;
		g.samples.push({ t: e.timeStamp, d });
		while (g.samples.length > 2 && e.timeStamp - g.samples[0].t > 100) g.samples.shift();
		panel.style.setProperty('--pk-drag', `${d}px`);
		e.preventDefault();
	};

	const finish = (e: PointerEvent, cancelled: boolean) => {
		if (!drag.current || drag.current.id === e.pointerId) stopListening.current?.();
		const g = drag.current;
		const panel = panelRef.current;
		if (!g || !panel || g.id !== e.pointerId) return;
		drag.current = null;
		stopListening.current?.();
		if (!g.started) return;
		if (panel.hasPointerCapture(e.pointerId)) panel.releasePointerCapture(e.pointerId);
		panel.removeAttribute('data-swiping');
		panel.style.removeProperty('--pk-drag');
		if (cancelled) return;
		const first = g.samples[0];
		const last = g.samples[g.samples.length - 1];
		const velocity = first && last && last.t > first.t ? (last.d - first.d) / (last.t - first.t) : 0;
		const size = vertical ? panel.offsetHeight : panel.offsetWidth;
		if (snaps && snapPoints) {
			const visible = size - (offset + g.d) - velocity * 120;
			const candidates = [...snaps.map((px, i) => ({ px, i })), { px: 0, i: -1 }];
			const best = candidates.reduce((a, b) => (Math.abs(b.px - visible) < Math.abs(a.px - visible) ? b : a));
			if (best.i === -1) ctx.setOpen(false);
			else ctx.setSnapPoint(snapPoints[best.i]);
		} else if (velocity > VELOCITY_THRESHOLD || (g.d > size * CLOSE_THRESHOLD && velocity > -VELOCITY_THRESHOLD)) {
			ctx.setOpen(false);
		}
	};

	if (!mounted) return null;
	const closed = state === 'closed';
	const handle = showSwipeHandle ?? ctx.showSwipeHandle ?? dir === 'down';
	const shift = `calc((var(--pk-off, 0px) + var(--pk-drag, 0px)) * ${ax}), calc((var(--pk-off, 0px) + var(--pk-drag, 0px)) * ${ay})`;
	const transform = shown ? `translate3d(${shift}, 0) scale(calc(1 - var(--pk-nested, 0) * 0.05))` : `translate3d(${ax * 100}%, ${ay * 100}%, 0)`;
	const sizeStyle: React.CSSProperties = snaps ? (vertical ? { height: maxSnap, maxHeight: 'none' } : { width: maxSnap, maxWidth: 'none' }) : {};

	return (
		<Portal>
			<div className={cn('fixed inset-0 z-[100]', (modal !== true || closed) && 'pointer-events-none')} {...presenceAttrs(state)}>
				{modal === true && <DrawerOverlay />}
				<div
					ref={panelRef}
					role={role}
					aria-modal={modal !== false ? 'true' : undefined}
					aria-labelledby={ctx.titleId}
					aria-describedby={ctx.descriptionId}
					tabIndex={-1}
					{...panelProps}
					onPointerDown={onPointerDown}
					data-swipe-direction={dir}
					data-state={state}
					data-snap-points={snaps ? 'true' : 'false'}
					data-expanded={expanded ? '' : undefined}
					data-nested-drawer-open={ctx.nested > 0 ? '' : undefined}
					style={{ ...sizeStyle, ...style, transform, '--pk-off': `${offset}px`, '--pk-nested': ctx.nested } as React.CSSProperties}
					className={cn(
						'pointer-events-auto absolute flex touch-none flex-col gap-4 overflow-y-auto bg-surface p-6 text-page-text shadow-pop outline-none border-line',
						'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform motion-reduce:transition-none data-swiping:select-none data-swiping:transition-none',
						PANEL_CLASS[dir],
						className,
					)}
				>
					{showCloseButton && (
						<button
							type="button"
							onClick={() => ctx.setOpen(false)}
							aria-label={closeLabel}
							className="absolute end-4 top-4 z-10 rounded-item p-1 text-muted hover:text-page-text hover:bg-hover transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
						>
							<CloseIcon className="size-5" />
						</button>
					)}
					{handle && dir === 'down' && <DrawerSwipeHandle className={HANDLE_CLASS.down} />}
					{children}
					{handle && dir !== 'down' && <DrawerSwipeHandle className={HANDLE_CLASS[dir]} />}
				</div>
			</div>
		</Portal>
	);
};
