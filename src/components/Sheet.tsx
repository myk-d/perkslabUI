import React from 'react';
import { cn } from '../lib/cn';
import { Dialog, DialogAction, DialogClose, DialogDescription, DialogSurfacePrimitive, DialogTitle, DialogTrigger } from './Dialog';

/** Side panel: `<Sheet><SheetTrigger/><SheetContent side="right">…</SheetContent></Sheet>`. Same open/onOpenChange contract as Dialog. */
export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
/** Runs `onClick`, then closes. */
export const SheetActionButton = DialogAction;
export const SheetCloseButton = DialogClose;

type Side = 'left' | 'right' | 'top' | 'bottom';

const sideClasses: Record<Side, { wrapper: string; panel: string }> = {
	right: { wrapper: 'flex', panel: 'ml-auto h-full w-3/4 sm:max-w-sm border-l animate-pk-slide-in-right' },
	left: { wrapper: 'flex', panel: 'mr-auto h-full w-3/4 sm:max-w-sm border-r animate-pk-slide-in-left' },
	top: { wrapper: 'flex flex-col', panel: 'mb-auto h-auto w-full max-h-full border-b animate-pk-slide-in-top' },
	bottom: { wrapper: 'flex flex-col', panel: 'mt-auto h-auto w-full max-h-full border-t animate-pk-slide-in-bottom' },
};

export interface SheetContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
	children: React.ReactNode;
	className?: string;
	side?: Side;
	/** @deprecated use `side`. */
	position?: 'left' | 'right';
	/** Renders the X button in the corner. Default true (shadcn). */
	showCloseButton?: boolean;
	closeOnBackdrop?: boolean;
	closeLabel?: string;
}

export const SheetContent = ({ children, className, side, position, showCloseButton = true, closeOnBackdrop = true, closeLabel, ...panelProps }: SheetContentProps) => {
	const resolved = side ?? position ?? 'right';
	const s = sideClasses[resolved];
	return (
		<DialogSurfacePrimitive
			part="SheetContent"
			wrapperClassName={cn('fixed inset-0 z-[100]', s.wrapper)}
			panelClassName={cn('relative overflow-y-auto bg-surface text-page-text shadow-pop p-6 flex flex-col gap-6 border-line outline-none', s.panel, className)}
			showCloseButton={showCloseButton}
			closeOnBackdrop={closeOnBackdrop}
			closeLabel={closeLabel}
			panelProps={{ ...panelProps, ...({ 'data-side': resolved } as object) }}
		>
			{children}
		</DialogSurfacePrimitive>
	);
};

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-slot="sheet-header" className={cn('flex flex-col gap-1.5 pe-8', className)} {...props} />;
export const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div data-slot="sheet-footer" className={cn('mt-auto flex flex-col gap-2', className)} {...props} />;
