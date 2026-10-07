import React from 'react';
import { cn } from '../lib/cn';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
	icon?: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	/** Typically a <Button>. */
	action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action, className, ...props }: EmptyStateProps) => (
	<div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)} {...props}>
		{icon && <div className="text-4xl text-muted">{icon}</div>}
		<p className="ui-heading text-lg text-page-text">{title}</p>
		{description && <p className="max-w-sm text-sm text-muted">{description}</p>}
		{action && <div className="mt-2">{action}</div>}
	</div>
);
