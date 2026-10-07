import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { forwardRef, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { presenceAttrs, usePresence } from '../lib/presence';
import { cn } from '../lib/cn';
import { useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { CalendarIcon, CloseIcon } from '../lib/icons';
import { Calendar } from './Calendar';
import { fieldStyles } from './Input';

export interface DatePickerProps {
	value: Dayjs | null;
	onChange: (date: Dayjs | null) => void;
	/** dayjs format string for the trigger text. */
	dateFormat?: string;
	placeholder?: string;
	clearable?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	minDate?: Dayjs;
	maxDate?: Dayjs;
	weekStartsOn?: number;
	/** `dropdown` (default) shows month and year selects; `label` shows plain text with arrows only. */
	captionLayout?: 'label' | 'dropdown';
	fromYear?: number;
	toYear?: number;
	/** Shows "Today" / "Tomorrow" shortcut chips (pass the labels, or `false` to hide). */
	shortcuts?: { today: string; tomorrow: string } | false;
	className?: string;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
	({ value, onChange, dateFormat = 'DD.MM.YYYY', placeholder = 'Pick a date', clearable = true, disabled, invalid, minDate, maxDate, weekStartsOn, captionLayout = 'dropdown', fromYear, toYear, shortcuts = false, className }, ref) => {
		const [open, setOpen] = useState(false);
		const anchorRef = useRef<HTMLDivElement>(null);
		const popupRef = useRef<HTMLDivElement>(null);
		const { mounted, state } = usePresence(open);
		const style = useAnchoredPosition(anchorRef, popupRef, { open: mounted, gap: 6 });
		useClickOutside([anchorRef, popupRef], () => setOpen(false), open);
		useEscape(() => setOpen(false), open);

		const pick = (d: Dayjs) => {
			onChange(d);
			setOpen(false);
		};

		return (
			<div ref={anchorRef} className={cn('relative w-full', className)}>
				<button
					ref={ref}
					type="button"
					disabled={disabled}
					aria-haspopup="dialog"
					aria-expanded={open}
					aria-invalid={invalid || undefined}
					onClick={() => setOpen((v) => !v)}
					className={cn(fieldStyles, 'flex items-center justify-between gap-2 px-(--ui-field-px) py-(--ui-field-py) text-start cursor-pointer')}
				>
					<span className={cn('truncate', !value && 'text-muted', clearable && value && !disabled && 'me-7')}>{value ? value.format(dateFormat) : placeholder}</span>
					<CalendarIcon className="size-5 shrink-0 text-action" />
				</button>
				{clearable && value && !disabled && (
					<button
						type="button"
						aria-label="Clear date"
						onClick={() => onChange(null)}
						className="absolute end-11 top-1/2 -translate-y-1/2 rounded-item p-0.5 text-muted hover:text-page-text cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
					>
						<CloseIcon className="size-4" />
					</button>
				)}
				{mounted && (
					<Portal>
						<div data-pk-layer="" ref={popupRef} role="dialog" style={style} {...presenceAttrs(state)} className={cn('z-[200] w-80 overflow-y-auto ui-border border-line rounded-box bg-surface p-4 text-page-text shadow-pop', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none')}>
							{shortcuts && (
								<div className="mb-3 flex gap-2">
									{[
										{ label: shortcuts.today, date: dayjs() },
										{ label: shortcuts.tomorrow, date: dayjs().add(1, 'day') },
									].map((s) => (
										<button
											key={s.label}
											type="button"
											onClick={() => pick(s.date)}
											className="ui-label rounded-control bg-brand-bg px-3 py-1 text-xs text-page-text hover:bg-hover cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
										>
											{s.label}
										</button>
									))}
								</div>
							)}
							<Calendar value={value} onSelect={pick} minDate={minDate} maxDate={maxDate} weekStartsOn={weekStartsOn} captionLayout={captionLayout} fromYear={fromYear} toYear={toYear} />
						</div>
					</Portal>
				)}
			</div>
		);
	},
);
DatePicker.displayName = 'DatePicker';
