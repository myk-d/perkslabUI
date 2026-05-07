import React, { useState } from 'react';
import { cn } from '../utils';

interface AccordionProps extends React.HTMLAttributes<HTMLDetailsElement> {}

interface AccordionTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface AccordionContextProps {
	expanded: boolean;
	toggleExpanded: () => void;
}

interface AccordionContentContextProps {
	isInsideAccordion: boolean;
}

const AccordionContext = React.createContext<AccordionContextProps | undefined>(undefined);
const AccordionContentContext = React.createContext<AccordionContentContextProps | undefined>(undefined);

export const Accordion: React.FC<AccordionProps> = ({ className, children, ...props }) => {
	const [expanded, setExpanded] = useState(false);

	const toggleExpanded = () => {
		setExpanded((prev) => !prev);
	};

	return (
		<AccordionContentContext.Provider value={{ isInsideAccordion: true }}>
			<details className={cn('rounded-md border-2 border-zinc-950 p-2 bg-rose-200', className)} {...props}>
				<AccordionContext.Provider value={{ expanded, toggleExpanded }}>{children}</AccordionContext.Provider>
			</details>
		</AccordionContentContext.Provider>
	);
};

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ className, children, ...props }) => {
	const { toggleExpanded, expanded } = React.useContext(AccordionContext) || {};
	const accordionContentContext = React.useContext(AccordionContentContext);

	if (!accordionContentContext?.isInsideAccordion) {
		throw new Error('Accordion Trigger can only be used inside Accordion');
	}

	return (
		<summary
			className={cn('w-full flex items-center justify-between cursor-pointer', className)}
			onClick={toggleExpanded}
			{...props}>
			<span className={cn('text-xl font-semibold', className)}>{children}</span>
			<svg
				width="24px"
				height="24px"
				viewBox="0 0 24 24"
				fill="none"
				className={cn({ 'rotate-180': expanded })}
				style={{ transition: 'transform 0.3s ease-in-out', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
				<g>
					<path
						d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
						fill="#0F0F0F"></path>
				</g>
			</svg>
		</summary>
	);
};

export const AccordionContent: React.FC<AccordionContentProps> = ({ className, children, ...props }) => {
	const accordionContentContext = React.useContext(AccordionContentContext);

	if (!accordionContentContext?.isInsideAccordion) {
		throw new Error('Accordion Content can only be used inside Accordion');
	}
	return (
		<div style={{ transition: 'transform 0.3s ease-in-out' }} className={cn('overflow-hidden', className)} {...props}>
			{children}
		</div>
	);
};
