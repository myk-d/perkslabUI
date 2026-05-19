import React, { createContext, useContext, useState } from 'react';
import { cn } from '../utils/cn';

interface AccordionContextProps {
	openItem: string | null;
	toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

export const Accordion = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const [openItem, setOpenItem] = useState<string | null>(null);

	const toggleItem = (value: string) => {
		setOpenItem(openItem === value ? null : value);
	};

	return (
		<AccordionContext.Provider value={{ openItem, toggleItem }}>
			<div className={cn('flex flex-col gap-3 w-full', className)}>{children}</div>
		</AccordionContext.Provider>
	);
};

export const AccordionItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
	return (
		<div className={cn('border border-brand rounded-2xl overflow-hidden bg-page-bg transition-all duration-300', className)}>
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child)) {
					return React.cloneElement(child as React.ReactElement<any>, { value });
				}
				return child;
			})}
		</div>
	);
};

export const AccordionTrigger = ({ value, children, className }: { value?: string; children: React.ReactNode; className?: string }) => {
	const context = useContext(AccordionContext);
	if (!context) throw new Error('AccordionTrigger must be used within Accordion');

	const isOpen = context.openItem === value;

	return (
		<button
			onClick={() => value && context.toggleItem(value)}
			className={cn(
				'flex items-center justify-between w-full px-6 py-4',
				'text-page-text font-bold uppercase tracking-wider text-sm',
				'hover:bg-brand-bg transition-colors duration-300 cursor-pointer outline-none',
				className,
			)}
		>
			{children}
			<svg
				className={cn('w-5 h-5 text-brand transition-transform duration-300', isOpen && 'rotate-180')}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				strokeWidth="2.5"
			>
				<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	);
};

export const AccordionContent = ({ value, children, className }: { value?: string; children: React.ReactNode; className?: string }) => {
	const context = useContext(AccordionContext);
	if (!context) throw new Error('AccordionContent must be used within Accordion');

	const isOpen = context.openItem === value;

	if (!isOpen) return null;

	return (
		<div className={cn('px-6 pb-5 text-page-text/80 text-sm leading-relaxed', 'animate-in fade-in slide-in-from-top-2 duration-300', className)}>
			{children}
		</div>
	);
};
