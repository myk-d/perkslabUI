import React from 'react';
import { cn } from '../utils';


interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardImageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardImageProps extends React.HTMLAttributes<HTMLImageElement> {
	src: string;
	alt: string;
}

interface CardContextProps {
	isInsideCard: boolean;
}
interface CardHeaderContextProps {
	isInsideCardHeader: boolean;
}
interface CardImageContainerContextProps {
	isInsideCardImageContainer: boolean;
}

const CardContext = React.createContext<CardContextProps | undefined>(undefined);
const CardHeaderContext = React.createContext<CardHeaderContextProps | undefined>(undefined);
const CardImageContainerContext = React.createContext<CardImageContainerContextProps | undefined>(undefined);

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
	return (
		<CardContext.Provider value={{ isInsideCard: true }}>
			<div className={cn('bg-cyan-100 border-2 border-zinc-950 p-4 flex flex-col gap-3 rounded-lg w-80', className)} {...props}>
				{children}
			</div>
		</CardContext.Provider>
	);
};

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => {
	const cardContext = React.useContext(CardContext);

	if (!cardContext?.isInsideCard) {
		throw new Error('Card Header can only be used inside Card');
	}
	return (
		<CardHeaderContext.Provider value={{ isInsideCardHeader: true }}>
			<div className={cn('flex flex-col gap-3', className)} {...props}>
				{children}
			</div>
		</CardHeaderContext.Provider>
	);
};

export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => {
	const cardHeaderContext = React.useContext(CardHeaderContext);

	if (!cardHeaderContext?.isInsideCardHeader) {
		throw new Error('Card Title can only be used inside Card Header');
	}
	return (
		<h3 className={cn('font-bold text-2xl leading-none', className)} {...props}>
			{children}
		</h3>
	);
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children, ...props }) => {
	const cardHeaderContext = React.useContext(CardHeaderContext);

	if (!cardHeaderContext?.isInsideCardHeader) {
		throw new Error('Card Description can only be used inside Card Header');
	}
	return (
		<span className={cn(' text-base leading-none', className)} {...props}>
			{children}
		</span>
	);
};

export const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => {
	const cardContext = React.useContext(CardContext);

	if (!cardContext?.isInsideCard) {
		throw new Error('Card Content can only be used inside Card');
	}
	return (
		<div className={cn('flex', className)} {...props}>
			{children}
		</div>
	);
};

export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => {
	const cardContext = React.useContext(CardContext);

	if (!cardContext?.isInsideCard) {
		throw new Error('Card Footer can only be used inside Card');
	}
	return (
		<div className={cn('flex gap-3 items-center', className)} {...props}>
			{children}
		</div>
	);
};

export const CardImageContainer: React.FC<CardImageContainerProps> = ({ className, children, ...props }) => {
	const cardContext = React.useContext(CardContext);

	if (!cardContext?.isInsideCard) {
		throw new Error('Card Image Container can only be used inside Card');
	}
	return (
		<CardImageContainerContext.Provider value={{ isInsideCardImageContainer: true }}>
			<div className={cn('w-full h-full', className)} {...props}>
				{children}
			</div>
		</CardImageContainerContext.Provider>
	);
};

export const CardImage: React.FC<CardImageProps> = ({ className, children, src, alt, ...props }) => {
	const cardImageContainerContext = React.useContext(CardImageContainerContext);

	if (!cardImageContainerContext?.isInsideCardImageContainer) {
		throw new Error('Card Image can only be used inside Card Image Container');
	}
	return (
		<img src={src} alt={alt} className={cn('w-full h-full', className)} {...props}>
			{children}
		</img>
	);
};
