import React from 'react';
import { cn } from '../utils';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ModalTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
	position?: 'left' | 'right';
}

interface ModalContextProps {
	expanded: boolean;
	toggleExpanded: () => void;
	modalContentRef?: React.RefObject<HTMLDivElement>;
}

const ModalContext = React.createContext<ModalContextProps | undefined>(undefined);

export const Modal: React.FC<ModalProps> = ({ className, children, ...props }) => {
	const [expanded, setExpanded] = React.useState(false);
	return (
		<div className={cn('', className)} {...props}>
			<ModalContext.Provider
				value={{
					expanded,
					toggleExpanded: () => {
						setExpanded((prev) => !prev);
					},
				}}>
				{children}
			</ModalContext.Provider>
		</div>
	);
};

export const ModalTrigger: React.FC<ModalTriggerProps> = ({ className, children, ...props }) => {
	const { toggleExpanded } = React.useContext(ModalContext) || {};

	return (
		<div className={cn('w-fit flex items-center justify-between cursor-pointer', className)} onClick={toggleExpanded} {...props}>
			{children}
		</div>
	);
};

export const ModalCloseButton: React.FC<ModalTriggerProps> = ({ className, children, ...props }) => {
	const { toggleExpanded, expanded } = React.useContext(ModalContext) || {};

	return (
		<div
			className={cn(
				'w-fit flex items-center justify-between cursor-pointer',
				expanded ? `visible opacity-100 w-fit` : ' invisible opacity-0 w-0',
				className
			)}
			onClick={toggleExpanded}
			{...props}>
			{children}
		</div>
	);
};

export const ModalActionButton: React.FC<ModalTriggerProps> = ({ className, children, onClick, ...props }) => {
	const { toggleExpanded, expanded } = React.useContext(ModalContext) || {};

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (onClick) {
			onClick(event);
		}
		if (toggleExpanded) {
			toggleExpanded();
		}
	};

	return (
		<div
			className={cn(
				'w-fit flex items-center justify-between cursor-pointer',
				expanded ? `visible opacity-100 w-fit` : ' invisible opacity-0 w-0',
				className
			)}
			onClick={handleClick}
			{...props}>
			{children}
		</div>
	);
};

export const ModalContent: React.FC<ModalContentProps> = ({ className, children, position, ...props }) => {
	const { expanded } = React.useContext(ModalContext) || {};

	return (
		<>
			{expanded && (
				<div className="w-screen fixed inset-0 bg-gray-100 bg-opacity-20 backdrop-blur z-10  flex items-center justify-center">
					<div
						className={cn(
							`absolute flex flex-col animate-in fade-in-0 transition-all duration-300 z-[9999] border bg-slate-50 border-zinc-950`,
							className
						)}
						{...props}>
						{expanded ? children : null}
					</div>
				</div>
			)}
		</>
	);
};
