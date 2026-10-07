import dayjs, { type Dayjs } from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import React, { useMemo, useState } from 'react';
import { cn } from '../lib/cn';
import { ChevronLeftIcon, ChevronRightIcon } from '../lib/icons';

dayjs.extend(localeData);

export interface CalendarProps {
	/** Selected day (or `null`). */
	value: Dayjs | null;
	onSelect: (date: Dayjs) => void;
	/** First weekday column: 0 = Sunday … 1 = Monday (default). Per-instance — dayjs' global locale is left alone. */
	weekStartsOn?: number;
	minDate?: Dayjs;
	maxDate?: Dayjs;
	/** `dropdown` shows month + year selects in the header (jump decades without clicking arrows); `label` shows plain text. */
	captionLayout?: 'label' | 'dropdown';
	/** Year range offered by the year select. Default: 100 years back, 20 ahead; always widened to include the visible/selected year. */
	fromYear?: number;
	toYear?: number;
	className?: string;
}

const selectClass =
	'cursor-pointer rounded-item bg-transparent px-1.5 py-1 text-sm font-semibold capitalize text-page-text outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand [&>option]:bg-surface [&>option]:text-page-text';

export const Calendar = ({ value, onSelect, weekStartsOn = 1, minDate, maxDate, captionLayout = 'label', fromYear, toYear, className }: CalendarProps) => {
	const [view, setView] = useState(() => (value ?? dayjs()).startOf('month'));
	const today = dayjs();

	const months = useMemo(() => dayjs.months(), []);
	const years = useMemo(() => {
		const lo = Math.min(minDate?.year() ?? fromYear ?? today.year() - 100, view.year());
		const hi = Math.max(maxDate?.year() ?? toYear ?? today.year() + 20, view.year());
		return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [minDate, maxDate, fromYear, toYear, view.year()]);

	const weekdays = useMemo(() => {
		const names = dayjs.weekdaysMin();
		return Array.from({ length: 7 }, (_, i) => names[(i + weekStartsOn) % 7]);
	}, [weekStartsOn]);

	const cells = useMemo(() => {
		const lead = (view.day() - weekStartsOn + 7) % 7;
		const start = view.subtract(lead, 'day');
		const total = Math.ceil((lead + view.daysInMonth()) / 7) * 7;
		return Array.from({ length: total }, (_, i) => start.add(i, 'day'));
	}, [view, weekStartsOn]);

	const isDisabled = (d: Dayjs) => (minDate && d.isBefore(minDate, 'day')) || (maxDate && d.isAfter(maxDate, 'day')) || false;

	return (
		<div className={cn('w-full select-none', className)}>
			<div className="mb-3 flex items-center justify-between">
				<button
					type="button"
					aria-label="Previous month"
					onClick={() => setView((v) => v.subtract(1, 'month'))}
					className="rounded-item p-1.5 text-muted hover:bg-hover hover:text-page-text transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
				>
					<ChevronLeftIcon className="size-4" />
				</button>
				{captionLayout === 'dropdown' ? (
					<div className="flex items-center gap-1.5">
						<select
							aria-label="Month"
							value={view.month()}
							onChange={(e) => setView((v) => v.month(Number(e.target.value)))}
							className={selectClass}
						>
							{months.map((m, i) => (
								<option key={m} value={i}>
									{m}
								</option>
							))}
						</select>
						<select aria-label="Year" value={view.year()} onChange={(e) => setView((v) => v.year(Number(e.target.value)))} className={selectClass}>
							{years.map((y) => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>
					</div>
				) : (
					<span aria-live="polite" className="ui-heading text-sm capitalize">
						{view.format('MMMM YYYY')}
					</span>
				)}
				<button
					type="button"
					aria-label="Next month"
					onClick={() => setView((v) => v.add(1, 'month'))}
					className="rounded-item p-1.5 text-muted hover:bg-hover hover:text-page-text transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
				>
					<ChevronRightIcon className="size-4" />
				</button>
			</div>

			<div className="grid grid-cols-7 mb-1">
				{weekdays.map((d) => (
					<div key={d} className="ui-label py-1 text-center text-[11px] text-muted">
						{d}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-1">
				{cells.map((d) => {
					const inMonth = d.month() === view.month();
					const selected = !!value && d.isSame(value, 'day');
					const isToday = d.isSame(today, 'day');
					return (
						<button
							type="button"
							key={d.format('YYYY-MM-DD')}
							disabled={isDisabled(d)}
							aria-pressed={selected}
							aria-current={isToday ? 'date' : undefined}
							onClick={() => onSelect(d)}
							className={cn(
								'mx-auto flex size-9 items-center justify-center rounded-item text-sm transition-colors cursor-pointer outline-none',
								'focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-30 disabled:pointer-events-none',
								!inMonth && 'text-page-text/30',
								inMonth && 'font-medium',
								selected ? 'bg-brand text-brand-fg' : 'hover:bg-hover',
								isToday && !selected && 'ui-border border-brand',
							)}
						>
							{d.date()}
						</button>
					);
				})}
			</div>
		</div>
	);
};
