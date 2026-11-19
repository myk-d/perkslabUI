import React, { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, type Placement, useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { useLayer } from '../lib/layers';
import { presenceAttrs, usePresence } from '../lib/presence';
import { withTriggerAria } from '../lib/trigger';
import { useControllableState } from '../lib/useControllableState';

interface MenuContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLElement | null>;
	menuRef: React.RefObject<HTMLDivElement>;
	menuId: string;
	repositionKey: string;
	setRepositionKey: (key: string) => void;
}
const MenuContext = createContext<MenuContextValue | null>(null);
const useMenu = () => {
	const ctx = useContext(MenuContext);
	if (!ctx) throw new Error('DropdownMenu parts must be used within <DropdownMenu>');
	return ctx;
};

export const DropdownMenu = ({ children, open, defaultOpen = false, onOpenChange }: { children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) => {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const [repositionKey, setRepositionKey] = useState('');
	const anchorRef = useRef<HTMLElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuId = useId();
	const value = useMemo(() => ({ open: isOpen, setOpen, anchorRef, menuRef, menuId, repositionKey, setRepositionKey }), [isOpen, setOpen, menuId, repositionKey]);
	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const DropdownMenuTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const { open, setOpen, anchorRef, menuId } = useMenu();
	return (
		<span
			ref={anchorRef as React.RefObject<HTMLSpanElement>}
			data-state={open ? 'open' : 'closed'}
			className={cn('inline-flex', className)}
			onClick={() => setOpen(!open)}
			onKeyDown={(e) => {
				if (e.key === 'ArrowDown' && !open) {
					e.preventDefault();
					setOpen(true);
				}
			}}
		>
			{withTriggerAria(children, { 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? menuId : undefined, 'data-state': open ? 'open' : 'closed' })}
		</span>
	);
};

export { MenuContext, useMenu };

export const DropdownMenuContent = ({ align = 'start', placement = 'bottom', className, children, style: userStyle, ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: Align; placement?: Placement }) => {
	const { open, setOpen, anchorRef, menuRef, menuId, repositionKey } = useMenu();
	const { isTop, zIndex } = useLayer(open, 'floating');
	const { mounted, state } = usePresence(open, 140);
	const { style, side, align: resolvedAlign } = useAnchoredPosition(anchorRef, menuRef, { open: mounted, align, placement, gap: 6, repositionKey });
	useClickOutside([anchorRef, menuRef], () => setOpen(false), open);
	useEscape(() => {
		if (!isTop()) return;
		setOpen(false);
		(anchorRef.current?.querySelector('button,[tabindex]') as HTMLElement | null)?.focus();
	}, open);

	useEffect(() => {
		if (open) menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])')?.focus();
	}, [open, menuRef]);

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? []);
		const index = items.indexOf(document.activeElement as HTMLElement);
		const go = (i: number) => {
			e.preventDefault();
			items[(i + items.length) % items.length]?.focus();
		};
		if (e.key === 'ArrowDown') go(index + 1);
		else if (e.key === 'ArrowUp') go(index - 1);
		else if (e.key === 'Home') go(0);
		else if (e.key === 'End') go(items.length - 1);
		else if (e.key === 'Tab') setOpen(false);
	};

	if (!mounted) return null;
	return (
		<Portal anchorRef={anchorRef}>
			<div
				ref={menuRef}
				data-pk-layer=""
				data-side={side}
				data-align={resolvedAlign}
				id={menuId}
				role="menu"
				style={{ ...style, zIndex, ...userStyle }}
				onKeyDown={onKeyDown}
				className={cn(
					'min-w-48 overflow-y-auto ui-border border-line rounded-pop bg-elevated p-1.5 text-page-text shadow-pop outline-none pk-scrollbar',
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

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	destructive?: boolean;
	/** Keep the menu open after selecting. */
	keepOpen?: boolean;
}

export const DropdownMenuItem = ({ className, destructive, keepOpen, onClick, disabled, ...props }: DropdownMenuItemProps) => {
	const { setOpen } = useMenu();
	return (
		<button
			type="button"
			role="menuitem"
			aria-disabled={disabled || undefined}
			disabled={disabled}
			onClick={(e) => {
				onClick?.(e);
				if (!keepOpen) setOpen(false);
			}}
			className={cn(
				'flex w-full cursor-pointer items-center gap-2 rounded-item px-2.5 py-1.5 text-start text-sm outline-none transition-colors duration-150',
				'hover:bg-hover focus-visible:bg-hover focus:bg-hover disabled:opacity-40 disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted',
				destructive && 'text-danger hover:bg-danger/10 focus-visible:bg-danger/10 focus:bg-danger/10 [&_svg]:text-danger',
				className,
			)}
			{...props}
		/>
	);
};

export const DropdownMenuLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('ui-label px-2.5 py-1.5 text-[11px] text-muted', className)} {...props} />
);

export const DropdownMenuSeparator = ({ className }: { className?: string }) => <div role="separator" className={cn('my-1.5 h-px bg-line-subtle', className)} />;
