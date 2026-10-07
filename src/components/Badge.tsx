import React from 'react';
import { cn } from '../lib/cn';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info';

const variants: Record<BadgeVariant, string> = {
	default: 'bg-brand text-brand-fg border-transparent',
	secondary: 'bg-brand-bg text-page-text border-transparent',
	outline: 'bg-transparent text-page-text border-line',
	success: 'bg-ok/12 text-ok border-ok/30',
	warning: 'bg-warning/12 text-warning border-warning/30',
	danger: 'bg-danger/12 text-danger border-danger/30',
	info: 'bg-info/12 text-info border-info/30',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
	<span className={cn('inline-flex items-center gap-1 rounded-item border px-2.5 py-0.5 text-xs ui-label whitespace-nowrap', variants[variant], className)} {...props} />
);
