import React from 'react';
import { cn } from '../lib/cn';
import { FlagIcon } from '../lib/icons';

export type Priority = 'high' | 'medium' | 'low' | 'none';

const order: Priority[] = ['high', 'medium', 'low', 'none'];
const colors: Record<Priority, string> = { high: 'text-danger', medium: 'text-warning', low: 'text-info', none: 'text-muted' };
const defaultLabels: Record<Priority, string> = { high: 'High priority', medium: 'Medium priority', low: 'Low priority', none: 'No priority' };

export interface PriorityPickerProps {
	value: Priority;
	onChange: (priority: Priority) => void;
	/** Override (e.g. translate) the tooltip / screen-reader labels. */
	labels?: Partial<Record<Priority, string>>;
	className?: string;
}

/** Row of four flag buttons (high / medium / low / none). */
export const PriorityPicker = ({ value, onChange, labels, className }: PriorityPickerProps) => (
	<div role="radiogroup" className={cn('flex gap-1', className)}>
		{order.map((p) => {
			const label = labels?.[p] ?? defaultLabels[p];
			return (
				<button
					key={p}
					type="button"
					role="radio"
					aria-checked={value === p}
					aria-label={label}
					title={label}
					onClick={() => onChange(p)}
					className={cn(
						'flex size-8 items-center justify-center rounded-control border transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand',
						value === p ? 'border-brand bg-brand-bg' : 'border-transparent hover:bg-hover',
					)}
				>
					<FlagIcon filled={p !== 'none'} className={cn('size-4', colors[p])} />
				</button>
			);
		})}
	</div>
);
