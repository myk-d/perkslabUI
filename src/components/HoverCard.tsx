import React, { useEffect, useId, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, type Placement, useAnchoredPosition } from '../lib/dom';
import { useLayer } from '../lib/layers';
import { presenceAttrs, usePresence } from '../lib/presence';

export interface HoverCardProps {
	/** The element that triggers the card (a link, avatar, …). */
	children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
	/** Rich card content. Hoverable — moving the pointer onto it keeps it open. */
	content: React.ReactNode;
	openDelay?: number;
	closeDelay?: number;
	align?: Align;
	placement?: Placement;
	className?: string;
}

export const HoverCard = ({ children, content, openDelay = 260, closeDelay = 160, align = 'center', placement = 'bottom', className }: HoverCardProps) => {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLSpanElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const id = useId();
	const { zIndex } = useLayer(open, 'floating');
	const { mounted, state } = usePresence(open, 140);
	const { style, side, align: resolvedAlign } = useAnchoredPosition(anchorRef, cardRef, { open: mounted, align, placement, gap: 8 });

	const schedule = (next: boolean, delay: number) => {
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setOpen(next), delay);
	};
	useEffect(() => () => clearTimeout(timer.current), []);

	return (
		<span ref={anchorRef} className="inline-flex" onMouseEnter={() => schedule(true, openDelay)} onMouseLeave={() => schedule(false, closeDelay)} onFocus={() => schedule(true, 0)} onBlur={() => schedule(false, closeDelay)}>
			{React.cloneElement(children, { 'aria-describedby': open ? id : undefined })}
			{mounted && (
				<Portal anchorRef={anchorRef}>
					<div
						ref={cardRef}
						id={id}
						data-pk-layer=""
						data-side={side}
						data-align={resolvedAlign}
						style={{ ...style, zIndex }}
						onMouseEnter={() => clearTimeout(timer.current)}
						onMouseLeave={() => schedule(false, closeDelay)}
						className={cn(
							'w-72 overflow-y-auto ui-border border-line rounded-pop bg-elevated p-4 text-sm text-page-text shadow-pop pk-scrollbar',
							state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none',
							className,
						)}
						{...presenceAttrs(state)}
					>
						{content}
					</div>
				</Portal>
			)}
		</span>
	);
};
