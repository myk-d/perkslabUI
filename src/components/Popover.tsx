import React, { createContext, useContext, useId, useMemo, useRef } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, type Placement, useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { useLayer } from '../lib/layers';
import { presenceAttrs, usePresence } from '../lib/presence';
import { withTriggerAria } from '../lib/trigger';
import { useControllableState } from '../lib/useControllableState';

interface PopoverContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLElement | null>;
	contentRef: React.RefObject<HTMLDivElement>;
	contentId: string;
}
const PopoverContext = createContext<PopoverContextValue | null>(null);
export const usePopover = () => {
	const ctx = useContext(PopoverContext);
	if (!ctx) throw new Error('Popover parts must be used within <Popover>');
	return ctx;
};

export interface PopoverProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
}

export const Popover = ({ open, defaultOpen = false, onOpenChange, children }: PopoverProps) => {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const anchorRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const contentId = useId();
	const value = useMemo(() => ({ open: isOpen, setOpen, anchorRef, contentRef, contentId }), [isOpen, setOpen, contentId]);
	return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
};

/** Wraps the element that toggles the popover (usually a <Button>). Click bubbles from the child, so it stays keyboard-accessible. */
export const PopoverTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const { open, setOpen, anchorRef, contentId } = usePopover();
	return (
		<span
			ref={anchorRef as React.RefObject<HTMLSpanElement>}
			data-state={open ? 'open' : 'closed'}
			className={cn('inline-flex', className)}
			onClick={() => setOpen(!open)}
		>
			{withTriggerAria(children, { 'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? contentId : undefined, 'data-state': open ? 'open' : 'closed' }, `${contentId}-trigger`)}
		</span>
	);
};

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
	align?: Align;
	placement?: Placement;
}

export const PopoverContent = ({ align = 'start', placement = 'bottom', className, children, style: userStyle, ...props }: PopoverContentProps) => {
	const { open, setOpen, anchorRef, contentRef, contentId } = usePopover();
	const { isTop, zIndex } = useLayer(open, 'floating');
	const { mounted, state } = usePresence(open, 140);
	const { style, side, align: resolvedAlign } = useAnchoredPosition(anchorRef, contentRef, { open: mounted, align, placement, gap: 6 });
	useClickOutside([anchorRef, contentRef], () => setOpen(false), open);
	useEscape(() => isTop() && setOpen(false), open);
	if (!mounted) return null;
	return (
		<Portal anchorRef={anchorRef}>
			<div
				ref={contentRef}
				data-pk-layer=""
				data-side={side}
				data-align={resolvedAlign}
				id={contentId}
				role="dialog"
				aria-labelledby={anchorRef.current?.firstElementChild?.id || undefined}
				style={{ ...style, zIndex, ...userStyle }}
				className={cn(
					'w-72 overflow-y-auto ui-border border-line rounded-pop bg-elevated p-4 text-page-text shadow-pop outline-none pk-scrollbar',
					state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none',
					className,
				)}
				{...presenceAttrs(state)}
				{...props}
			>
				{children}
			</div>
		</Portal>
	);
};
