import React, { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { isBrowser, useIsomorphicLayoutEffect } from '../lib/dom';
import { ChevronDownIcon } from '../lib/icons';
import { Button, type ButtonProps } from './Button';

export type MessageScrollerPosition = 'start' | 'end' | 'last-anchor';

export interface ScrollToMessageOptions {
	behavior?: ScrollBehavior;
}

export interface MessageScrollerActions {
	/** Scrolls so the row sits at the top of the viewport (minus `scrollPreviousItemPeek`). */
	scrollToMessage: (messageId: string, options?: ScrollToMessageOptions) => void;
	/** Scrolls to the live edge and re-engages `autoScroll`. */
	scrollToEnd: (options?: ScrollToMessageOptions) => void;
	scrollToStart: (options?: ScrollToMessageOptions) => void;
}

export interface MessageScrollerVisibility {
	/** The last `scrollAnchor` row at (or above) the top of the viewport, or null. */
	currentAnchorId: string | null;
	/** Ids of rows intersecting the viewport, in document order. */
	visibleMessageIds: string[];
}

export interface MessageScrollerScrollable {
	/** There is content above the current scroll position. */
	start: boolean;
	/** There is content below the current scroll position. */
	end: boolean;
}

interface ItemEntry {
	el: HTMLElement;
	anchor: boolean;
}

interface Internals {
	viewportRef: React.MutableRefObject<HTMLDivElement | null>;
	register: (id: string, el: HTMLElement, anchor: boolean) => () => void;
	setVisible: (id: string, visible: boolean) => void;
	onResize: () => void;
	onScroll: () => void;
	releaseLock: () => void;
}

const ActionsContext = createContext<MessageScrollerActions | null>(null);
const VisibilityContext = createContext<MessageScrollerVisibility | null>(null);
const ScrollableContext = createContext<MessageScrollerScrollable | null>(null);
const InternalsContext = createContext<Internals | null>(null);

const EDGE = 24;

const prefersReducedMotion = () => isBrowser && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const resolveBehavior = (b: ScrollBehavior | undefined): ScrollBehavior => (prefersReducedMotion() ? 'auto' : (b ?? 'smooth'));

export interface MessageScrollerProviderProps {
	/** Keep streamed replies in view while the reader is at the live edge; releases when they scroll away and re-engages when they return to the bottom. Default true. */
	autoScroll?: boolean;
	/** Where the transcript opens. `last-anchor` = the last row with `scrollAnchor`. Default `end`. */
	defaultScrollPosition?: MessageScrollerPosition;
	/** Pixels of the previous row kept visible above a newly anchored row. Default 0. */
	scrollPreviousItemPeek?: number;
	/** When rows are added above the first one, keep the visible row steady. Default true. */
	preserveScrollOnPrepend?: boolean;
	children?: React.ReactNode;
}

/**
 * Headless: owns scroll state for `MessageScrollerViewport` + `MessageScrollerItem`s.
 *
 * Behaviour: a newly appended row with `scrollAnchor` (a user turn) is scrolled to the top of the viewport. While that
 * anchor stays pinned the reply grows below it; once the reply is long enough that following would push the anchor out
 * of view, following stops. Without an anchor, replies are followed to the bottom while the reader is at the live edge.
 */
export const MessageScrollerProvider = ({
	autoScroll = true,
	defaultScrollPosition = 'end',
	scrollPreviousItemPeek = 0,
	preserveScrollOnPrepend = true,
	children,
}: MessageScrollerProviderProps) => {
	const [scrollable, setScrollable] = useState<MessageScrollerScrollable>({ start: false, end: false });
	const [currentAnchorId, setCurrentAnchorId] = useState<string | null>(null);
	const [visibleMessageIds, setVisibleMessageIds] = useState<string[]>([]);

	const propsRef = useRef({ autoScroll, defaultScrollPosition, scrollPreviousItemPeek, preserveScrollOnPrepend });
	propsRef.current = { autoScroll, defaultScrollPosition, scrollPreviousItemPeek, preserveScrollOnPrepend };

	const viewportRef = useRef<HTMLDivElement | null>(null);

	const { actions, internals } = useMemo(() => {
		const items = new Map<string, ItemEntry>();
		const seen = new Set<string>();
		const visible = new Set<string>();
		let initialDone = false;
		let initialScheduled = false;
		let following = false;
		let anchorId: string | null = null;
		let locked = false;
		let lockTimer: ReturnType<typeof setTimeout> | undefined;
		let prevFirstId: string | null = null;
		const snap = { top: 0, height: 0 };

		const offsetOf = (el: HTMLElement) => {
			const v = viewportRef.current!;
			return el.getBoundingClientRect().top - v.getBoundingClientRect().top + v.scrollTop;
		};
		const anchorTarget = (id: string) => {
			const entry = items.get(id);
			return entry && viewportRef.current ? Math.max(0, offsetOf(entry.el) - propsRef.current.scrollPreviousItemPeek) : null;
		};
		const firstId = () => viewportRef.current?.querySelector<HTMLElement>('[data-message-id]')?.dataset.messageId ?? null;
		const inDomOrder = (ids: string[]) =>
			ids.sort((a, b) => {
				const ea = items.get(a)?.el;
				const eb = items.get(b)?.el;
				if (!ea || !eb) return 0;
				return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
			});

		const measure = () => {
			const el = viewportRef.current;
			if (!el) return;
			const max = el.scrollHeight - el.clientHeight;
			const start = el.scrollTop > 1;
			const end = max - el.scrollTop > 1;
			setScrollable((p) => (p.start === start && p.end === end ? p : { start, end }));
			snap.top = el.scrollTop;
			snap.height = el.scrollHeight;

			let current: string | null = null;
			const anchors = inDomOrder([...items.entries()].filter(([, e]) => e.anchor).map(([id]) => id));
			for (const id of anchors) {
				const t = anchorTarget(id);
				if (t !== null && t <= el.scrollTop + 1) current = id;
			}
			setCurrentAnchorId((p) => (p === current ? p : current));
		};

		/** Decides whether the reader is "at the live edge" after a scroll that was not made by us. */
		const evaluate = () => {
			const el = viewportRef.current;
			if (!el) return;
			measure();
			const max = el.scrollHeight - el.clientHeight;
			const atEnd = max - el.scrollTop <= EDGE;
			if (anchorId) {
				const target = anchorTarget(anchorId);
				if (target === null) anchorId = null;
				else if (atEnd && el.scrollTop > target + 1) anchorId = null;
				else {
					following = atEnd || el.scrollTop >= target - EDGE;
					return;
				}
			}
			following = atEnd;
		};

		const follow = () => {
			const el = viewportRef.current;
			if (!el || !propsRef.current.autoScroll || !following || locked) return;
			let target = el.scrollHeight - el.clientHeight;
			if (anchorId) {
				const t = anchorTarget(anchorId);
				if (t !== null) target = Math.min(target, t);
			}
			if (target > el.scrollTop + 0.5) el.scrollTo({ top: target, behavior: 'auto' });
			measure();
		};

		const lock = (ms: number) => {
			locked = true;
			clearTimeout(lockTimer);
			lockTimer = setTimeout(() => {
				locked = false;
				evaluate();
				follow();
			}, ms);
		};

		const releaseLock = () => {
			if (!locked) return;
			locked = false;
			clearTimeout(lockTimer);
		};

		const scrollTo = (top: number, behavior: ScrollBehavior) => {
			const el = viewportRef.current;
			if (!el) return;
			if (behavior === 'smooth') {
				lock(600);
				el.scrollTo({ top, behavior });
			} else {
				el.scrollTo({ top, behavior: 'auto' });
				evaluate();
			}
		};

		const actions: MessageScrollerActions = {
			scrollToMessage: (id, options) => {
				const t = anchorTarget(id);
				if (t === null) return;
				anchorId = null;
				following = false;
				scrollTo(t, resolveBehavior(options?.behavior));
			},
			scrollToEnd: (options) => {
				const el = viewportRef.current;
				if (!el) return;
				anchorId = null;
				following = true;
				scrollTo(el.scrollHeight - el.clientHeight, resolveBehavior(options?.behavior));
			},
			scrollToStart: (options) => {
				anchorId = null;
				following = false;
				scrollTo(0, resolveBehavior(options?.behavior));
			},
		};

		const applyInitial = () => {
			initialDone = true;
			const el = viewportRef.current;
			if (!el) return;
			prevFirstId = firstId();
			const pos = propsRef.current.defaultScrollPosition;
			if (pos === 'end') el.scrollTop = el.scrollHeight;
			else if (pos === 'start') el.scrollTop = 0;
			else {
				const anchors = inDomOrder([...items.entries()].filter(([, e]) => e.anchor).map(([id]) => id));
				const last = anchors[anchors.length - 1];
				const t = last ? anchorTarget(last) : null;
				el.scrollTop = t !== null ? t : el.scrollHeight;
			}
			evaluate();
		};

		const register = (id: string, el: HTMLElement, anchor: boolean) => {
			items.set(id, { el, anchor });
			const isNew = !seen.has(id);
			seen.add(id);

			if (!initialDone) {
				if (!initialScheduled) {
					initialScheduled = true;
					Promise.resolve().then(applyInitial);
				}
			} else if (viewportRef.current) {
				const v = viewportRef.current;
				const first = firstId();
				if (propsRef.current.preserveScrollOnPrepend && prevFirstId !== null && first !== prevFirstId && isNew) {
					const delta = v.scrollHeight - snap.height;
					if (delta > 0) {
						v.scrollTop = snap.top + delta;
						snap.top = v.scrollTop;
						snap.height = v.scrollHeight;
					}
				}
				prevFirstId = first;

				const all = v.querySelectorAll<HTMLElement>('[data-message-id]');
				const isLast = all[all.length - 1] === el;
				if (anchor && isNew && isLast) {
					anchorId = id;
					following = true;
					const t = anchorTarget(id);
					if (t !== null) scrollTo(t, resolveBehavior('smooth'));
				}
			}
			return () => {
				if (items.get(id)?.el === el) items.delete(id);
				visible.delete(id);
			};
		};

		const internals: Omit<Internals, 'viewportRef'> = {
			register,
			setVisible: (id, isVisible) => {
				const had = visible.has(id);
				if (isVisible === had) return;
				if (isVisible) visible.add(id);
				else visible.delete(id);
				const next = inDomOrder([...visible]);
				setVisibleMessageIds((p) => (p.length === next.length && p.every((x, i) => x === next[i]) ? p : next));
			},
			onResize: () => {
				if (!locked) follow();
				measure();
			},
			onScroll: () => {
				if (!locked) evaluate();
				else measure();
			},
			releaseLock,
		};
		return { actions, internals };
	}, []);

	const fullInternals = useMemo<Internals>(() => ({ ...internals, viewportRef }), [internals]);

	return (
		<InternalsContext.Provider value={fullInternals}>
			<ActionsContext.Provider value={actions}>
				<ScrollableContext.Provider value={scrollable}>
					<VisibilityContextProvider currentAnchorId={currentAnchorId} visibleMessageIds={visibleMessageIds}>
						{children}
					</VisibilityContextProvider>
				</ScrollableContext.Provider>
			</ActionsContext.Provider>
		</InternalsContext.Provider>
	);
};

const VisibilityContextProvider = ({ currentAnchorId, visibleMessageIds, children }: MessageScrollerVisibility & { children: React.ReactNode }) => {
	const value = useMemo(() => ({ currentAnchorId, visibleMessageIds }), [currentAnchorId, visibleMessageIds]);
	return <VisibilityContext.Provider value={value}>{children}</VisibilityContext.Provider>;
};

const useInternals = () => {
	const ctx = useContext(InternalsContext);
	if (!ctx) throw new Error('MessageScroller parts must be used within MessageScrollerProvider (or MessageScroller)');
	return ctx;
};

export const useMessageScroller = (): MessageScrollerActions => {
	const ctx = useContext(ActionsContext);
	if (!ctx) throw new Error('useMessageScroller must be used within MessageScrollerProvider');
	return ctx;
};

export const useMessageScrollerVisibility = (): MessageScrollerVisibility => {
	const ctx = useContext(VisibilityContext);
	if (!ctx) throw new Error('useMessageScrollerVisibility must be used within MessageScrollerProvider');
	return ctx;
};

export const useMessageScrollerScrollable = (): MessageScrollerScrollable => {
	const ctx = useContext(ScrollableContext);
	if (!ctx) throw new Error('useMessageScrollerScrollable must be used within MessageScrollerProvider');
	return ctx;
};

export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement>, MessageScrollerProviderProps {}

/** Styled relative frame. Give it a height (e.g. `h-[480px]`); it wraps its children in `MessageScrollerProvider`. */
export const MessageScroller = forwardRef<HTMLDivElement, MessageScrollerProps>(
	({ autoScroll, defaultScrollPosition, scrollPreviousItemPeek, preserveScrollOnPrepend, className, children, ...props }, ref) => (
		<MessageScrollerProvider
			autoScroll={autoScroll}
			defaultScrollPosition={defaultScrollPosition}
			scrollPreviousItemPeek={scrollPreviousItemPeek}
			preserveScrollOnPrepend={preserveScrollOnPrepend}
		>
			<div ref={ref} className={cn('relative flex h-full min-h-0 flex-col', className)} {...props}>
				{children}
			</div>
		</MessageScrollerProvider>
	),
);
MessageScroller.displayName = 'MessageScroller';

export const MessageScrollerViewport = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, style, children, ...props }, ref) => {
	const internals = useInternals();

	const setRefs = useCallback(
		(node: HTMLDivElement | null) => {
			internals.viewportRef.current = node;
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
		},
		[internals, ref],
	);

	useEffect(() => {
		const el = internals.viewportRef.current;
		if (!el) return;
		const onScroll = () => internals.onScroll();
		const onUser = () => internals.releaseLock();
		el.addEventListener('scroll', onScroll, { passive: true });
		el.addEventListener('wheel', onUser, { passive: true });
		el.addEventListener('touchstart', onUser, { passive: true });
		el.addEventListener('pointerdown', onUser, { passive: true });
		el.addEventListener('keydown', onUser);
		let ro: ResizeObserver | undefined;
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver(() => internals.onResize());
			ro.observe(el);
		}
		internals.onScroll();
		return () => {
			el.removeEventListener('scroll', onScroll);
			el.removeEventListener('wheel', onUser);
			el.removeEventListener('touchstart', onUser);
			el.removeEventListener('pointerdown', onUser);
			el.removeEventListener('keydown', onUser);
			ro?.disconnect();
		};
	}, [internals]);

	return (
		<div
			ref={setRefs}
			tabIndex={0}
			// The browser's own scroll anchoring would fight with the prepend compensation.
			style={{ overflowAnchor: 'none', ...style }}
			className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain pk-scrollbar outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand', className)}
			{...props}
		>
			{children}
		</div>
	);
});
MessageScrollerViewport.displayName = 'MessageScrollerViewport';

export const MessageScrollerContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
	const internals = useInternals();
	const innerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const el = innerRef.current;
		if (!el || typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(() => internals.onResize());
		ro.observe(el);
		return () => ro.disconnect();
	}, [internals]);

	const setRefs = useCallback(
		(node: HTMLDivElement | null) => {
			innerRef.current = node;
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
		},
		[ref],
	);

	return <div ref={setRefs} role="log" aria-live="polite" aria-relevant="additions text" className={cn('flex flex-col gap-4 p-4', className)} {...props} />;
});
MessageScrollerContent.displayName = 'MessageScrollerContent';

export interface MessageScrollerItemProps extends React.HTMLAttributes<HTMLDivElement> {
	messageId: string;
	/** Marks the row as a scroll anchor (a user turn): when appended it is scrolled to the top of the viewport. */
	scrollAnchor?: boolean;
}

export const MessageScrollerItem = forwardRef<HTMLDivElement, MessageScrollerItemProps>(({ messageId, scrollAnchor = false, className, children, ...props }, ref) => {
	const internals = useInternals();
	const innerRef = useRef<HTMLDivElement | null>(null);

	const setRefs = useCallback(
		(node: HTMLDivElement | null) => {
			innerRef.current = node;
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
		},
		[ref],
	);

	useIsomorphicLayoutEffect(() => {
		const el = innerRef.current;
		if (!el) return;
		return internals.register(messageId, el, scrollAnchor);
	}, [internals, messageId, scrollAnchor]);

	useEffect(() => {
		const el = innerRef.current;
		if (!el) return;
		const cleanups: Array<() => void> = [];
		if (typeof ResizeObserver !== 'undefined') {
			const ro = new ResizeObserver(() => internals.onResize());
			ro.observe(el);
			cleanups.push(() => ro.disconnect());
		}
		if (typeof IntersectionObserver !== 'undefined') {
			const io = new IntersectionObserver((entries) => entries.forEach((e) => internals.setVisible(messageId, e.isIntersecting)), { root: internals.viewportRef.current });
			io.observe(el);
			cleanups.push(() => {
				io.disconnect();
				internals.setVisible(messageId, false);
			});
		}
		return () => cleanups.forEach((c) => c());
	}, [internals, messageId]);

	return (
		<div ref={setRefs} data-message-id={messageId} data-scroll-anchor={scrollAnchor || undefined} className={cn(className)} {...props}>
			{children}
		</div>
	);
});
MessageScrollerItem.displayName = 'MessageScrollerItem';

export interface MessageScrollerButtonProps extends Omit<ButtonProps, 'size' | 'onClick'> {
	direction?: 'end' | 'start';
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/** Floating "scroll to end/start" button. Disabled, invisible and `aria-hidden` when there is nothing to scroll to. */
export const MessageScrollerButton = ({ direction = 'end', variant = 'outline', className, children, onClick, 'aria-label': ariaLabel, ...props }: MessageScrollerButtonProps) => {
	const { scrollToEnd, scrollToStart } = useMessageScroller();
	const scrollable = useMessageScrollerScrollable();
	const active = direction === 'end' ? scrollable.end : scrollable.start;
	return (
		<Button
			type="button"
			size="icon"
			variant={variant}
			disabled={!active}
			aria-hidden={!active || undefined}
			tabIndex={active ? undefined : -1}
			aria-label={ariaLabel ?? (direction === 'end' ? 'Scroll to latest message' : 'Scroll to first message')}
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented) return;
				if (direction === 'end') scrollToEnd();
				else scrollToStart();
			}}
			className={cn(
				'absolute inset-x-0 mx-auto rounded-full! bg-surface shadow-pop transition-opacity duration-200',
				direction === 'end' ? 'bottom-3' : 'top-3',
				active ? 'opacity-100' : 'invisible opacity-0',
				className,
			)}
			{...props}
		>
			{children ?? <ChevronDownIcon className={cn('size-5', direction === 'start' && 'rotate-180')} />}
		</Button>
	);
};
MessageScrollerButton.displayName = 'MessageScrollerButton';
