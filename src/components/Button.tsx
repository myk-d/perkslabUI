import React, { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { SpinnerIcon } from '../lib/icons';
import { Slot } from '../lib/Slot';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'destructive' | 'success' | 'warning' | 'info' | 'disabled';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'default' | 'lg' | 'full' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

const base =
	'cursor-pointer inline-flex items-center justify-center gap-2 font-[var(--ui-btn-weight)] whitespace-nowrap select-none transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 [&_[data-icon=inline-start]]:-ms-1 [&_[data-icon=inline-end]]:-me-1';

const variants: Record<ButtonVariant, string> = {
	default: 'bg-brand text-brand-fg hover:bg-brand-hover shadow-[inset_0_1px_0_rgb(255_255_255/0.14),var(--ui-shadow-box)] rounded-control',
	secondary: 'bg-subtle text-page-text hover:bg-hover rounded-control',
	outline: 'ui-border border-line bg-surface text-page-text shadow-box hover:border-line-strong hover:bg-hover rounded-control',
	ghost: 'bg-transparent text-action hover:bg-hover rounded-control',
	link: 'bg-transparent text-brand underline-offset-4 hover:underline p-0! h-auto! rounded-item',

	danger: 'bg-danger text-danger-fg hover:bg-danger/90 shadow-box rounded-control',
	/** shadcn's name for `danger`. */
	destructive: 'bg-danger text-danger-fg hover:bg-danger/90 shadow-box rounded-control',
	success: 'bg-ok text-ok-fg hover:bg-ok/90 shadow-box rounded-control',
	warning: 'bg-warning text-warning-fg hover:bg-warning/90 shadow-box rounded-control',
	info: 'bg-info text-info-fg hover:bg-info/90 shadow-box rounded-control',

	/** @deprecated use the `disabled` prop. Kept so existing code keeps its look. */
	disabled: 'bg-subtle text-muted cursor-not-allowed rounded-control',
};

const sizes: Record<ButtonSize, string> = {
	xs: 'h-7 px-2.5 text-xs',
	sm: 'h-(--ui-h-sm) px-3 text-xs',
	md: 'h-(--ui-h-md) px-(--ui-btn-px) text-(length:--ui-btn-text)',
	/** shadcn's name for `md`. */
	default: 'h-(--ui-h-md) px-(--ui-btn-px) text-(length:--ui-btn-text)',
	lg: 'h-(--ui-h-lg) px-6 text-base',
	full: 'w-full h-(--ui-h-lg) px-5 text-base',
	icon: 'size-(--ui-h-md) p-0',
	'icon-xs': 'size-6 p-0',
	'icon-sm': 'size-(--ui-h-sm) p-0',
	'icon-lg': 'size-(--ui-h-lg) p-0',
};

/** Class names of a Button — use it to style an `<a>` / router `<Link>` as a button (or use `<Button asChild>`). */
export function buttonVariants({ variant = 'default', size = 'md', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
	return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	/** Render the single child (e.g. `<Link>`) with the button styles instead of a `<button>`. */
	asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'default', size = 'md', isLoading, disabled, asChild, children, ...props }, ref) => {
		const classes = buttonVariants({ variant, size, className });

		if (asChild) {
			return (
				<Slot data-slot="button" className={classes} aria-busy={isLoading || undefined} {...props}>
					{children}
				</Slot>
			);
		}

		return (
			<button ref={ref} data-slot="button" className={classes} disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...props}>
				{isLoading && <SpinnerIcon className="animate-spin size-4 shrink-0" />}
				{children}
			</button>
		);
	},
);

Button.displayName = 'Button';

export default Button;
