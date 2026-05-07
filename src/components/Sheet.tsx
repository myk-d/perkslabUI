import React from 'react';
import { cn } from '../utils';

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SheetTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
	position?: 'left' | 'right';
}

interface SheetContextProps {
	expanded: boolean;
	toggleExpanded: () => void;
	sheetContentRef?: React.RefObject<HTMLDivElement>;
}

interface SheetContentContextProps {
	isInsideSheetContent: boolean;
}

const SheetContext = React.createContext<SheetContextProps | undefined>(undefined);
const SheetContentContext = React.createContext<SheetContentContextProps | undefined>(undefined);

export const Sheet: React.FC<SheetProps> = ({ className, children, ...props }) => {
	const [expanded, setExpanded] = React.useState(false);
	return (
		<div className={cn('', className)} {...props}>
			<SheetContext.Provider
				value={{
					expanded,
					toggleExpanded: () => {
						setExpanded((prev) => !prev);
					},
				}}>
				{children}
			</SheetContext.Provider>
		</div>
	);
};

export const SheetTrigger: React.FC<SheetTriggerProps> = ({ className, children, ...props }) => {
	const { toggleExpanded } = React.useContext(SheetContext) || {};

	return (
		<button
			className={cn('w-fit flex items-center justify-between cursor-pointer', className)}
			onClick={toggleExpanded}
			{...props}>
			{children}
		</button>
	);
};

export const SheetCloseButton: React.FC<SheetTriggerProps> = ({ className, children, ...props }) => {
	const { toggleExpanded, expanded } = React.useContext(SheetContext) || {};
	const sheetContentContext = React.useContext(SheetContentContext);

	if (!sheetContentContext?.isInsideSheetContent) {
		throw new Error('Sheet Close Button can only be used inside Sheet Content');
	}

	return (
		<button
			className={cn(
				'w-fit flex items-center justify-between cursor-pointer',
				expanded ? `visible opacity-100 w-fit` : ' invisible opacity-0 w-0',
				className
			)}
			onClick={toggleExpanded}
			{...props}>
			{children}
		</button>
	);
};

export const SheetActionButton: React.FC<SheetTriggerProps> = ({ className, children, onClick, ...props }) => {
	const { toggleExpanded, expanded } = React.useContext(SheetContext) || {};
	const sheetContentContext = React.useContext(SheetContentContext);

	if (!sheetContentContext?.isInsideSheetContent) {
		throw new Error('Sheet Action Button can only be used inside Sheet Content');
	}

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		onClick?.(event);
		toggleExpanded?.();
	};

	return (
		<button
			className={cn(
				'w-fit flex items-center justify-between cursor-pointer',
				expanded ? `visible opacity-100 w-fit` : ' invisible opacity-0 w-0',
				className
			)}
			onClick={handleClick}
			{...props}>
			{children}
		</button>
	);
};

export const SheetContent: React.FC<SheetContentProps> = ({ className, children, position, ...props }) => {
	const { expanded, toggleExpanded } = React.useContext(SheetContext) || {};

	const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) toggleExpanded?.();
	};

	return (
		<SheetContentContext.Provider value={{ isInsideSheetContent: true }}>
			<div
				className={cn(
					expanded ? 'w-screen fixed inset-0 bg-gray-100 bg-opacity-20 backdrop-blur z-10  flex items-center justify-center' : ''
				)}
				onClick={handleBackgroundClick}>
				<div
					className={cn(
						`absolute top-0 animate-in fade-in-0 transition-all duration-300 z-[9999]  bg-slate-50 border-zinc-950`,
						expanded
							? `flex flex-col opacity-100 w-80 h-screen p-2 ${position === 'right' ? 'translate-x-0' : '-translate-x-0'}`
							: `${position === 'right' ? 'translate-x-full' : '-translate-x-full'} opacity-0 mt-0 w-0 h-0 p-0`,
						position === 'right' ? 'right-0 border-l' : 'left-0 border-r',
						className
					)}
					{...props}>
					{expanded ? children : null}
				</div>
			</div>
		</SheetContentContext.Provider>
	);
};
