import React, { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { ChevronLeftIcon, ChevronRightIcon } from '../lib/icons';
import { buttonVariants } from './Button';

export type CarouselOrientation = 'horizontal' | 'vertical';

export interface CarouselApi {
	scrollPrev: () => void;
	scrollNext: () => void;
	scrollTo: (index: number) => void;
	selectedIndex: () => number;
	slideCount: () => number;
	canScrollPrev: () => boolean;
	canScrollNext: () => boolean;
}

interface CarouselContextValue {
	orientation: CarouselOrientation;
	viewportRef: React.MutableRefObject<HTMLDivElement | null>;
	index: number;
	count: number;
	canPrev: boolean;
	canNext: boolean;
	scrollPrev: () => void;
	scrollNext: () => void;
	scrollTo: (index: number) => void;
}
const CarouselContext = createContext<CarouselContextValue | null>(null);
export const useCarousel = () => {
	const ctx = useContext(CarouselContext);
	if (!ctx) throw new Error('Carousel parts must be used within <Carousel>');
	return ctx;
};

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	orientation?: CarouselOrientation;
	/** Wrap around at the ends. */
	loop?: boolean;
	/** `true` (4s) or an interval in ms. Pauses on hover and focus, and when the user prefers reduced motion. */
	autoplay?: boolean | number;
	/** Receives the imperative API once mounted. */
	setApi?: (api: CarouselApi) => void;
	/** Called when the current slide (or slide count) changes. */
	onSelect?: (index: number, count: number) => void;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
	({ orientation = 'horizontal', loop = false, autoplay = false, setApi, onSelect, className, children, onKeyDownCapture, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
		const viewportRef = useRef<HTMLDivElement | null>(null);
		const [index, setIndex] = useState(0);
		const [count, setCount] = useState(0);
		const [canPrev, setCanPrev] = useState(false);
		const [canNext, setCanNext] = useState(false);
		const [hovered, setHovered] = useState(false);
		const [focused, setFocused] = useState(false);
		const horizontal = orientation === 'horizontal';

		const state = useRef({ index, count, canPrev, canNext });
		state.current = { index, count, canPrev, canNext };
		const onSelectRef = useRef(onSelect);
		onSelectRef.current = onSelect;

		/** Distance (px) a slide's start edge is from the viewport's start edge. */
		const offsetOf = useCallback(
			(slide: HTMLElement, viewport: HTMLElement) => {
				const r = slide.getBoundingClientRect();
				const v = viewport.getBoundingClientRect();
				if (!horizontal) return r.top - v.top;
				return getComputedStyle(viewport).direction === 'rtl' ? r.right - v.right : r.left - v.left;
			},
			[horizontal],
		);

		const scrollTo = useCallback(
			(target: number) => {
				const el = viewportRef.current;
				if (!el) return;
				const slides = Array.from(el.children) as HTMLElement[];
				const slide = slides[Math.min(Math.max(target, 0), slides.length - 1)];
				if (!slide) return;
				const delta = offsetOf(slide, el);
				const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
				el.scrollBy(horizontal ? { left: delta, behavior } : { top: delta, behavior });
			},
			[horizontal, offsetOf],
		);

		const scrollPrev = useCallback(() => {
			const s = state.current;
			if (s.canPrev) scrollTo(s.index === 0 ? s.count - 1 : s.index - 1);
		}, [scrollTo]);
		const scrollNext = useCallback(() => {
			const s = state.current;
			if (s.canNext) scrollTo(s.index >= s.count - 1 ? 0 : s.index + 1);
		}, [scrollTo]);

		// Track the current slide from the scroll position.
		useEffect(() => {
			const el = viewportRef.current;
			if (!el) return;
			let frame = 0;
			const update = () => {
				frame = 0;
				const slides = Array.from(el.children) as HTMLElement[];
				const total = slides.length;
				const pos = Math.abs(horizontal ? el.scrollLeft : el.scrollTop);
				const client = horizontal ? el.clientWidth : el.clientHeight;
				const size = horizontal ? el.scrollWidth : el.scrollHeight;
				const scrollable = size > client + 1;
				const atStart = pos < 1;
				const atEnd = pos + client >= size - 1;

				let nearest = 0;
				let best = Infinity;
				slides.forEach((slide, i) => {
					const d = Math.abs(offsetOf(slide, el));
					if (d < best) {
						best = d;
						nearest = i;
					}
					if (!slide.hasAttribute('aria-label') || slide.hasAttribute('data-pk-auto-label')) {
						slide.setAttribute('aria-label', `${i + 1} of ${total}`);
						slide.setAttribute('data-pk-auto-label', '');
					}
				});
				// When the last slides cannot reach the start edge, the end of the track means "last slide".
				const next = total > 1 && scrollable && atEnd && !atStart ? total - 1 : nearest;

				setCount(total);
				setIndex(next);
				setCanPrev(scrollable && total > 1 && (loop || !atStart));
				setCanNext(scrollable && total > 1 && (loop || !atEnd));
			};
			const schedule = () => {
				if (!frame) frame = requestAnimationFrame(update);
			};
			update();
			el.addEventListener('scroll', schedule, { passive: true });
			const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : undefined;
			resize?.observe(el);
			Array.from(el.children).forEach((c) => resize?.observe(c));
			const mutation = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => {
				resize?.disconnect();
				resize?.observe(el);
				Array.from(el.children).forEach((c) => resize?.observe(c));
				schedule();
			}) : undefined;
			mutation?.observe(el, { childList: true });
			return () => {
				el.removeEventListener('scroll', schedule);
				resize?.disconnect();
				mutation?.disconnect();
				if (frame) cancelAnimationFrame(frame);
			};
		}, [horizontal, loop, offsetOf]);

		useEffect(() => {
			if (count > 0) onSelectRef.current?.(index, count);
		}, [index, count]);

		const api = useMemo<CarouselApi>(
			() => ({
				scrollPrev,
				scrollNext,
				scrollTo,
				selectedIndex: () => state.current.index,
				slideCount: () => state.current.count,
				canScrollPrev: () => state.current.canPrev,
				canScrollNext: () => state.current.canNext,
			}),
			[scrollPrev, scrollNext, scrollTo],
		);
		const setApiRef = useRef(setApi);
		setApiRef.current = setApi;
		useEffect(() => {
			setApiRef.current?.(api);
		}, [api]);

		// Autoplay: advance, wrap around at the end, pause while the user interacts.
		const interval = typeof autoplay === 'number' ? autoplay : 4000;
		useEffect(() => {
			if (!autoplay || hovered || focused || prefersReducedMotion()) return;
			const id = setInterval(() => {
				const s = state.current;
				if (s.count < 2) return;
				scrollTo(s.index >= s.count - 1 ? 0 : s.index + 1);
			}, interval);
			return () => clearInterval(id);
		}, [autoplay, interval, hovered, focused, scrollTo]);

		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			onKeyDownCapture?.(e);
			if (e.defaultPrevented) return;
			const target = e.target as HTMLElement;
			if (target.closest('input,textarea,select,[contenteditable="true"]')) return;
			const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
			const prevKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
			const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
			if (e.key === prevKey) {
				e.preventDefault();
				scrollPrev();
			} else if (e.key === nextKey) {
				e.preventDefault();
				scrollNext();
			}
		};

		return (
			<CarouselContext.Provider value={{ orientation, viewportRef, index, count, canPrev, canNext, scrollPrev, scrollNext, scrollTo }}>
				<div
					ref={ref}
					role="region"
					aria-roledescription="carousel"
					data-orientation={orientation}
					className={cn('relative', className)}
					onKeyDownCapture={handleKeyDown}
					onMouseEnter={(e) => {
						onMouseEnter?.(e);
						setHovered(true);
					}}
					onMouseLeave={(e) => {
						onMouseLeave?.(e);
						setHovered(false);
					}}
					onFocus={(e) => {
						onFocus?.(e);
						setFocused(true);
					}}
					onBlur={(e) => {
						onBlur?.(e);
						setFocused(false);
					}}
					{...props}
				>
					{children}
				</div>
			</CarouselContext.Provider>
		);
	},
);
Carousel.displayName = 'Carousel';

/** The scroll-snap track. Space slides with `gap-*` here and size them with a `basis-*` class on each `CarouselItem`. Give it a height for vertical carousels. */
export const CarouselContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
	const { orientation, viewportRef } = useCarousel();
	const horizontal = orientation === 'horizontal';
	const setRefs = (node: HTMLDivElement | null) => {
		viewportRef.current = node;
		if (typeof ref === 'function') ref(node);
		else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
	};
	return (
		<div
			ref={setRefs}
			className={cn(
				'flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
				horizontal ? 'snap-x snap-mandatory overflow-x-auto overscroll-x-contain' : 'snap-y snap-mandatory flex-col overflow-y-auto overscroll-y-contain',
				className,
			)}
			{...props}
		/>
	);
});
CarouselContent.displayName = 'CarouselContent';

export const CarouselItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
	<div ref={ref} role="group" aria-roledescription="slide" className={cn('min-w-0 shrink-0 grow-0 basis-full snap-start', className)} {...props} />
));
CarouselItem.displayName = 'CarouselItem';

const navButton = 'absolute z-10 flex size-9 items-center justify-center rounded-full p-0';

export const CarouselPrevious = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, onClick, ...props }, ref) => {
	const { orientation, canPrev, scrollPrev } = useCarousel();
	const horizontal = orientation === 'horizontal';
	return (
		<button
			ref={ref}
			type="button"
			aria-label="Previous slide"
			disabled={!canPrev}
			onClick={(e) => {
				onClick?.(e);
				if (!e.defaultPrevented) scrollPrev();
			}}
			className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'bg-surface', navButton, horizontal ? 'start-2 top-1/2 -translate-y-1/2' : 'top-2 left-1/2 -translate-x-1/2', className)}
			{...props}
		>
			<ChevronLeftIcon className={cn('size-4', horizontal ? 'rtl:-scale-x-100' : 'rotate-90')} />
		</button>
	);
});
CarouselPrevious.displayName = 'CarouselPrevious';

export const CarouselNext = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, onClick, ...props }, ref) => {
	const { orientation, canNext, scrollNext } = useCarousel();
	const horizontal = orientation === 'horizontal';
	return (
		<button
			ref={ref}
			type="button"
			aria-label="Next slide"
			disabled={!canNext}
			onClick={(e) => {
				onClick?.(e);
				if (!e.defaultPrevented) scrollNext();
			}}
			className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'bg-surface', navButton, horizontal ? 'end-2 top-1/2 -translate-y-1/2' : 'bottom-2 left-1/2 -translate-x-1/2', className)}
			{...props}
		>
			<ChevronRightIcon className={cn('size-4', horizontal ? 'rtl:-scale-x-100' : 'rotate-90')} />
		</button>
	);
});
CarouselNext.displayName = 'CarouselNext';

/** One indicator button per slide. */
export const CarouselDots = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
	const { orientation, index, count, scrollTo } = useCarousel();
	return (
		<div ref={ref} role="group" aria-label="Choose slide" className={cn('mt-4 flex items-center justify-center gap-2', orientation === 'vertical' && 'absolute end-2 top-1/2 mt-0 -translate-y-1/2 flex-col', className)} {...props}>
			{Array.from({ length: count }, (_, i) => (
				<button
					key={i}
					type="button"
					aria-label={`Go to slide ${i + 1}`}
					aria-current={i === index ? 'true' : undefined}
					onClick={() => scrollTo(i)}
					className={cn('size-2.5 cursor-pointer rounded-full outline-none transition-[color,background-color,border-color,box-shadow,transform,opacity] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg', i === index ? 'bg-brand' : 'bg-muted/40 hover:bg-muted')}
				/>
			))}
		</div>
	);
});
CarouselDots.displayName = 'CarouselDots';
