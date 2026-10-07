import React from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** `sm` tightens the padding and gaps (shadcn parity). */
	size?: 'default' | 'sm';
}

export const Card = ({ className, children, size = 'default', ...props }: CardProps) => (
	<div
		data-slot="card"
		data-size={size}
		className={cn(
			'group/card bg-surface text-page-text ui-border rounded-box flex w-full flex-col shadow-box transition-shadow duration-300',
			size === 'sm' ? 'gap-3 p-4 [--card-spacing:1rem]' : 'gap-4 p-6 [--card-spacing:1.5rem]',
			className,
		)}
		{...props}
	>
		{children}
	</div>
);

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div data-slot="card-header" className={cn('grid auto-rows-min items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto]', className)} {...props}>
		{children}
	</div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
	<h3 className={cn('ui-heading text-lg text-page-text', className)} {...props}>
		{children}
	</h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
	<p className={cn('text-sm text-page-text/60 leading-relaxed', className)} {...props}>
		{children}
	</p>
);

/** Top-end slot of the header (button, badge, menu). */
export const CardAction = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div data-slot="card-action" className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)} {...props} />
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('text-page-text', className)} {...props}>
		{children}
	</div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('mt-auto pt-2 flex gap-3 items-center', className)} {...props}>
		{children}
	</div>
);

export const CardImageContainer = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('-mx-(--card-spacing) -mt-(--card-spacing) mb-2 overflow-hidden rounded-t-box border-b border-line', className)} {...props}>
		{children}
	</div>
);

export const CardImage = ({ className, src, alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
	<img src={src} alt={alt} className={cn('w-full h-48 object-cover transition-transform duration-500 hover:scale-105', className)} {...props} />
);

export const CardImagePlaceholder = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div aria-hidden="true" className={cn('w-full h-48 bg-page-text/10 animate-pulse', className)} {...props} />
);
