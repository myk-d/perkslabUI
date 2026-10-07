import React, { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { Slot } from '../lib/Slot';

export type BubbleVariant = 'default' | 'secondary' | 'muted' | 'tinted' | 'outline' | 'ghost' | 'destructive';
export type BubbleAlign = 'start' | 'end';

const variants: Record<BubbleVariant, string> = {
	default: 'bg-brand text-brand-fg',
	secondary: 'bg-brand-bg text-page-text',
	muted: 'bg-hover text-muted',
	tinted: 'bg-brand/12 text-page-text',
	outline: 'ui-border bg-transparent text-page-text',
	ghost: 'w-full max-w-full bg-transparent text-page-text',
	destructive: 'border border-danger/30 bg-danger/12 text-danger',
};

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: BubbleVariant;
	align?: BubbleAlign;
}

export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(({ className, variant = 'default', align = 'start', ...props }, ref) => (
	<div
		ref={ref}
		data-slot="bubble"
		data-variant={variant}
		data-align={align}
		className={cn(
			'group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col rounded-box text-sm leading-relaxed',
			align === 'end' ? 'ms-auto self-end' : 'me-auto self-start',
			'has-data-[side=bottom]:mb-3 has-data-[side=top]:mt-3',
			variants[variant],
			className,
		)}
		{...props}
	/>
));
Bubble.displayName = 'Bubble';

export interface BubbleContentProps extends React.HTMLAttributes<HTMLElement> {
	/** Render the single child (a link or button) as the content. */
	asChild?: boolean;
}

export const BubbleContent = forwardRef<HTMLElement, BubbleContentProps>(({ className, asChild, children, ...props }, ref) => {
	const classes = cn(
		'block min-w-0 rounded-[inherit] px-3.5 py-2 text-start break-words whitespace-pre-wrap outline-none group-data-[variant=ghost]/bubble:px-0',
		'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg',
		asChild && 'cursor-pointer underline-offset-4 hover:underline',
		className,
	);
	if (asChild) return <Slot className={classes} {...props}>{children}</Slot>;
	return <div ref={ref as React.Ref<HTMLDivElement>} data-slot="bubble-content" className={classes} {...props}>{children}</div>;
});
BubbleContent.displayName = 'BubbleContent';

export interface BubbleReactionsProps extends React.HTMLAttributes<HTMLDivElement> {
	side?: 'top' | 'bottom';
	align?: 'start' | 'end';
}

/** Small overlapped chips anchored on the bubble edge. Children are styled as chips automatically. */
export const BubbleReactions = ({ className, side = 'bottom', align = 'end', ...props }: BubbleReactionsProps) => (
	<div
		data-slot="bubble-reactions"
		data-side={side}
		data-align={align}
		className={cn(
			'absolute z-10 flex items-center',
			side === 'bottom' ? 'top-full -translate-y-1/2' : 'bottom-full translate-y-1/2',
			align === 'end' ? 'end-2' : 'start-2',
			'[&>*]:inline-flex [&>*]:items-center [&>*]:gap-1 [&>*]:rounded-item [&>*]:bg-surface [&>*]:ui-border [&>*]:px-1.5 [&>*]:text-xs [&>*]:leading-5 [&>*]:text-page-text [&>*:not(:first-child)]:-ms-1',
			className,
		)}
		{...props}
	/>
);

export interface BubbleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	align?: BubbleAlign;
}

/** Consecutive bubbles from one sender: tighter gap, only the first/last keep the full radius on the aligned side. */
export const BubbleGroup = ({ className, align = 'start', ...props }: BubbleGroupProps) => (
	<div
		role="group"
		data-slot="bubble-group"
		data-align={align}
		className={cn(
			'flex w-full flex-col gap-0.5',
			align === 'end'
				? 'items-end [&>[data-slot=bubble]:not(:first-child)]:rounded-se-item [&>[data-slot=bubble]:not(:last-child)]:rounded-ee-item'
				: 'items-start [&>[data-slot=bubble]:not(:first-child)]:rounded-ss-item [&>[data-slot=bubble]:not(:last-child)]:rounded-es-item',
			className,
		)}
		{...props}
	/>
);
