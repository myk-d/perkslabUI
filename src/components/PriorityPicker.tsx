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

/** Row of four flag buttons (high / medium / low / none) with a smooth sliding selection pill. */
export const PriorityPicker = ({ value, onChange, labels, className }: PriorityPickerProps) => {
	const activeIndex = Math.max(0, order.indexOf(value));
	return (
		<div role="radiogroup" className={cn('relative inline-flex gap-1 rounded-control bg-subtle p-1 ui-border border-line-subtle', className)}>
			<span
				aria-hidden="true"
				style={{ transform: `translate3d(calc(${activeIndex} * (2rem + 0.25rem)), 0, 0)` }}
				className="pointer-events-none absolute top-1 start-1 size-8 rounded-control bg-surface shadow-box ring-1 ring-line transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
			/>
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
							'relative z-10 flex size-8 items-center justify-center rounded-control transition-[color,transform] duration-150 active:scale-90 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand',
							value !== p && 'hover:bg-hover/60',
						)}
					>
						<FlagIcon filled={p !== 'none'} className={cn('size-4 transition-transform duration-150', colors[p], value === p && 'scale-105')} />
					</button>
				);
			})}
		</div>
	);
};
