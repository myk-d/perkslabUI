import React, { createContext, forwardRef, useCallback, useContext, useEffect, useId, useRef } from 'react';
import { Portal } from '../lib/Portal';
import { presenceAttrs, usePresence } from '../lib/presence';
import { Slot } from '../lib/Slot';
import { cn } from '../lib/cn';
import { useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { ChevronDownIcon } from '../lib/icons';
import { useControllableState } from '../lib/useControllableState';

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface NavigationMenuContextValue {
	/** Value of the open item, '' when everything is closed. */
	value: string;
	setValue: (value: string) => void;
	scheduleOpen: (value: string) => void;
	scheduleClose: () => void;
	cancelTimers: () => void;
	focusFirstRef: React.MutableRefObject<boolean>;
}
const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);
const useNavigationMenu = () => {
	const ctx = useContext(NavigationMenuContext);
	if (!ctx) throw new Error('NavigationMenu parts must be used within <NavigationMenu>');
	return ctx;
};

interface ItemContextValue {
	value: string;
	triggerRef: React.RefObject<HTMLButtonElement | null>;
	contentRef: React.RefObject<HTMLDivElement | null>;
	triggerId: string;
	contentId: string;
}
const ItemContext = createContext<ItemContextValue | null>(null);
const useItem = () => {
	const ctx = useContext(ItemContext);
	if (!ctx) throw new Error('NavigationMenuTrigger / NavigationMenuContent must be used within <NavigationMenuItem>');
	return ctx;
};

/** Class names shared by triggers and top-level links, so a plain `<a>` can look like a trigger. */
export function navigationMenuTriggerStyle(className?: string) {
	return cn(
		'group inline-flex h-10 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-control bg-transparent px-4 py-2 text-sm font-bold text-page-text outline-none transition-colors',
		'hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand data-[state=open]:bg-hover aria-[current=page]:bg-brand-bg disabled:pointer-events-none disabled:opacity-50',
		className,
	);
}

export interface NavigationMenuProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
	/** Controlled open item ('' = closed). */
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Hover-intent delay before a panel opens, ms. */
	delayDuration?: number;
	/** Grace period before a panel closes after the pointer leaves, ms. */
	closeDelay?: number;
}

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
	({ value, defaultValue = '', onValueChange, delayDuration = 120, closeDelay = 180, className, children, 'aria-label': ariaLabel = 'Main', ...props }, ref) => {
		const [current, setValue] = useControllableState<string>(value, defaultValue, onValueChange);
		const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
		const focusFirstRef = useRef(false);
		const currentRef = useRef(current);
		currentRef.current = current;

		const cancelTimers = useCallback(() => clearTimeout(timer.current), []);
		const scheduleOpen = useCallback(
			(v: string) => {
				clearTimeout(timer.current);
				if (currentRef.current === v) return;
				// Moving between items while one is already open switches instantly.
				if (currentRef.current !== '') setValue(v);
				else timer.current = setTimeout(() => setValue(v), delayDuration);
			},
			[delayDuration, setValue],
		);
		const scheduleClose = useCallback(() => {
			clearTimeout(timer.current);
			timer.current = setTimeout(() => setValue(''), closeDelay);
		}, [closeDelay, setValue]);
		useEffect(() => () => clearTimeout(timer.current), []);

		return (
			<NavigationMenuContext.Provider value={{ value: current, setValue, scheduleOpen, scheduleClose, cancelTimers, focusFirstRef }}>
				<nav ref={ref} aria-label={ariaLabel} className={cn('relative z-10 flex max-w-full', className)} {...props}>
					{children}
				</nav>
			</NavigationMenuContext.Provider>
		);
	},
);
NavigationMenu.displayName = 'NavigationMenu';

export const NavigationMenuList = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(({ className, onKeyDown, ...props }, ref) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		const target = e.target as HTMLElement;
		if (!target.hasAttribute('data-pk-nav-item')) return;
		const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
		let step = 0;
		if (e.key === 'ArrowRight') step = rtl ? -1 : 1;
		else if (e.key === 'ArrowLeft') step = rtl ? 1 : -1;
		const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-pk-nav-item]'));
		let next: HTMLElement | undefined;
		if (step) next = items[(items.indexOf(target) + step + items.length) % items.length];
		else if (e.key === 'Home') next = items[0];
		else if (e.key === 'End') next = items[items.length - 1];
		if (!next) return;
		e.preventDefault();
		next.focus();
	};
	return <ul ref={ref} className={cn('m-0 flex list-none flex-wrap items-center justify-center gap-1 p-0', className)} onKeyDown={handleKeyDown} {...props} />;
});
NavigationMenuList.displayName = 'NavigationMenuList';

export interface NavigationMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
	/** Identifies the item; generated when omitted. */
	value?: string;
}

export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(({ value, className, ...props }, ref) => {
	const generated = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const triggerId = useId();
	const contentId = useId();
	return (
		<ItemContext.Provider value={{ value: value ?? generated, triggerRef, contentRef, triggerId, contentId }}>
			<li ref={ref} className={cn('relative list-none', className)} {...props} />
		</ItemContext.Provider>
	);
});
NavigationMenuItem.displayName = 'NavigationMenuItem';

export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
	({ className, children, onClick, onKeyDown, onPointerEnter, onPointerLeave, ...props }, ref) => {
		const menu = useNavigationMenu();
		const item = useItem();
		const open = menu.value === item.value;
		const openedByHover = useRef(false);

		const setRefs = (node: HTMLButtonElement | null) => {
			(item.triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
		};

		return (
			<button
				ref={setRefs}
				id={item.triggerId}
				type="button"
				data-pk-nav-item=""
				data-state={open ? 'open' : 'closed'}
				aria-expanded={open}
				aria-controls={open ? item.contentId : undefined}
				className={navigationMenuTriggerStyle(className)}
				onPointerEnter={(e) => {
					onPointerEnter?.(e);
					if (e.pointerType !== 'mouse') return;
					openedByHover.current = true;
					menu.scheduleOpen(item.value);
				}}
				onPointerLeave={(e) => {
					onPointerLeave?.(e);
					if (e.pointerType === 'mouse') menu.scheduleClose();
				}}
				onClick={(e) => {
					onClick?.(e);
					if (e.defaultPrevented) return;
					menu.cancelTimers();
					// The click that follows a hover-open should not immediately close the panel again.
					if (open && openedByHover.current) {
						openedByHover.current = false;
						return;
					}
					openedByHover.current = false;
					menu.setValue(open ? '' : item.value);
				}}
				onKeyDown={(e) => {
					onKeyDown?.(e);
					if (e.defaultPrevented) return;
					if (e.key === 'ArrowDown') {
						e.preventDefault();
						menu.cancelTimers();
						if (open) item.contentRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
						else {
							menu.focusFirstRef.current = true;
							menu.setValue(item.value);
						}
					} else if (e.key === 'Tab' && !e.shiftKey && open) {
						// The panel is portalled to <body>, so move into it explicitly.
						const first = item.contentRef.current?.querySelector<HTMLElement>(FOCUSABLE);
						if (first) {
							e.preventDefault();
							first.focus();
						}
					}
				}}
				{...props}
			>
				{children}
				<ChevronDownIcon aria-hidden="true" className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
			</button>
		);
	},
);
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger';

export const NavigationMenuContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, onKeyDown, onPointerEnter, onPointerLeave, ...props }, ref) => {
	const menu = useNavigationMenu();
	const item = useItem();
	const open = menu.value === item.value;
	const { mounted, state } = usePresence(open);
	const style = useAnchoredPosition(item.triggerRef, item.contentRef, { open: mounted, align: 'start', gap: 6 });
	const close = () => menu.setValue('');
	useClickOutside([item.triggerRef, item.contentRef], close, open);
	useEscape(() => {
		close();
		item.triggerRef.current?.focus();
	}, open);

	useEffect(() => {
		if (!open || !menu.focusFirstRef.current) return;
		menu.focusFirstRef.current = false;
		item.contentRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	if (!mounted) return null;

	const setRefs = (node: HTMLDivElement | null) => {
		(item.contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
		if (typeof ref === 'function') ref(node);
		else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
		const index = items.indexOf(document.activeElement as HTMLElement);
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const step = e.key === 'ArrowDown' ? 1 : -1;
			items[(index + step + items.length) % items.length]?.focus();
		} else if (e.key === 'Tab') {
			const leaving = e.shiftKey ? index <= 0 : index === items.length - 1;
			if (leaving) {
				e.preventDefault();
				item.triggerRef.current?.focus();
				if (!e.shiftKey) close();
			}
		}
	};

	return (
		<Portal>
			<div
				ref={setRefs}
				id={item.contentId}
				data-pk-layer=""
				role="group"
				aria-labelledby={item.triggerId}
				style={style}
				className={cn('z-[200] w-max max-w-[calc(100vw-1rem)] overflow-y-auto ui-border border-line rounded-box bg-surface p-3 text-page-text shadow-pop outline-none', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none', className)}
				{...presenceAttrs(state)}
				onPointerEnter={(e) => {
					onPointerEnter?.(e);
					if (e.pointerType === 'mouse') menu.cancelTimers();
				}}
				onPointerLeave={(e) => {
					onPointerLeave?.(e);
					if (e.pointerType === 'mouse') menu.scheduleClose();
				}}
				onKeyDown={handleKeyDown}
				{...props}
			>
				{children}
			</div>
		</Portal>
	);
});
NavigationMenuContent.displayName = 'NavigationMenuContent';

export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Marks the current page (`aria-current="page"`). */
	active?: boolean;
	/** Render the single child (e.g. a router `<Link>`) instead of an `<a>`. */
	asChild?: boolean;
}

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(({ active, asChild, className, children, onClick, ...props }, ref) => {
	const menu = useContext(NavigationMenuContext);
	const shared = {
		'data-pk-nav-item': '',
		'data-active': active ? '' : undefined,
		'aria-current': active ? ('page' as const) : undefined,
		onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
			onClick?.(e);
			if (!e.defaultPrevented) menu?.setValue('');
		},
	};
	if (asChild) {
		return (
			<Slot className={cn('block cursor-pointer rounded-item px-3 py-2 text-sm outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand aria-[current=page]:bg-brand-bg aria-[current=page]:font-bold', className)} {...(shared as React.HTMLAttributes<HTMLElement>)} {...(props as React.HTMLAttributes<HTMLElement>)}>
				{children}
			</Slot>
		);
	}
	return (
		<a ref={ref} className={cn('block cursor-pointer rounded-item px-3 py-2 text-sm outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand aria-[current=page]:bg-brand-bg aria-[current=page]:font-bold', className)} {...shared} {...props}>
			{children}
		</a>
	);
});
NavigationMenuLink.displayName = 'NavigationMenuLink';
