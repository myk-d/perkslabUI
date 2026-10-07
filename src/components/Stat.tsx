import React from 'react';
import { cn } from '../lib/cn';

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
	label: React.ReactNode;
	value: React.ReactNode;
	/** Small line under the value (e.g. "+12% vs last week"). */
	hint?: React.ReactNode;
}

/** A single KPI tile. Put several in a `<StatGroup>` for the joined-border dashboard row. */
export const Stat = ({ label, value, hint, className, ...props }: StatProps) => (
	<div className={cn('flex flex-col gap-1.5 bg-surface p-4 text-page-text', className)} {...props}>
		<span className="ui-label text-[11px] text-muted">{label}</span>
		<span className="ui-heading text-3xl leading-tight tabular-nums">{value}</span>
		{hint && <span className="text-xs text-muted">{hint}</span>}
	</div>
);

export const StatGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-px overflow-hidden ui-border rounded-box bg-line/40', className)} {...props} />
);
