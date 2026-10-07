import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { isBrowser } from '../lib/dom';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
	orientation?: 'vertical' | 'horizontal' | 'both';
	/** Fade the edges where more content exists (top/bottom, or start/end for horizontal). */
	fade?: boolean;
	/** Fade length in px. */
	fadeSize?: number;
	/** Ref to the scrolling element. */
	viewportRef?: React.Ref<HTMLDivElement>;
	viewportClassName?: string;
}

const overflowClass = {
	vertical: 'overflow-y-auto overflow-x-hidden',
	horizontal: 'overflow-x-auto overflow-y-hidden',
	both: 'overflow-auto',
} as const;

/** Native overflow with themed (`pk-scrollbar`) scrollbars, so keyboard, touch and wheel behaviour stay native. */
export const ScrollArea = ({ orientation = 'vertical', fade = false, fadeSize = 24, viewportRef, viewportClassName, className, children, ...props }: ScrollAreaProps) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [edges, setEdges] = useState({ start: false, end: false, scrollable: false });

	const setRefs = useCallback(
		(node: HTMLDivElement | null) => {
			ref.current = node;
			if (typeof viewportRef === 'function') viewportRef(node);
			else if (viewportRef) (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
		},
		[viewportRef],
	);

	const horizontal = orientation === 'horizontal';

	const measure = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		const pos = Math.abs(horizontal ? el.scrollLeft : el.scrollTop);
		const size = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
		const next = {
			start: pos > 1,
			end: pos < size - 1,
			scrollable: size > 1 || (orientation === 'both' && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)),
		};
		setEdges((prev) => (prev.start === next.start && prev.end === next.end && prev.scrollable === next.scrollable ? prev : next));
	}, [horizontal, orientation]);

	useEffect(() => {
		measure();
		const el = ref.current;
		if (!isBrowser || !el || typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		Array.from(el.children).forEach((child) => ro.observe(child));
		return () => ro.disconnect();
	}, [measure, children]);

	let mask: string | undefined;
	if (fade && orientation !== 'both') {
		const dir = horizontal ? 'to right' : 'to bottom';
		const a = edges.start ? 'transparent' : '#000';
		const b = edges.end ? 'transparent' : '#000';
		mask = `linear-gradient(${dir}, ${a} 0, #000 ${fadeSize}px, #000 calc(100% - ${fadeSize}px), ${b} 100%)`;
	}

	return (
		<div className={cn('relative min-h-0 min-w-0', className)} {...props}>
			<div
				ref={setRefs}
				onScroll={measure}
				// scrollable regions must be keyboard reachable
				tabIndex={edges.scrollable ? 0 : undefined}
				style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
				className={cn('pk-scrollbar size-full rounded-[inherit] focus-visible:outline-2 focus-visible:outline-brand -outline-offset-2', overflowClass[orientation], viewportClassName)}
			>
				{children}
			</div>
		</div>
	);
};
