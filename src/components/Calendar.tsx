import dayjs, { type Dayjs } from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../lib/icons';

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
	'appearance-none cursor-pointer rounded-item bg-subtle/70 ps-2.5 pe-6 py-1 text-xs font-semibold capitalize text-page-text outline-none transition-colors duration-150 hover:bg-hover focus-visible:ring-2 focus-visible:ring-brand [&>option]:bg-elevated [&>option]:text-page-text';

export const Calendar = ({ value, onSelect, weekStartsOn = 1, minDate, maxDate, captionLayout = 'label', fromYear, toYear, className }: CalendarProps) => {
	const [view, setView] = useState(() => (value ?? dayjs()).startOf('month'));
	const gridRef = useRef<HTMLDivElement>(null);
	const today = dayjs();

	// Sync visible month whenever an external `value` changes to a different month/year.
	const valueKey = value ? value.format('YYYY-MM') : '';
	useEffect(() => {
		if (!value) return;
		setView((prev) => (prev.year() === value.year() && prev.month() === value.month() ? prev : value.startOf('month')));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [valueKey]);

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

	const moveFocusByDays = (from: Dayjs, delta: number) => {
		const next = from.add(delta, 'day');
		if (next.month() !== view.month() || next.year() !== view.year()) {
			setView(next.startOf('month'));
		}
		const targetKey = next.format('YYYY-MM-DD');
		requestAnimationFrame(() => {
			gridRef.current?.querySelector<HTMLButtonElement>(`button[data-day="${targetKey}"]:not(:disabled)`)?.focus();
		});
	};

	return (
		<div className={cn('w-full select-none', className)}>
			<div className="mb-3 flex items-center justify-between gap-1">
				<button
					type="button"
					aria-label="Previous month"
					onClick={() => setView((v) => v.subtract(1, 'month'))}
					className="inline-flex size-8 items-center justify-center rounded-item text-muted hover:bg-hover hover:text-page-text transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
				>
					<ChevronLeftIcon className="size-4" />
				</button>
				{captionLayout === 'dropdown' ? (
					<div className="flex items-center gap-1.5">
						<span className="relative inline-flex items-center">
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
							<ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute end-1.5 size-3 text-muted" />
						</span>
						<span className="relative inline-flex items-center">
							<select aria-label="Year" value={view.year()} onChange={(e) => setView((v) => v.year(Number(e.target.value)))} className={cn(selectClass, 'tabular-nums')}>
								{years.map((y) => (
									<option key={y} value={y}>
										{y}
									</option>
								))}
							</select>
							<ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute end-1.5 size-3 text-muted" />
						</span>
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
					className="inline-flex size-8 items-center justify-center rounded-item text-muted hover:bg-hover hover:text-page-text transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
				>
					<ChevronRightIcon className="size-4" />
				</button>
			</div>

			<div className="grid grid-cols-7 mb-1">
				{weekdays.map((d, i) => (
					<div key={`${d}-${i}`} className="ui-label py-1 text-center text-[11px] text-muted">
						{d}
					</div>
				))}
			</div>

			<div ref={gridRef} className="grid grid-cols-7 gap-0.5">
				{cells.map((d) => {
					const dayKey = d.format('YYYY-MM-DD');
					const inMonth = d.month() === view.month();
					const selected = !!value && d.isSame(value, 'day');
					const isToday = d.isSame(today, 'day');
					return (
						<button
							type="button"
							key={dayKey}
							data-day={dayKey}
							disabled={isDisabled(d)}
							aria-pressed={selected}
							aria-current={isToday ? 'date' : undefined}
							onClick={() => onSelect(d)}
							onKeyDown={(e) => {
								if (e.key === 'ArrowLeft') { e.preventDefault(); moveFocusByDays(d, -1); }
								else if (e.key === 'ArrowRight') { e.preventDefault(); moveFocusByDays(d, 1); }
								else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocusByDays(d, -7); }
								else if (e.key === 'ArrowDown') { e.preventDefault(); moveFocusByDays(d, 7); }
								else if (e.key === 'PageUp') { e.preventDefault(); moveFocusByDays(d, -d.daysInMonth()); }
								else if (e.key === 'PageDown') { e.preventDefault(); moveFocusByDays(d, d.daysInMonth()); }
							}}
							className={cn(
								'relative mx-auto flex size-9 items-center justify-center rounded-item text-sm tabular-nums transition-[color,background-color,transform] duration-150 cursor-pointer outline-none',
								'focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-30 disabled:pointer-events-none active:scale-95',
								!inMonth && 'text-muted/50',
								inMonth && 'font-medium text-page-text',
								selected ? 'bg-brand text-brand-fg font-semibold shadow-box' : 'hover:bg-hover',
								isToday && !selected && 'font-semibold text-brand',
							)}
						>
							{d.date()}
							{isToday && (
								<span
									aria-hidden="true"
									className={cn('absolute bottom-1 size-1 rounded-full', selected ? 'bg-brand-fg' : 'bg-brand')}
								/>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
};
