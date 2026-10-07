import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { type Align, useAnchoredPosition, useClickOutside, useIsomorphicLayoutEffect } from '../lib/dom';
import { CheckIcon, ChevronRightIcon } from '../lib/icons';
import { presenceAttrs, usePresence } from '../lib/presence';
import { useControllableState } from '../lib/useControllableState';

const ITEM_SELECTOR = '[role^="menuitem"]:not([aria-disabled="true"])';

interface BarContextValue {
	openId: string | null;
	setOpenId: (id: string | null) => void;
	barRef: React.RefObject<HTMLDivElement>;
	/** How the current menu was opened: keyboard/click focus the first item, hover keeps focus on the trigger. */
	focusFirst: React.MutableRefObject<boolean>;
}
const BarContext = createContext<BarContextValue | null>(null);
const useBar = () => {
	const ctx = useContext(BarContext);
	if (!ctx) throw new Error('Menubar parts must be used within <Menubar>');
	return ctx;
};

interface MenuContextValue {
	id: string;
	open: boolean;
	triggerRef: React.RefObject<HTMLButtonElement>;
	contentRef: React.RefObject<HTMLDivElement>;
	contentId: string;
}
const MenuContext = createContext<MenuContextValue | null>(null);
const useMenu = () => {
	const ctx = useContext(MenuContext);
	if (!ctx) throw new Error('Menubar menu parts must be used within <MenubarMenu>');
	return ctx;
};

export interface MenubarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
	/** Id of the open menu (controlled). Menus without a `value` get a generated id. */
	value?: string | null;
	defaultValue?: string | null;
	onValueChange?: (value: string | null) => void;
}

/** Horizontal application menu bar: `<Menubar><MenubarMenu><MenubarTrigger/><MenubarContent>…</MenubarContent></MenubarMenu></Menubar>`. */
export const Menubar = ({ className, value, defaultValue = null, onValueChange, children, ...props }: MenubarProps) => {
	const [openId, setOpenId] = useControllableState<string | null>(value, defaultValue, onValueChange);
	const barRef = useRef<HTMLDivElement>(null);
	const focusFirst = useRef(false);
	return (
		<BarContext.Provider value={{ openId, setOpenId, barRef, focusFirst }}>
			<div
				ref={barRef}
				role="menubar"
				className={cn('inline-flex items-center gap-1 ui-border border-line rounded-control bg-surface p-1 text-page-text shadow-box', className)}
				{...props}
			>
				{children}
			</div>
		</BarContext.Provider>
	);
};

export const MenubarMenu = ({ value, children }: { value?: string; children: React.ReactNode }) => {
	const { openId } = useBar();
	const generated = useId();
	const id = value ?? generated;
	const triggerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const contentId = useId();
	return <MenuContext.Provider value={{ id, open: openId === id, triggerRef, contentRef, contentId }}>{children}</MenuContext.Provider>;
};

function moveBetweenMenus(bar: HTMLElement | null, from: HTMLElement | null, dir: 1 | -1) {
	const triggers = Array.from(bar?.querySelectorAll<HTMLButtonElement>('[data-menubar-trigger]:not(:disabled)') ?? []);
	if (!from || triggers.length === 0) return null;
	const index = triggers.indexOf(from as HTMLButtonElement);
	return triggers[(index + dir + triggers.length) % triggers.length];
}

export const MenubarTrigger = ({ className, onClick, onKeyDown, onMouseEnter, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	const { openId, setOpenId, barRef, focusFirst } = useBar();
	const { id, open, triggerRef, contentId } = useMenu();
	return (
		<button
			ref={triggerRef}
			type="button"
			role="menuitem"
			data-menubar-trigger=""
			data-state={open ? 'open' : 'closed'}
			aria-haspopup="menu"
			aria-expanded={open}
			aria-controls={open ? contentId : undefined}
			tabIndex={open || openId === null ? 0 : -1}
			onClick={(e) => {
				onClick?.(e);
				focusFirst.current = true;
				setOpenId(open ? null : id);
			}}
			onMouseEnter={(e) => {
				onMouseEnter?.(e);
				if (openId !== null && !open) {
					focusFirst.current = false;
					setOpenId(id);
				}
			}}
			onKeyDown={(e) => {
				onKeyDown?.(e);
				if (e.defaultPrevented) return;
				if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					focusFirst.current = true;
					setOpenId(id);
				} else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
					e.preventDefault();
					const next = moveBetweenMenus(barRef.current, e.currentTarget, e.key === 'ArrowRight' ? 1 : -1);
					next?.focus();
					if (open) {
						focusFirst.current = false;
						next?.click();
					}
				} else if (e.key === 'Escape') setOpenId(null);
			}}
			className={cn(
				'inline-flex cursor-pointer items-center rounded-item px-3 py-1.5 text-sm font-medium outline-none transition-colors select-none',
				'hover:bg-hover focus-visible:bg-hover data-[state=open]:bg-hover disabled:pointer-events-none disabled:opacity-40',
				className,
			)}
			{...props}
		/>
	);
};

export const MenubarContent = ({ align = 'start', className, children, onKeyDown, ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: Align }) => {
	const { setOpenId, barRef, focusFirst } = useBar();
	const { open, triggerRef, contentRef, contentId } = useMenu();
	const { mounted, state } = usePresence(open);
	const style = useAnchoredPosition(triggerRef, contentRef, { open: mounted, align, gap: 6 });
	useClickOutside([triggerRef, contentRef], () => setOpenId(null), open);

	useEffect(() => {
		if (!open) return;
		const el = contentRef.current;
		if (focusFirst.current) el?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
		else el?.focus({ preventScroll: true });
	}, [open, contentRef, focusFirst]);

	const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(e);
		const root = contentRef.current;
		// React events bubble through portals: ignore keys coming from a nested submenu.
		if (e.defaultPrevented || !root || !root.contains(e.target as Node)) return;
		const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter((el) => el.closest('[role="menu"]') === root);
		const index = items.indexOf(document.activeElement as HTMLElement);
		const go = (i: number) => {
			e.preventDefault();
			items[(i + items.length) % items.length]?.focus();
		};
		if (e.key === 'ArrowDown') go(index + 1);
		else if (e.key === 'ArrowUp') go(index < 0 ? items.length - 1 : index - 1);
		else if (e.key === 'Home') go(0);
		else if (e.key === 'End') go(items.length - 1);
		else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
			e.preventDefault();
			const next = moveBetweenMenus(barRef.current, triggerRef.current, e.key === 'ArrowRight' ? 1 : -1);
			focusFirst.current = true;
			next?.focus();
			next?.click();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			setOpenId(null);
			triggerRef.current?.focus();
		} else if (e.key === 'Tab') setOpenId(null);
	};

	if (!mounted) return null;
	return (
		<Portal>
			<div
				ref={contentRef}
				id={contentId}
				data-pk-layer=""
				role="menu"
				aria-orientation="vertical"
				tabIndex={-1}
				style={style}
				onKeyDown={handleKey}
				className={cn('z-[200] min-w-48 overflow-y-auto ui-border border-line rounded-box bg-surface p-1 text-page-text shadow-pop outline-none', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none', className)}
				{...presenceAttrs(state)}
				{...props}
			>
				{children}
			</div>
		</Portal>
	);
};

const itemClasses =
	'relative flex w-full cursor-pointer items-center gap-2 rounded-item px-3 py-2 text-start text-sm outline-none transition-colors select-none hover:bg-hover focus-visible:bg-hover focus:bg-hover disabled:pointer-events-none disabled:opacity-40';

export interface MenubarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	destructive?: boolean;
	/** Keep the menu open after selecting. */
	keepOpen?: boolean;
	/** Indent to line up with items that have a check/radio indicator. */
	inset?: boolean;
}

export const MenubarItem = ({ className, destructive, keepOpen, inset, onClick, disabled, ...props }: MenubarItemProps) => {
	const { setOpenId } = useBar();
	const { triggerRef } = useMenu();
	return (
		<button
			type="button"
			role="menuitem"
			disabled={disabled}
			aria-disabled={disabled || undefined}
			onClick={(e) => {
				onClick?.(e);
				if (!keepOpen && !e.defaultPrevented) {
					setOpenId(null);
					triggerRef.current?.focus();
				}
			}}
			className={cn(itemClasses, inset && 'ps-8', destructive && 'text-danger', className)}
			{...props}
		/>
	);
};

/** Right-aligned keyboard hint inside an item: `<MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>`. */
export const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
	<span className={cn('ms-auto ps-6 text-xs tracking-widest text-muted', className)} {...props} />
);

const Indicator = ({ show, children }: { show: boolean; children: React.ReactNode }) => (
	<span className="absolute start-2.5 flex size-4 items-center justify-center">{show ? children : null}</span>
);

export interface MenubarCheckboxItemProps extends Omit<MenubarItemProps, 'onChange' | 'inset'> {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

export const MenubarCheckboxItem = ({ className, checked, defaultChecked = false, onCheckedChange, onClick, disabled, keepOpen, children, ...props }: MenubarCheckboxItemProps) => {
	const [isChecked, setChecked] = useControllableState(checked, defaultChecked, onCheckedChange);
	const { setOpenId } = useBar();
	const { triggerRef } = useMenu();
	return (
		<button
			type="button"
			role="menuitemcheckbox"
			aria-checked={isChecked}
			disabled={disabled}
			aria-disabled={disabled || undefined}
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented) return;
				setChecked(!isChecked);
				if (!keepOpen) {
					setOpenId(null);
					triggerRef.current?.focus();
				}
			}}
			className={cn(itemClasses, 'ps-8', className)}
			{...props}
		>
			<Indicator show={isChecked}>
				<CheckIcon className="size-3.5" />
			</Indicator>
			{children}
		</button>
	);
};

interface RadioContextValue {
	value: string | undefined;
	setValue: (value: string) => void;
}
const RadioContext = createContext<RadioContextValue | null>(null);

export interface MenubarRadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}

export const MenubarRadioGroup = ({ value, defaultValue, onValueChange, ...props }: MenubarRadioGroupProps) => {
	const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined);
	return (
		<RadioContext.Provider value={{ value: current, setValue: (v) => setCurrent(v) }}>
			<div role="group" {...props} />
		</RadioContext.Provider>
	);
};

export const MenubarRadioItem = ({ className, value, onClick, disabled, keepOpen, children, ...props }: Omit<MenubarItemProps, 'value' | 'inset'> & { value: string }) => {
	const radio = useContext(RadioContext);
	const { setOpenId } = useBar();
	const { triggerRef } = useMenu();
	if (!radio) throw new Error('MenubarRadioItem must be used within <MenubarRadioGroup>');
	const checked = radio.value === value;
	return (
		<button
			type="button"
			role="menuitemradio"
			aria-checked={checked}
			disabled={disabled}
			aria-disabled={disabled || undefined}
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented) return;
				radio.setValue(value);
				if (!keepOpen) {
					setOpenId(null);
					triggerRef.current?.focus();
				}
			}}
			className={cn(itemClasses, 'ps-8', className)}
			{...props}
		>
			<Indicator show={checked}>
				<span className="size-2 rounded-full bg-current" />
			</Indicator>
			{children}
		</button>
	);
};

export const MenubarLabel = ({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) => (
	<div className={cn('ui-label px-3 py-1.5 text-[11px] text-muted', inset && 'ps-8', className)} {...props} />
);

export const MenubarSeparator = ({ className }: { className?: string }) => <div role="separator" className={cn('my-1 h-px bg-line/40', className)} />;

interface SubContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	triggerRef: React.RefObject<HTMLButtonElement>;
	contentRef: React.RefObject<HTMLDivElement>;
	contentId: string;
}
const SubContext = createContext<SubContextValue | null>(null);
const useSub = () => {
	const ctx = useContext(SubContext);
	if (!ctx) throw new Error('MenubarSub parts must be used within <MenubarSub>');
	return ctx;
};

/** Nested submenu: `<MenubarSub><MenubarSubTrigger>More</MenubarSubTrigger><MenubarSubContent>…</MenubarSubContent></MenubarSub>`. */
export const MenubarSub = ({ children, open, defaultOpen = false, onOpenChange }: { children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) => {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const contentId = useId();
	return <SubContext.Provider value={{ open: isOpen, setOpen, triggerRef, contentRef, contentId }}>{children}</SubContext.Provider>;
};

export const MenubarSubTrigger = ({ className, children, onKeyDown, onMouseEnter, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	const { open, setOpen, triggerRef, contentRef, contentId } = useSub();
	return (
		<button
			ref={triggerRef}
			type="button"
			role="menuitem"
			aria-haspopup="menu"
			aria-expanded={open}
			aria-controls={open ? contentId : undefined}
			data-state={open ? 'open' : 'closed'}
			onClick={() => setOpen(true)}
			onMouseEnter={(e) => {
				onMouseEnter?.(e);
				setOpen(true);
			}}
			onKeyDown={(e) => {
				onKeyDown?.(e);
				if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					e.stopPropagation();
					setOpen(true);
					requestAnimationFrame(() => contentRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus());
				}
			}}
			className={cn(itemClasses, 'data-[state=open]:bg-hover', className)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ms-auto size-4" />
		</button>
	);
};

export const MenubarSubContent = ({ className, children, onKeyDown, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const { open, setOpen, triggerRef, contentRef, contentId } = useSub();
	const { mounted, state } = usePresence(open);
	const [pos, setPos] = useState<React.CSSProperties>({ position: 'fixed', top: 0, left: 0, visibility: 'hidden' });

	useIsomorphicLayoutEffect(() => {
		if (!open) return;
		const a = triggerRef.current?.getBoundingClientRect();
		const f = contentRef.current?.getBoundingClientRect();
		if (!a || !f) return;
		const flip = a.right + f.width + 8 > window.innerWidth;
		const left = flip ? Math.max(8, a.left - f.width - 4) : a.right + 4;
		const top = Math.max(8, Math.min(a.top - 4, window.innerHeight - f.height - 8));
		setPos({ position: 'fixed', top, left, visibility: 'visible' });
	}, [open, triggerRef, contentRef]);

	if (!mounted) return null;
	return (
		<Portal>
			<div
				ref={contentRef}
				id={contentId}
				data-pk-layer=""
				role="menu"
				aria-orientation="vertical"
				style={pos}
				onMouseLeave={() => setOpen(false)}
				onKeyDown={(e) => {
					onKeyDown?.(e);
					const items = Array.from(contentRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []).filter((el) => el.closest('[role="menu"]') === contentRef.current);
					const index = items.indexOf(document.activeElement as HTMLElement);
					const go = (i: number) => {
						e.preventDefault();
						e.stopPropagation();
						items[(i + items.length) % items.length]?.focus();
					};
					if (e.key === 'ArrowDown') go(index + 1);
					else if (e.key === 'ArrowUp') go(index < 0 ? items.length - 1 : index - 1);
					else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
						e.preventDefault();
						e.stopPropagation();
						setOpen(false);
						triggerRef.current?.focus();
					}
				}}
				className={cn('z-[210] min-w-44 overflow-y-auto ui-border border-line rounded-box bg-surface p-1 text-page-text shadow-pop outline-none', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none', className)}
				{...presenceAttrs(state)}
				{...props}
			>
				{children}
			</div>
		</Portal>
	);
};
