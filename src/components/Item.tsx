import React from 'react';
import { cn } from '../lib/cn';

/** Generic list row: media (icon/avatar) · title + description · actions. */
export const ItemGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div role="list" className={cn('flex flex-col', className)} {...props} />;

export const Item = ({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' | 'muted' }) => (
	<div
		role="listitem"
		className={cn(
			'flex items-center gap-4 rounded-box p-4 text-page-text transition-colors',
			variant === 'outline' && 'ui-border',
			variant === 'muted' && 'bg-hover',
			variant === 'default' && 'hover:bg-hover',
			className,
		)}
		{...props}
	/>
);
export const ItemMedia = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-item bg-brand-bg text-brand [&>svg]:size-5', className)} {...props} />;
export const ItemContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)} {...props} />;
export const ItemTitle = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn('truncate text-sm font-semibold', className)} {...props} />;
export const ItemDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn('line-clamp-2 text-sm text-muted', className)} {...props} />;
export const ItemActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex shrink-0 items-center gap-2', className)} {...props} />;
