import React, { createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { presenceAttrs, usePresence } from '../lib/presence';
import { withTriggerAria } from '../lib/trigger';
import { useControllableState } from '../lib/useControllableState';

interface MenuContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLElement | null>;
	menuRef: React.RefObject<HTMLDivElement>;
	menuId: string;
}
const MenuContext = createContext<MenuContextValue | null>(null);
const useMenu = () => {
	const ctx = useContext(MenuContext);
	if (!ctx) throw new Error('DropdownMenu parts must be used within <DropdownMenu>');
	return ctx;
};

export const DropdownMenu = ({ children, open, defaultOpen = false, onOpenChange }: { children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) => {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const anchorRef = useRef<HTMLElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuId = useId();
	const value = useMemo(() => ({ open: isOpen, setOpen, anchorRef, menuRef, menuId }), [isOpen, setOpen, menuId]);
	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const DropdownMenuTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const { open, setOpen, anchorRef, menuId } = useMenu();
	return (
		<span
			ref={anchorRef as React.RefObject<HTMLSpanElement>}
			className={cn('inline-flex', className)}
			onClick={() => setOpen(!open)}
			onKeyDown={(e) => {
				if (e.key === 'ArrowDown' && !open) {
					e.preventDefault();
					setOpen(true);
				}
			}}
		>
			{withTriggerAria(children, { 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': open ? menuId : undefined })}
		</span>
	);
};

export { MenuContext, useMenu };

export const DropdownMenuContent = ({ align = 'start', className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: Align }) => {
	const { open, setOpen, anchorRef, menuRef, menuId } = useMenu();
	const { mounted, state } = usePresence(open);
	const style = useAnchoredPosition(anchorRef, menuRef, { open: mounted, align, gap: 4 });
	useClickOutside([anchorRef, menuRef], () => setOpen(false), open);
	useEscape(() => {
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
		<Portal>
			<div
				ref={menuRef}
				data-pk-layer=""
id={menuId}
				role="menu"
				style={style}
				onKeyDown={onKeyDown}
				className={cn('z-[200] min-w-44 overflow-y-auto ui-border border-line rounded-box bg-surface p-1 text-page-text shadow-pop', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none', className)}
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
				'flex w-full cursor-pointer items-center gap-2 rounded-item px-3 py-2 text-start text-sm outline-none transition-colors',
				'hover:bg-hover focus-visible:bg-hover disabled:opacity-40 disabled:pointer-events-none',
				destructive && 'text-danger',
				className,
			)}
			{...props}
		/>
	);
};

export const DropdownMenuLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('ui-label px-3 py-1.5 text-[11px] text-muted', className)} {...props} />
);

export const DropdownMenuSeparator = ({ className }: { className?: string }) => <div role="separator" className={cn('my-1 h-px bg-line/40', className)} />;
