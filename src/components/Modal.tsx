import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '../utils';

interface ModalContextProps {
	isOpen: boolean;
	toggle: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const Modal = ({ children, className }: { children: React.ReactNode; className?: string }) => {
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
		<ModalContext.Provider value={{ isOpen, toggle }}>
			<div className={cn('', className)}>{children}</div>
		</ModalContext.Provider>
	);
};

export const ModalTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const context = useContext(ModalContext);
	if (!context) throw new Error('ModalTrigger must be used within Modal');

	return (
		<div className={cn('w-fit cursor-pointer', className)} onClick={context.toggle}>
			{children}
		</div>
	);
};

export const ModalContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const context = useContext(ModalContext);
	if (!context) throw new Error('ModalContent must be used within Modal');

	if (!context.isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-page-text/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={context.toggle} />

			<div
				className={cn(
					'relative w-full max-w-lg p-8 rounded-2xl border border-brand bg-page-bg shadow-2xl',
					'animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300',
					'flex flex-col gap-4',
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
};

export const ModalCloseButton = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const context = useContext(ModalContext);
	if (!context) throw new Error('ModalCloseButton must be used within Modal');

	return (
		<div className={cn('cursor-pointer', className)} onClick={context.toggle}>
			{children}
		</div>
	);
};

export const ModalActionButton = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
	const context = useContext(ModalContext);
	if (!context) throw new Error('ModalActionButton must be used within Modal');

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
