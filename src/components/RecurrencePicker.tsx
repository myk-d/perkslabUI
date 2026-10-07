import dayjs from 'dayjs';
import React, { useState } from 'react';
import { cn } from '../lib/cn';
import { CloseIcon, RepeatIcon } from '../lib/icons';
import { DatePicker } from './DatePicker';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
	freq: RecurrenceFreq;
	interval: number;
	/** 0 = Sunday … 6 = Saturday; only used for weekly rules. */
	byWeekday: number[] | null;
	/** 'YYYY-MM-DD' */
	endDate: string | null;
	count: number | null;
}

export interface RecurrenceLabels {
	none: string;
	freq: Record<RecurrenceFreq, string>;
	/** Unit shown after "every N" — e.g. day(s). */
	unit: Record<RecurrenceFreq, string>;
	every: string;
	ends: string;
	endsNever: string;
	endsOnDate: string;
	endsAfter: string;
	times: string;
	/** Weekday initials Monday → Sunday. */
	weekdays: [string, string, string, string, string, string, string];
}

const defaultLabels: RecurrenceLabels = {
	none: 'Does not repeat',
	freq: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' },
	unit: { daily: 'day(s)', weekly: 'week(s)', monthly: 'month(s)', yearly: 'year(s)' },
	every: 'Every',
	ends: 'Ends',
	endsNever: 'Never',
	endsOnDate: 'On date',
	endsAfter: 'After',
	times: 'times',
	weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
};

const freqs: RecurrenceFreq[] = ['daily', 'weekly', 'monthly', 'yearly'];
const weekdayOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday-first, as JS day numbers

type EndMode = 'never' | 'onDate' | 'afterCount';
const endModeOf = (r: RecurrenceRule): EndMode => (r.count ? 'afterCount' : r.endDate ? 'onDate' : 'never');

const pill = (active: boolean) =>
	cn('ui-label cursor-pointer rounded-control px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand', active ? 'bg-brand text-brand-fg' : 'bg-brand-bg text-page-text hover:bg-hover');

const numberInput = 'w-14 rounded-field ui-border border-line bg-control px-1.5 py-1 text-xs outline-none focus:border-brand';

export interface RecurrencePickerProps {
	value: RecurrenceRule | null;
	/** The date the rule is anchored to ('YYYY-MM-DD'). The control is hidden until there is one. */
	anchorDate: string | null;
	onChange: (rule: RecurrenceRule | null) => void;
	labels?: Partial<RecurrenceLabels>;
	className?: string;
}

export const RecurrencePicker = ({ value, anchorDate, onChange, labels, className }: RecurrencePickerProps) => {
	const l = { ...defaultLabels, ...labels };
	const [open, setOpen] = useState(false);

	if (!anchorDate) return null;

	const summary = value ? (value.interval === 1 ? l.freq[value.freq] : `${l.every} ${value.interval} ${l.unit[value.freq]}`) : l.none;
	const patch = (p: Partial<RecurrenceRule>) => value && onChange({ ...value, ...p });
	const anchorDay = dayjs(anchorDate).day();
	const selectedDays = value?.byWeekday?.length ? value.byWeekday : [anchorDay];

	const toggleDay = (day: number) => {
		const next = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day];
		patch({ byWeekday: next.length ? next : [anchorDay] });
	};
	const setEndMode = (mode: EndMode) => {
		if (mode === 'never') patch({ endDate: null, count: null });
		if (mode === 'onDate') patch({ endDate: anchorDate, count: null });
		if (mode === 'afterCount') patch({ endDate: null, count: 5 });
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className={className}>
				<button
					type="button"
					className={cn(
						'flex cursor-pointer items-center gap-1.5 rounded-control px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand',
						value ? 'bg-brand-bg text-page-text hover:bg-hover' : 'bg-hover text-muted hover:text-page-text',
					)}
				>
					<RepeatIcon className="size-3.5" />
					{summary}
					{value && (
						<span
							role="button"
							aria-label="Clear recurrence"
							onClick={(e) => {
								e.stopPropagation();
								onChange(null);
							}}
							className="rounded-full p-0.5 hover:bg-page-text/10"
						>
							<CloseIcon className="size-3" />
						</span>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-72 p-3 text-sm">
				<div className="mb-2 flex flex-wrap gap-1.5">
					<button type="button" onClick={() => onChange(null)} className={pill(!value)}>
						{l.none}
					</button>
					{freqs.map((f) => (
						<button key={f} type="button" onClick={() => onChange({ freq: f, interval: 1, byWeekday: null, endDate: null, count: null })} className={pill(value?.freq === f)}>
							{l.freq[f]}
						</button>
					))}
				</div>

				{value && (
					<>
						<div className="mb-2 flex items-center gap-1.5 text-xs text-muted">
							{l.every}
							<input
								type="number"
								min={1}
								aria-label={l.every}
								value={value.interval}
								onChange={(e) => patch({ interval: Math.max(1, Number(e.target.value) || 1) })}
								className={numberInput}
							/>
							{l.unit[value.freq]}
						</div>

						{value.freq === 'weekly' && (
							<div className="mb-3 flex gap-1">
								{weekdayOrder.map((day, i) => (
									<button
										key={day}
										type="button"
										aria-pressed={selectedDays.includes(day)}
										onClick={() => toggleDay(day)}
										className={cn(
											'flex size-7 cursor-pointer items-center justify-center rounded-full text-[11px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand',
											selectedDays.includes(day) ? 'bg-brand text-brand-fg' : 'bg-brand-bg hover:bg-hover',
										)}
									>
										{l.weekdays[i]}
									</button>
								))}
							</div>
						)}

						<div className="border-t border-line/30 pt-2">
							<div className="ui-label mb-1.5 text-[11px] text-muted">{l.ends}</div>
							<div className="flex flex-col gap-1.5 text-xs">
								<label className="flex items-center gap-2">
									<input type="radio" className="accent-brand" checked={endModeOf(value) === 'never'} onChange={() => setEndMode('never')} />
									{l.endsNever}
								</label>
								<div className="flex flex-col gap-1">
									<label className="flex items-center gap-2">
										<input type="radio" className="accent-brand" checked={endModeOf(value) === 'onDate'} onChange={() => setEndMode('onDate')} />
										{l.endsOnDate}
									</label>
									{endModeOf(value) === 'onDate' && (
										<DatePicker
											clearable={false}
											value={value.endDate ? dayjs(value.endDate) : null}
											minDate={dayjs(anchorDate)}
											onChange={(d) => patch({ endDate: d ? d.format('YYYY-MM-DD') : anchorDate })}
										/>
									)}
								</div>
								<label className="flex items-center gap-2">
									<input type="radio" className="accent-brand" checked={endModeOf(value) === 'afterCount'} onChange={() => setEndMode('afterCount')} />
									{l.endsAfter}
									{endModeOf(value) === 'afterCount' && (
										<>
											<input
												type="number"
												min={1}
												value={value.count ?? 5}
												onChange={(e) => patch({ count: Math.max(1, Number(e.target.value) || 1) })}
												className={numberInput}
											/>
											{l.times}
										</>
									)}
								</label>
							</div>
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
};
