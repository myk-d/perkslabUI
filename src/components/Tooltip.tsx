import React, { useEffect, useId, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, useAnchoredPosition } from '../lib/dom';
import { presenceAttrs, usePresence } from '../lib/presence';


export interface TooltipProps {
	content: React.ReactNode;
	children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
	align?: Align;
	/** Hover delay in ms. */
	delay?: number;
	className?: string;
}

/**
 * Hover/focus on desktop, tap-to-toggle on touch (a native `title` never fires on touch devices).
 * The bubble is portalled with fixed positioning, so it floats above `overflow-hidden` ancestors.
 */
export const Tooltip = ({ content, children, align = 'center', delay = 100, className }: TooltipProps) => {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLSpanElement>(null);
	const bubbleRef = useRef<HTMLSpanElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const id = useId();
	const { mounted, state } = usePresence(open);
	const style = useAnchoredPosition(anchorRef, bubbleRef, { open: mounted, align, placement: 'top', gap: 8 });

	const show = () => {
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setOpen(true), delay);
	};
	const hide = () => {
		clearTimeout(timer.current);
		setOpen(false);
	};
	useEffect(() => () => clearTimeout(timer.current), []);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide();
		const onOutside = (e: MouseEvent | TouchEvent) => {
			if (!anchorRef.current?.contains(e.target as Node)) hide();
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('touchstart', onOutside);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('touchstart', onOutside);
		};
	}, [open]);

	const child = React.Children.only(children);
	return (
		<span ref={anchorRef} className="inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
			{React.cloneElement(child, {
				'aria-describedby': open ? id : undefined,
				onClick: (e: React.MouseEvent<HTMLElement>) => {
					child.props.onClick?.(e);
					// touch devices have no hover — a tap toggles
					if (window.matchMedia?.('(hover: none)').matches) setOpen((v) => !v);
				},
			})}
			{mounted && (
				<Portal>
					<span
						ref={bubbleRef}
						id={id}
						role="tooltip"
						style={style}
						className={cn('z-[300] pointer-events-none max-w-xs rounded-item bg-page-text px-3 py-1.5 text-xs font-medium text-page-bg shadow-pop', state === 'open' ? 'animate-pk-fade-in' : 'animate-pk-fade-out', className)}
						{...presenceAttrs(state)}
					>
						{content}
					</span>
				</Portal>
			)}
		</span>
	);
};
