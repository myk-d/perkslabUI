import React, { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { SpinnerIcon } from '../lib/icons';
import { Slot } from '../lib/Slot';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'destructive' | 'success' | 'warning' | 'info' | 'disabled';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'default' | 'lg' | 'full' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

const base =
	'cursor-pointer inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap select-none transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 [&_[data-icon=inline-start]]:-ms-1 [&_[data-icon=inline-end]]:-me-1';

const variants: Record<ButtonVariant, string> = {
	default: 'bg-brand text-brand-fg hover:bg-brand-hover shadow-box rounded-control',
	secondary: 'bg-brand-bg text-page-text hover:bg-brand-bg/70 rounded-control',
	outline: 'ui-border bg-transparent text-action hover:bg-hover rounded-control',
	ghost: 'bg-transparent text-action hover:bg-hover rounded-control',
	link: 'bg-transparent text-action underline-offset-4 hover:underline p-0! rounded-item',

	danger: 'bg-danger text-page-bg hover:bg-danger/85 rounded-control',
	/** shadcn's name for `danger`. */
	destructive: 'bg-danger text-page-bg hover:bg-danger/85 rounded-control',
	success: 'bg-ok text-page-bg hover:bg-ok/85 rounded-control',
	warning: 'bg-warning text-page-bg hover:bg-warning/85 rounded-control',
	info: 'bg-info text-page-bg hover:bg-info/85 rounded-control',

	/** @deprecated use the `disabled` prop. Kept so existing code keeps its look. */
	disabled: 'bg-muted/40 text-page-bg cursor-not-allowed rounded-control',
};

const sizes: Record<ButtonSize, string> = {
	xs: 'px-2.5 py-1 text-xs',
	sm: 'px-4 py-2 text-sm',
	md: 'px-(--ui-btn-px) py-(--ui-btn-py) text-(length:--ui-btn-text)',
	/** shadcn's name for `md`. */
	default: 'px-(--ui-btn-px) py-(--ui-btn-py) text-(length:--ui-btn-text)',
	lg: 'px-8 py-4 text-lg',
	full: 'w-full py-3.5 text-base',
	icon: 'size-10 p-0',
	'icon-xs': 'size-6 p-0',
	'icon-sm': 'size-8 p-0',
	'icon-lg': 'size-12 p-0',
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
				<Slot className={classes} aria-busy={isLoading || undefined} {...props}>
					{children}
				</Slot>
			);
		}

		return (
			<button ref={ref} className={classes} disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...props}>
				{isLoading && <SpinnerIcon className="animate-spin size-5 shrink-0" />}
				{children}
			</button>
		);
	},
);

Button.displayName = 'Button';

export default Button;
