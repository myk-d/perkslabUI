import React, { createContext, useContext, useId, useMemo, useRef } from 'react';
import { withTriggerAria } from '../lib/trigger';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { CloseIcon } from '../lib/icons';
import { useLayer } from '../lib/layers';
import { useEscape, useFocusTrap, useScrollLock } from '../lib/dom';
import { presenceAttrs, usePresence } from '../lib/presence';
import { MergeSlot } from '../lib/Slot';
import { useControllableState } from '../lib/useControllableState';

/**
 * shadcn-style Dialog (also the primitive behind Modal, Sheet and AlertDialog): controlled/uncontrolled open state, portal, overlay,
 * Escape, scroll lock, focus trap + focus restore, aria-modal wiring.
 *
 * `<Dialog><DialogTrigger asChild><Button/></DialogTrigger><DialogContent><DialogHeader><DialogTitle/><DialogDescription/></DialogHeader>…</DialogContent></Dialog>`
 */
export interface DialogContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
	titleId: string;
	descriptionId: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(part: string) {
	const ctx = useContext(DialogContext);
	if (!ctx) throw new Error(`${part} must be used within its parent (Dialog / Modal / Sheet)`);
	return ctx;
}

export interface DialogProps {
	children: React.ReactNode;
	/** Optional wrapper element class. Without it the root renders no DOM of its own. */
	className?: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}
/** @deprecated alias of DialogProps. */
export type DialogRootProps = DialogProps;

export const Dialog = ({ children, className, open, defaultOpen = false, onOpenChange }: DialogProps) => {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const titleId = useId();
	const descriptionId = useId();
	const value = useMemo(() => ({ open: isOpen, setOpen, toggle: () => setOpen(!isOpen), titleId, descriptionId }), [isOpen, setOpen, titleId, descriptionId]);
	return (
		<DialogContext.Provider value={value}>
			{className ? <div className={className}>{children}</div> : children}
		</DialogContext.Provider>
	);
};

interface PressableProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
	/** Render the single child directly (merging props/handlers/ref) instead of wrapping it in a div. */
	asChild?: boolean;
	children: React.ReactNode;
	press: () => void;
	wrapperClass: string;
}

/** Shared by trigger/close/action: `asChild` clones the child, otherwise a layout-neutral wrapper div catches the click. */
export const Pressable = React.forwardRef<HTMLElement, PressableProps>(function Pressable({ asChild, children, press, wrapperClass, className, ...rest }, ref) {
	if (asChild && React.isValidElement(children)) {
		return (
			<MergeSlot ref={ref} {...rest} className={className} onClick={press}>
				{children}
			</MergeSlot>
		);
	}
	// wrapper mode: disclosure ARIA belongs on the interactive child, not on the role-less div
	const { 'aria-haspopup': haspopup, 'aria-expanded': expanded, ...divProps } = rest as Record<string, unknown>;
	return (
		<div ref={ref as React.Ref<HTMLDivElement>} className={cn(wrapperClass, className)} {...divProps} onClick={press}>
			{withTriggerAria(children, { 'aria-haspopup': haspopup, 'aria-expanded': expanded })}
		</div>
	);
});

export interface DialogTriggerProps {
	children: React.ReactNode;
	className?: string;
	/** Use the single child element as the trigger (no wrapper div). */
	asChild?: boolean;
	/** Which component's error to show when used outside its root. */
	part?: string;
}

export const DialogTrigger = ({ children, className, asChild, part = 'DialogTrigger' }: DialogTriggerProps) => {
	const ctx = useDialog(part);
	return (
		<Pressable asChild={asChild} wrapperClass="inline-flex w-fit cursor-pointer" className={className} aria-haspopup="dialog" aria-expanded={ctx.open} data-state={ctx.open ? 'open' : 'closed'} press={() => ctx.setOpen(true)}>
			{children}
		</Pressable>
	);
};

export interface DialogCloseProps {
	children: React.ReactNode;
	className?: string;
	asChild?: boolean;
	part?: string;
}

export const DialogClose = ({ children, className, asChild, part = 'DialogClose' }: DialogCloseProps) => {
	const ctx = useDialog(part);
	return (
		<Pressable asChild={asChild} wrapperClass="inline-flex cursor-pointer" className={className} press={() => ctx.setOpen(false)}>
			{children}
		</Pressable>
	);
};

/** Runs `onClick`, then closes. */
export const DialogAction = ({ children, className, onClick, asChild, part = 'DialogAction' }: DialogCloseProps & { onClick?: () => void }) => {
	const ctx = useDialog(part);
	return (
		<Pressable
			asChild={asChild}
			wrapperClass="inline-flex cursor-pointer"
			className={className}
			press={() => {
				onClick?.();
				ctx.setOpen(false);
			}}
		>
			{children}
		</Pressable>
	);
};

/** Low-level: portal to document.body. `DialogContent` already portals itself; use these only when composing a custom surface. */
export const DialogPortal = ({ children }: { children: React.ReactNode }) => <Portal>{children}</Portal>;

export const DialogOverlay = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const ctx = useDialog('DialogOverlay');
	return (
		<div
			className={cn('absolute inset-0 bg-page-text/30 backdrop-blur-sm', ctx.open ? 'animate-pk-fade-in' : 'animate-pk-fade-out', className)}
			data-state={ctx.open ? 'open' : 'closed'}
			onClick={() => ctx.setOpen(false)}
			aria-hidden="true"
			{...props}
		/>
	);
};

export interface DialogSurfaceProps {
	part: string;
	children: React.ReactNode;
	/** Wrapper (positions the panel inside the viewport). */
	wrapperClassName: string;
	panelClassName: string;
	showCloseButton?: boolean;
	closeLabel?: string;
	closeOnBackdrop?: boolean;
	role?: 'dialog' | 'alertdialog';
	/** Extra attributes for the panel element (data-*, aria-*, id, style…). */
	panelProps?: Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;
}

// Literal class names so Tailwind's scanner emits the exit utilities.
const EXIT_CLASSES: [string, string][] = [
	['animate-pk-slide-up', 'animate-pk-slide-down'],
	['animate-pk-slide-in-right', 'animate-pk-slide-out-right'],
	['animate-pk-slide-in-left', 'animate-pk-slide-out-left'],
	['animate-pk-slide-in-top', 'animate-pk-slide-out-top'],
	['animate-pk-slide-in-bottom', 'animate-pk-slide-out-bottom'],
];
/** Swaps an entrance animation class for its exit counterpart. */
export const toExitClass = (className: string) => EXIT_CLASSES.reduce((acc, [enter, exit]) => acc.replace(enter, exit), className);

/** Internal primitive (Dialog/Sheet/Alert content). Prefer DialogContent / SheetContent. */
export const DialogSurfacePrimitive = ({ part, children, wrapperClassName, panelClassName, showCloseButton, closeLabel = 'Close', closeOnBackdrop = true, role = 'dialog', panelProps }: DialogSurfaceProps) => {
	const ctx = useDialog(part);
	const panelRef = useRef<HTMLDivElement>(null);
	const isTop = useLayer(ctx.open);
	useScrollLock(ctx.open);
	useEscape(() => isTop() && ctx.setOpen(false), ctx.open);
	useFocusTrap(panelRef, ctx.open);

	const { mounted, state } = usePresence(ctx.open);
	if (!mounted) return null;
	const closed = state === 'closed';
	return (
		<Portal>
			<div className={cn(wrapperClassName, closed && 'pointer-events-none')} {...presenceAttrs(state)}>
				<div className={cn('absolute inset-0 bg-page-text/30 backdrop-blur-sm', closed ? 'animate-pk-fade-out' : 'animate-pk-fade-in')} onClick={closeOnBackdrop ? () => ctx.setOpen(false) : undefined} aria-hidden="true" data-pk-overlay="" />
				<div
					ref={panelRef}
					role={role}
					aria-modal="true"
					aria-labelledby={ctx.titleId}
					aria-describedby={ctx.descriptionId}
					tabIndex={-1}
					{...panelProps}
					data-state={state}
					className={closed ? toExitClass(panelClassName) : panelClassName}
				>
					{showCloseButton && (
						<button
							type="button"
							onClick={() => ctx.setOpen(false)}
							aria-label={closeLabel}
							className="absolute end-4 top-4 z-10 rounded-item p-1 text-muted hover:text-page-text hover:bg-hover transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
						>
							<CloseIcon className="size-5" />
						</button>
					)}
					{children}
				</div>
			</div>
		</Portal>
	);
};

export interface DialogContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
	children: React.ReactNode;
	className?: string;
	/** Renders the X button in the corner. Default true (shadcn). */
	showCloseButton?: boolean;
	/** Disable closing by clicking the overlay (Escape still closes). */
	closeOnBackdrop?: boolean;
	closeLabel?: string;
	role?: 'dialog' | 'alertdialog';
}

export const DialogContent = ({ children, className, showCloseButton = true, closeOnBackdrop = true, closeLabel, role, ...panelProps }: DialogContentProps) => (
	<DialogSurfacePrimitive
		part="DialogContent"
		wrapperClassName="fixed inset-0 z-[100] flex items-center justify-center"
		panelClassName={cn(
			'relative flex w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-y-auto p-6 rounded-box ui-border border-line bg-surface text-page-text shadow-pop outline-none',
			'animate-pk-slide-up',
			className,
		)}
		showCloseButton={showCloseButton}
		closeOnBackdrop={closeOnBackdrop}
		closeLabel={closeLabel}
		role={role}
		panelProps={panelProps}
	>
		{children}
	</DialogSurfacePrimitive>
);

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-slot="dialog-header" className={cn('flex flex-col gap-2 text-center sm:text-start', className)} {...props} />;
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-slot="dialog-footer" className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;

/** Scrollable middle section for the sticky header/footer pattern: `<DialogContent><DialogHeader/><DialogBody>…</DialogBody><DialogFooter/></DialogContent>`. */
export const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-slot="dialog-body" className={cn('min-h-0 flex-1 overflow-y-auto', className)} {...props} />;

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
	const ctx = useDialog('DialogTitle');
	return <h2 id={ctx.titleId} className={cn('ui-heading text-lg text-page-text', className)} {...props} />;
};

export const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
	const ctx = useDialog('DialogDescription');
	return <p id={ctx.descriptionId} className={cn('text-sm text-page-text/70 leading-relaxed', className)} {...props} />;
};
