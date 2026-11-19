import React from 'react';
import { cn } from '../lib/cn';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info';

const variants: Record<BadgeVariant, string> = {
	default: 'bg-brand text-brand-fg border-transparent',
	secondary: 'bg-subtle text-page-text border-transparent',
	outline: 'bg-surface text-page-text border-line',
	success: 'bg-ok/12 text-ok border-ok/25',
	warning: 'bg-warning/12 text-warning border-warning/25',
	danger: 'bg-danger/12 text-danger border-danger/25',
	info: 'bg-info/12 text-info border-info/25',
};

const dotColors: Record<BadgeVariant, string> = {
	default: 'bg-brand-fg',
	secondary: 'bg-muted',
	outline: 'bg-muted',
	success: 'bg-ok',
	warning: 'bg-warning',
	danger: 'bg-danger',
	info: 'bg-info',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	/** Renders a tiny leading status dot (FacilityFlow / GitHub style). */
	dot?: boolean;
}

export const Badge = ({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) => (
	<span className={cn('inline-flex items-center gap-1.5 rounded-control border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums', variants[variant], className)} {...props}>
		{dot && <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', dotColors[variant])} />}
		{children}
	</span>
);
