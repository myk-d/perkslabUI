import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '../utils';

interface SheetContextProps {
	isOpen: boolean;
	toggle: () => void;
}

const SheetContext = createContext<SheetContextProps | undefined>(undefined);

export const Sheet = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => setIsOpen((prev) => !prev);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	return (
		<SheetContext.Provider value={{ isOpen, toggle }}>
			<div className={cn('', className)}>{children}</div>
		</SheetContext.Provider>
	);
};

export const SheetTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const context = useContext(SheetContext);
	if (!context) throw new Error('SheetTrigger must be used within Sheet');

	return (
		<div className={cn('w-fit cursor-pointer', className)} onClick={context.toggle}>
			{children}
		</div>
	);
};

export const SheetContent = ({
	children,
	className,
	position = 'right',
}: {
	children: React.ReactNode;
	className?: string;
	position?: 'left' | 'right';
}) => {
	const context = useContext(SheetContext);
	if (!context) throw new Error('SheetContent must be used within Sheet');

	if (!context.isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-page-text/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={context.toggle} />

			{/* Sheet Panel */}
			<div
				className={cn(
					'relative h-full w-80 bg-page-bg shadow-2xl p-6 flex flex-col gap-6',
					'animate-in duration-300 ease-in-out',
					position === 'right' ? 'ml-auto border-l border-brand slide-in-from-right' : 'mr-auto border-r border-brand slide-in-from-left',
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
};

export const SheetCloseButton = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const context = useContext(SheetContext);
	if (!context) throw new Error('SheetCloseButton must be used within Sheet');

	return (
		<div className={cn('cursor-pointer', className)} onClick={context.toggle}>
			{children}
		</div>
	);
};

export const SheetActionButton = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
	const context = useContext(SheetContext);
	if (!context) throw new Error('SheetActionButton must be used within Sheet');

	const handleClick = () => {
		if (onClick) onClick();
		context.toggle();
	};

	return (
		<div className={cn('cursor-pointer', className)} onClick={handleClick}>
			{children}
		</div>
	);
};
