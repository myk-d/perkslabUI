import React from 'react';
import { cn } from '../lib/cn';
import { Slot } from '../lib/Slot';

export type MarkerVariant = 'default' | 'border' | 'separator';

const variants: Record<MarkerVariant, string> = {
	default: '',
	border: 'ui-border border-x-0 border-t-0 pb-2',
	separator: 'justify-center before:h-(--ui-border-w) before:flex-1 before:bg-line/60 after:h-(--ui-border-w) after:flex-1 after:bg-line/60',
};

export interface MarkerProps extends React.HTMLAttributes<HTMLElement> {
	variant?: MarkerVariant;
	/** Render the single child (a link or button) as the marker. */
	asChild?: boolean;
}

/** Inline status / system note in a conversation ("Today", "Assistant is thinking…"). */
export const Marker = ({ className, variant = 'default', asChild, children, ...props }: MarkerProps) => {
	const classes = cn(
		'flex w-full items-center gap-2 text-xs text-muted outline-none',
		variants[variant],
		asChild && 'cursor-pointer hover:text-page-text focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg',
		className,
	);
	if (asChild) return <Slot className={classes} data-slot="marker" data-variant={variant} {...props}>{children}</Slot>;
	return <div data-slot="marker" data-variant={variant} className={classes} {...props}>{children}</div>;
};

/** Decorative icon — hidden from assistive tech. */
export const MarkerIcon = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
	<span aria-hidden="true" data-slot="marker-icon" className={cn('inline-flex shrink-0 items-center [&>svg]:size-4', className)} {...props} />
);

export interface MarkerContentProps extends React.HTMLAttributes<HTMLSpanElement> {
	/** Animated shimmer, for streaming / in-progress text. Respects prefers-reduced-motion. */
	shimmer?: boolean;
}

export const MarkerContent = ({ className, shimmer, ...props }: MarkerContentProps) => (
	<span data-slot="marker-content" className={cn('ui-label', shimmer && 'pk-shimmer', className)} {...props} />
);
