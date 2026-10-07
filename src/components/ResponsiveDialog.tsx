import React, { createContext, useContext } from 'react';
import { useMediaQuery } from '../lib/useMediaQuery';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, type DialogContentProps } from './Dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, type DrawerContentProps } from './Drawer';

export { useMediaQuery };

const ResponsiveContext = createContext<{ desktop: boolean } | null>(null);
const useResponsive = () => {
	const ctx = useContext(ResponsiveContext);
	if (!ctx) throw new Error('ResponsiveDialog parts must be used within <ResponsiveDialog>');
	return ctx.desktop;
};

export interface ResponsiveDialogProps {
	children: React.ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Viewport width (px) from which the Dialog is used; below it a Drawer. Default 768. */
	breakpoint?: number;
}

/** Dialog on desktop, bottom Drawer on mobile (shadcn's "responsive dialog" pattern). On the server / first render the drawer variant is used. */
export const ResponsiveDialog = ({ breakpoint = 768, children, ...props }: ResponsiveDialogProps) => {
	const desktop = useMediaQuery(`(min-width: ${breakpoint}px)`);
	const Root = desktop ? Dialog : Drawer;
	return (
		<ResponsiveContext.Provider value={{ desktop }}>
			<Root {...props}>{children}</Root>
		</ResponsiveContext.Provider>
	);
};

type AsChildProps = { children: React.ReactNode; className?: string; asChild?: boolean };
export const ResponsiveDialogTrigger = (props: AsChildProps) => (useResponsive() ? <DialogTrigger {...props} /> : <DrawerTrigger {...props} />);
export const ResponsiveDialogClose = (props: AsChildProps) => (useResponsive() ? <DialogClose {...props} /> : <DrawerClose {...props} />);

export type ResponsiveDialogContentProps = DialogContentProps & Pick<DrawerContentProps, 'showSwipeHandle'>;
export const ResponsiveDialogContent = ({ showSwipeHandle, closeOnBackdrop, ...props }: ResponsiveDialogContentProps) => {
	if (useResponsive()) return <DialogContent closeOnBackdrop={closeOnBackdrop} {...props} />;
	// A drawer only shows an X when asked to; `showCloseButton` is forwarded as-is.
	const { showCloseButton, ...rest } = props;
	return <DrawerContent showSwipeHandle={showSwipeHandle} showCloseButton={showCloseButton === true} {...rest} />;
};

type DivProps = React.HTMLAttributes<HTMLDivElement>;
export const ResponsiveDialogHeader = (props: DivProps) => (useResponsive() ? <DialogHeader {...props} /> : <DrawerHeader {...props} />);
export const ResponsiveDialogFooter = (props: DivProps) => (useResponsive() ? <DialogFooter {...props} /> : <DrawerFooter {...props} />);
export const ResponsiveDialogTitle = (props: React.HTMLAttributes<HTMLHeadingElement>) => (useResponsive() ? <DialogTitle {...props} /> : <DrawerTitle {...props} />);
export const ResponsiveDialogDescription = (props: React.HTMLAttributes<HTMLParagraphElement>) => (useResponsive() ? <DialogDescription {...props} /> : <DrawerDescription {...props} />);
