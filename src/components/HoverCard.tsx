import React, { useEffect, useId, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, useAnchoredPosition } from '../lib/dom';
import { presenceAttrs, usePresence } from '../lib/presence';


export interface HoverCardProps {
	/** The element that triggers the card (a link, avatar, …). */
	children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
	/** Rich card content. Hoverable — moving the pointer onto it keeps it open. */
	content: React.ReactNode;
	openDelay?: number;
	closeDelay?: number;
	align?: Align;
	className?: string;
}

export const HoverCard = ({ children, content, openDelay = 300, closeDelay = 150, align = 'center', className }: HoverCardProps) => {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLSpanElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const id = useId();
	const { mounted, state } = usePresence(open);
	const style = useAnchoredPosition(anchorRef, cardRef, { open: mounted, align, gap: 8 });

	const schedule = (next: boolean, delay: number) => {
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setOpen(next), delay);
	};
	useEffect(() => () => clearTimeout(timer.current), []);

	return (
		<span ref={anchorRef} className="inline-flex" onMouseEnter={() => schedule(true, openDelay)} onMouseLeave={() => schedule(false, closeDelay)} onFocus={() => schedule(true, 0)} onBlur={() => schedule(false, closeDelay)}>
			{React.cloneElement(children, { 'aria-describedby': open ? id : undefined })}
			{mounted && (
				<Portal>
					<div
						ref={cardRef}
						id={id}
						data-pk-layer=""
						style={style}
						onMouseEnter={() => clearTimeout(timer.current)}
						onMouseLeave={() => schedule(false, closeDelay)}
						className={cn('z-[250] w-72 overflow-y-auto ui-border border-line rounded-box bg-surface p-4 text-sm text-page-text shadow-pop', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none', className)}
						{...presenceAttrs(state)}
					>
						{content}
					</div>
				</Portal>
			)}
		</span>
	);
};
