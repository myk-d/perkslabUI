import React from 'react';
import { cn } from '../lib/cn';
import { ChevronLeftIcon, ChevronRightIcon } from '../lib/icons';
import { Button } from './Button';

export interface PeriodNavigatorProps {
	/** Already-formatted label, e.g. `month.format('MMMM YYYY')` or a week range — works for any period. */
	label: React.ReactNode;
	onPrev: () => void;
	onNext: () => void;
	/** Shows a "jump to today" button when provided. */
	onToday?: () => void;
	todayLabel?: string;
	prevLabel?: string;
	nextLabel?: string;
	className?: string;
}

/** Prev / label / next stepper for month, week or any other period (replaces the per-app MonthSwitcher / WeekNavigator). */
export const PeriodNavigator = ({ label, onPrev, onNext, onToday, todayLabel = 'Today', prevLabel = 'Previous', nextLabel = 'Next', className }: PeriodNavigatorProps) => {
	const arrow =
		'flex size-9 shrink-0 items-center justify-center rounded-item text-muted hover:bg-hover hover:text-page-text transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand';
	return (
		<div className={cn('inline-flex items-center gap-1 text-page-text', className)}>
			<button type="button" onClick={onPrev} aria-label={prevLabel} className={arrow}>
				<ChevronLeftIcon className="size-5" />
			</button>
			<span aria-live="polite" className="ui-heading min-w-36 text-center text-base sm:min-w-44 sm:text-lg">
				{label}
			</span>
			<button type="button" onClick={onNext} aria-label={nextLabel} className={arrow}>
				<ChevronRightIcon className="size-5" />
			</button>
			{onToday && (
				<Button size="sm" variant="outline" onClick={onToday} className="ms-2 normal-case font-normal">
					{todayLabel}
				</Button>
			)}
		</div>
	);
};
