import React from 'react';
import { cn } from '../lib/cn';
import { AlertIcon, InfoIcon, SuccessIcon } from '../lib/icons';

export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';

const variants: Record<AlertVariant, string> = {
	default: 'border-line bg-surface text-page-text',
	info: 'border-info/30 bg-info/8 text-page-text [&_svg]:text-info',
	success: 'border-ok/30 bg-ok/8 text-page-text [&_svg]:text-ok',
	warning: 'border-warning/30 bg-warning/8 text-page-text [&_svg]:text-warning',
	danger: 'border-danger/30 bg-danger/8 text-page-text [&_svg]:text-danger',
};

const icons = { default: InfoIcon, info: InfoIcon, success: SuccessIcon, warning: AlertIcon, danger: AlertIcon };

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
	variant?: AlertVariant;
	title?: React.ReactNode;
	/** Pass `null` to hide the icon, or your own node. */
	icon?: React.ReactNode;
}

export const Alert = ({ className, variant = 'default', title, icon, children, ...props }: AlertProps) => {
	const Default = icons[variant];
	return (
		<div role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-box ui-border p-4 text-sm shadow-box', variants[variant], className)} {...props}>
			{icon === null ? null : <span className="mt-0.5 shrink-0 text-lg">{icon ?? <Default />}</span>}
			<div className="flex flex-col gap-1 min-w-0">
				{title && <p className="ui-heading text-sm">{title}</p>}
				{children && <div className="text-secondary leading-relaxed">{children}</div>}
			</div>
		</div>
	);
};
