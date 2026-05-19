import React from 'react';
import { cn } from '../utils';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'bg-page-bg border border-brand rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 w-80',
			className,
		)}
		{...props}
	>
		{children}
	</div>
);

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('flex flex-col gap-1', className)} {...props}>
		{children}
	</div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
	<h3 className={cn('text-lg font-black text-page-text uppercase tracking-tighter', className)} {...props}>
		{children}
	</h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
	<p className={cn('text-sm text-page-text/60 leading-relaxed', className)} {...props}>
		{children}
	</p>
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
	<div className={cn('-mx-6 -mt-6 mb-2 overflow-hidden rounded-t-2xl border-b border-brand', className)} {...props}>
		{children}
	</div>
);

export const CardImage = ({ className, src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
	<img src={src} alt={alt} className={cn('w-full h-48 object-cover transition-transform duration-500 hover:scale-105', className)} {...props} />
);

export const CardImagePlaceholder = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('w-full h-48 bg-page-bg animate-pulse', className)} {...props} />
);
