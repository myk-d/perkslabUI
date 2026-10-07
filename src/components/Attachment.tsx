import React, { createContext, forwardRef, useContext } from 'react';
import { cn } from '../lib/cn';
import { FileIcon } from '../lib/icons';
import { Slot } from '../lib/Slot';
import { Button, type ButtonProps } from './Button';

export type AttachmentState = 'idle' | 'uploading' | 'processing' | 'error' | 'done';
export type AttachmentSize = 'default' | 'sm' | 'xs';

interface Ctx {
	state: AttachmentState;
	size: AttachmentSize;
	vertical: boolean;
}
const AttachmentContext = createContext<Ctx>({ state: 'done', size: 'default', vertical: false });

const sizeClasses: Record<AttachmentSize, string> = {
	default: 'gap-3 p-2',
	sm: 'gap-2.5 p-1.5',
	xs: 'gap-2 p-1',
};

export interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
	state?: AttachmentState;
	size?: AttachmentSize;
	orientation?: 'horizontal' | 'vertical';
}

export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(({ className, state = 'done', size = 'default', orientation = 'horizontal', ...props }, ref) => {
	const vertical = orientation === 'vertical';
	return (
		<AttachmentContext.Provider value={{ state, size, vertical }}>
			<div
				ref={ref}
				data-slot="attachment"
				data-state={state}
				data-size={size}
				data-orientation={orientation}
				aria-busy={state === 'uploading' || state === 'processing' || undefined}
				className={cn(
					'relative flex min-w-0 items-center rounded-box bg-surface text-start text-page-text',
					state === 'error' ? 'border border-danger/50 bg-danger/5' : 'ui-border',
					sizeClasses[size],
					vertical ? 'w-44 flex-col items-stretch' : 'w-64 max-w-full pe-3',
					size === 'xs' && !vertical && 'pe-2',
					className,
				)}
				{...props}
			/>
		</AttachmentContext.Provider>
	);
});
Attachment.displayName = 'Attachment';

const mediaSizes: Record<AttachmentSize, string> = { default: 'size-10 [&>svg]:size-5', sm: 'size-8 [&>svg]:size-4', xs: 'size-6 [&>svg]:size-3.5' };

export interface AttachmentMediaProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: 'icon' | 'image';
}

export const AttachmentMedia = ({ className, variant = 'icon', children, ...props }: AttachmentMediaProps) => {
	const { state, size, vertical } = useContext(AttachmentContext);
	return (
		<div
			data-slot="attachment-media"
			data-variant={variant}
			className={cn(
				'flex shrink-0 items-center justify-center overflow-hidden rounded-item',
				mediaSizes[size],
				vertical && 'aspect-[4/3] h-auto w-full',
				variant === 'icon' && (state === 'error' ? 'bg-danger/12 text-danger' : 'bg-brand-bg text-brand'),
				variant === 'image' && 'bg-hover [&>img]:size-full [&>img]:object-cover',
				vertical && '[&>svg]:size-6',
				className,
			)}
			{...props}
		>
			{children ?? (variant === 'icon' ? <FileIcon /> : null)}
		</div>
	);
};

export const AttachmentContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div data-slot="attachment-content" className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)} {...props} />
);

export const AttachmentTitle = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
	const { state, size } = useContext(AttachmentContext);
	return (
		<p
			data-slot="attachment-title"
			className={cn(
				'truncate font-semibold',
				size === 'xs' ? 'text-xs' : 'text-sm',
				state === 'error' && 'text-danger',
				(state === 'uploading' || state === 'processing') && 'pk-shimmer',
				className,
			)}
			{...props}
		/>
	);
};

export const AttachmentDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
	const { state, size } = useContext(AttachmentContext);
	return (
		<p
			data-slot="attachment-description"
			className={cn(
				'truncate text-muted',
				size === 'default' ? 'text-sm' : 'text-xs',
				state === 'error' && 'text-danger/80',
				(state === 'uploading' || state === 'processing') && 'pk-shimmer',
				className,
			)}
			{...props}
		/>
	);
};

export const AttachmentActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const { vertical } = useContext(AttachmentContext);
	return (
		<div
			data-slot="attachment-actions"
			className={cn('relative z-10 flex shrink-0 items-center gap-1', vertical && 'absolute end-1.5 top-1.5 rounded-control bg-surface/80 backdrop-blur-sm', className)}
			{...props}
		/>
	);
};

export type AttachmentActionProps = Omit<ButtonProps, 'size' | 'aria-label'> & { 'aria-label': string };

export const AttachmentAction = forwardRef<HTMLButtonElement, AttachmentActionProps>(({ className, variant = 'ghost', type = 'button', ...props }, ref) => (
	<Button ref={ref} type={type} variant={variant} size="icon" data-slot="attachment-action" className={cn('size-7 text-muted hover:text-page-text [&_svg]:size-4', className)} {...props} />
));
AttachmentAction.displayName = 'AttachmentAction';

export interface AttachmentTriggerProps extends React.HTMLAttributes<HTMLElement> {
	/** Render the single child (e.g. an `<a href>`) as the overlay. Needs an accessible name either way. */
	asChild?: boolean;
	disabled?: boolean;
}

/** Full-card overlay making the whole attachment clickable; AttachmentActions stay clickable above it. */
export const AttachmentTrigger = forwardRef<HTMLButtonElement, AttachmentTriggerProps>(({ className, asChild, children, ...props }, ref) => {
	const classes = cn(
		'absolute inset-0 z-0 cursor-pointer rounded-[inherit] outline-none transition-colors hover:bg-hover/40',
		'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg',
		className,
	);
	if (asChild) return <Slot className={classes} data-slot="attachment-trigger" {...props}>{children}</Slot>;
	return <button ref={ref} type="button" data-slot="attachment-trigger" className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
});
AttachmentTrigger.displayName = 'AttachmentTrigger';

/** Horizontally scrollable, snapping row of attachments. */
export const AttachmentGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		role="group"
		data-slot="attachment-group"
		className={cn('flex w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1 pk-scrollbar [&>*]:shrink-0 [&>*]:snap-start', className)}
		{...props}
	/>
);
