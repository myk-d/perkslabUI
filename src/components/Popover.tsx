import React, { createContext, useContext, useId, useMemo, useRef } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, type Placement, useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
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
			className={cn('inline-flex', className)}
			onClick={() => setOpen(!open)}
		>
			{withTriggerAria(children, { 'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? contentId : undefined }, `${contentId}-trigger`)}
		</span>
	);
};

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
	align?: Align;
	placement?: Placement;
}

export const PopoverContent = ({ align = 'start', placement = 'bottom', className, children, ...props }: PopoverContentProps) => {
	const { open, setOpen, anchorRef, contentRef, contentId } = usePopover();
	const { mounted, state } = usePresence(open);
	const style = useAnchoredPosition(anchorRef, contentRef, { open: mounted, align, placement });
	useClickOutside([anchorRef, contentRef], () => setOpen(false), open);
	useEscape(() => setOpen(false), open);
	if (!mounted) return null;
	return (
		<Portal>
			<div
				ref={contentRef}
				data-pk-layer=""
id={contentId}
				role="dialog"
				aria-labelledby={anchorRef.current?.firstElementChild?.id || undefined}
				style={style}
				className={cn('z-[200] w-72 overflow-y-auto ui-border border-line rounded-box bg-surface p-4 text-page-text shadow-pop outline-none', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none', className)}
				{...presenceAttrs(state)}
				{...props}
			>
				{children}
			</div>
		</Portal>
	);
};
