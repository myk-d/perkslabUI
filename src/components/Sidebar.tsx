import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cn } from '../lib/cn';
import { Slot } from '../lib/Slot';
import { useControllableState } from '../lib/useControllableState';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './Sheet';
import { Tooltip } from './Tooltip';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3.5rem';
const MOBILE_QUERY = '(max-width: 767px)';

export interface SidebarContextValue {
	/** Desktop expanded state. */
	open: boolean;
	setOpen: (open: boolean) => void;
	state: 'expanded' | 'collapsed';
	/** Mobile drawer state. */
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	/** Toggles the mobile drawer on mobile, the desktop sidebar otherwise. */
	toggleSidebar: () => void;
}
const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
	const ctx = useContext(SidebarContext);
	if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
	return ctx;
}

function useIsMobile() {
	const [mobile, setMobile] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia(MOBILE_QUERY);
		const update = () => setMobile(mq.matches);
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	}, []);
	return mobile;
}

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Ctrl/Cmd + this key toggles the sidebar. `false` disables the shortcut. */
	shortcut?: string | false;
}

export const SidebarProvider = ({ open, defaultOpen = true, onOpenChange, shortcut = 'b', className, style, children, ...props }: SidebarProviderProps) => {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const [openMobile, setOpenMobile] = useState(false);
	const isMobile = useIsMobile();

	const toggleSidebar = useCallback(() => {
		if (isMobile) setOpenMobile((v) => !v);
		else setOpen((v) => !v);
	}, [isMobile, setOpen]);

	useEffect(() => {
		if (shortcut === false) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === shortcut.toLowerCase() && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
				e.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [shortcut, toggleSidebar]);

	return (
		<SidebarContext.Provider value={{ open: isOpen, setOpen, state: isOpen ? 'expanded' : 'collapsed', openMobile, setOpenMobile, isMobile, toggleSidebar }}>
			<div
				data-slot="sidebar-wrapper"
				style={{ '--sidebar-width': SIDEBAR_WIDTH, '--sidebar-width-icon': SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
				className={cn('group/sidebar-wrapper flex min-h-svh w-full bg-page-bg text-page-text', className)}
				{...props}
			>
				{children}
			</div>
		</SidebarContext.Provider>
	);
};

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	side?: 'left' | 'right';
	variant?: 'sidebar' | 'floating' | 'inset';
	collapsible?: 'offcanvas' | 'icon' | 'none';
}

export const Sidebar = ({ side = 'left', variant = 'sidebar', collapsible = 'offcanvas', className, children, ...props }: SidebarProps) => {
	const { state, isMobile, openMobile, setOpenMobile } = useSidebar();

	if (collapsible === 'none') {
		return (
			<div data-slot="sidebar" className={cn('flex h-full w-(--sidebar-width) flex-col bg-surface text-page-text', side === 'left' ? 'border-r' : 'border-l', 'border-line', className)} {...props}>
				{children}
			</div>
		);
	}

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile}>
				<SheetContent side={side} showCloseButton={false} className="w-(--sidebar-width) sm:max-w-(--sidebar-width) gap-0 p-0">
					<SheetTitle className="sr-only">Sidebar</SheetTitle>
					<SheetDescription className="sr-only">Navigation</SheetDescription>
					<div data-slot="sidebar" className={cn('flex h-full w-full flex-col', className)} {...props}>
						{children}
					</div>
				</SheetContent>
			</Sheet>
		);
	}

	const collapsed = state === 'collapsed';
	const floating = variant === 'floating' || variant === 'inset';
	return (
		<div
			data-slot="sidebar"
			data-state={state}
			data-collapsed={collapsed && collapsible === 'icon' ? 'true' : 'false'}
			data-collapsible={collapsed ? collapsible : ''}
			data-variant={variant}
			data-side={side}
			className="group/sidebar peer hidden text-page-text md:block"
		>
			{/* Reserves the space of the fixed panel inside the flex layout. */}
			<div
				className={cn(
					'relative h-svh bg-transparent transition-[width] duration-200 ease-linear w-(--sidebar-width)',
					collapsed && collapsible === 'offcanvas' && 'w-0',
					collapsed && collapsible === 'icon' && (floating ? 'w-[calc(var(--sidebar-width-icon)+1rem)]' : 'w-(--sidebar-width-icon)'),
					floating && !collapsed && 'w-[calc(var(--sidebar-width)+1rem)]',
				)}
			/>
			<div
				className={cn(
					'fixed inset-y-0 z-30 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
					side === 'left' ? 'left-0' : 'right-0',
					collapsed && collapsible === 'offcanvas' && (side === 'left' ? 'left-[calc(var(--sidebar-width)*-1)]' : 'right-[calc(var(--sidebar-width)*-1)]'),
					collapsed && collapsible === 'icon' && (floating ? 'w-[calc(var(--sidebar-width-icon)+1rem)]' : 'w-(--sidebar-width-icon)'),
					floating && 'p-2',
					className,
				)}
				{...props}
			>
				<div
					data-sidebar="inner"
					className={cn(
						'relative flex h-full w-full flex-col overflow-hidden bg-surface text-page-text',
						floating ? 'ui-border border-line rounded-box shadow-box' : cn('border-line', side === 'left' ? 'border-r' : 'border-l'),
					)}
				>
					{children}
				</div>
			</div>
		</div>
	);
};

export const SidebarTrigger = ({ className, onClick, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
	return (
		<button
			type="button"
			aria-label="Toggle sidebar"
			aria-expanded={isMobile ? openMobile : open}
			onClick={(e) => {
				onClick?.(e);
				toggleSidebar();
			}}
			className={cn(
				'inline-flex size-8 cursor-pointer items-center justify-center rounded-item text-page-text outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand',
				className,
			)}
			{...props}
		>
			{children ?? (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
					<rect x="3" y="4" width="18" height="16" rx="2" />
					<path d="M9 4v16" />
				</svg>
			)}
		</button>
	);
};

/** Thin hit area on the sidebar edge that toggles it on click. */
export const SidebarRail = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	const { toggleSidebar } = useSidebar();
	return (
		<button
			type="button"
			aria-label="Toggle sidebar"
			tabIndex={-1}
			title="Toggle sidebar"
			onClick={toggleSidebar}
			className={cn(
				'absolute inset-y-0 z-20 hidden w-3 cursor-pointer outline-none transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-px hover:after:bg-line sm:flex',
				'group-data-[side=left]/sidebar:-right-1.5 group-data-[side=right]/sidebar:-left-1.5',
				className,
			)}
			{...props}
		/>
	);
};

/** Main content area next to the Sidebar. With `variant="inset"` on the Sidebar it becomes a rounded card. */
export const SidebarInset = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
	<main
		data-slot="sidebar-inset"
		className={cn(
			'relative flex min-h-svh min-w-0 flex-1 flex-col bg-page-bg',
			'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:min-h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:rounded-box md:peer-data-[variant=inset]:shadow-box md:peer-data-[variant=inset]:ui-border md:peer-data-[variant=inset]:border-line',
			className,
		)}
		{...props}
	/>
);

export const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
export const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('mt-auto flex flex-col gap-2 p-2', className)} {...props} />;

export const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden', className)} {...props} />
);

export const SidebarSeparator = ({ className }: { className?: string }) => <div role="separator" className={cn('mx-2 h-px bg-line/40', className)} />;

export const SidebarGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />;

export const SidebarGroupLabel = ({ className, asChild, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) => {
	const classes = cn(
		'ui-label flex h-8 shrink-0 items-center rounded-item px-2 text-[11px] text-muted transition-[margin,opacity] duration-200',
		'group-data-[collapsed=true]/sidebar:-mt-8 group-data-[collapsed=true]/sidebar:opacity-0',
		className,
	);
	if (asChild) return <Slot className={classes} {...props}>{children}</Slot>;
	return <div className={classes} {...props}>{children}</div>;
};

export const SidebarGroupContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('w-full text-sm', className)} {...props} />;

export const SidebarMenu = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className={cn('flex w-full min-w-0 list-none flex-col gap-1 p-0 m-0', className)} {...props} />;
export const SidebarMenuItem = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => <li className={cn('group/menu-item relative', className)} {...props} />;

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isActive?: boolean;
	asChild?: boolean;
	/** Shown in a tooltip when the sidebar is collapsed to icons. */
	tooltip?: string;
	size?: 'sm' | 'md' | 'lg';
}

const buttonSizes = { sm: 'h-7 text-xs', md: 'h-8 text-sm', lg: 'h-12 text-sm' };

export const SidebarMenuButton = ({ isActive = false, asChild, tooltip, size = 'md', className, children, ...props }: SidebarMenuButtonProps) => {
	const { state, isMobile } = useSidebar();
	const classes = cn(
		'peer/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-item px-2 text-left outline-none transition-colors',
		'hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
		'data-[active=true]:bg-hover data-[active=true]:font-semibold',
		'[&>svg]:size-4 [&>svg]:shrink-0 [&>span:last-child]:truncate',
		'group-data-[collapsed=true]/sidebar:size-8 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:p-2 group-data-[collapsed=true]/sidebar:[&>span:not(:first-child)]:hidden',
		buttonSizes[size],
		className,
	);
	const common = { 'data-active': isActive, 'aria-current': isActive ? ('page' as const) : undefined };
	const el = asChild ? (
		<Slot className={classes} {...common} {...(props as React.HTMLAttributes<HTMLElement>)}>
			{children}
		</Slot>
	) : (
		<button type="button" className={classes} {...common} {...props}>
			{children}
		</button>
	);
	if (!tooltip || state !== 'collapsed' || isMobile) return el;
	return (
		<Tooltip content={tooltip} align="start">
			{el}
		</Tooltip>
	);
};

export const SidebarMenuBadge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn('pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-item px-1 text-xs font-medium tabular-nums text-muted top-1.5', 'group-data-[collapsed=true]/sidebar:hidden', className)}
		{...props}
	/>
);

export const SidebarMenuSub = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
	<ul className={cn('mx-3.5 my-0 flex min-w-0 list-none flex-col gap-1 border-l border-line/40 py-0.5 pl-2.5 pr-0', 'group-data-[collapsed=true]/sidebar:hidden', className)} {...props} />
);
export const SidebarMenuSubItem = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => <li className={cn('group/menu-sub-item relative', className)} {...props} />;

export const SidebarMenuSubButton = ({
	isActive = false,
	asChild,
	size = 'md',
	className,
	children,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean; asChild?: boolean; size?: 'sm' | 'md' }) => {
	const classes = cn(
		'flex w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-item px-2 text-left outline-none transition-colors',
		'hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50',
		'data-[active=true]:bg-hover data-[active=true]:font-semibold [&>svg]:size-4 [&>svg]:shrink-0',
		size === 'sm' ? 'h-6 text-xs' : 'h-7 text-sm',
		className,
	);
	const common = { 'data-active': isActive, 'aria-current': isActive ? ('page' as const) : undefined };
	if (asChild) {
		return (
			<Slot className={classes} {...common} {...(props as React.HTMLAttributes<HTMLElement>)}>
				{children}
			</Slot>
		);
	}
	return (
		<button type="button" className={classes} {...common} {...props}>
			{children}
		</button>
	);
};
