import type { Dayjs } from 'dayjs';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { presenceAttrs, usePresence } from '../lib/presence';
import { cn } from '../lib/cn';
import { useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { CalendarIcon } from '../lib/icons';
import { Calendar } from './Calendar';
import { fieldStyles } from './Input';

export interface DateTimePickerProps {
	value: Dayjs;
	onChange: (date: Dayjs) => void;
	dateFormat?: string;
	/** Fired when the popup closes (outside click / Escape / trigger). */
	onBlur?: () => void;
	disabled?: boolean;
	invalid?: boolean;
	minDate?: Dayjs;
	maxDate?: Dayjs;
	weekStartsOn?: number;
	/** `dropdown` (default) shows month and year selects; `label` shows plain text with arrows only. */
	captionLayout?: 'label' | 'dropdown';
	fromYear?: number;
	toYear?: number;
	hoursLabel?: string;
	minutesLabel?: string;
	className?: string;
}

const clamp = (n: number, max: number) => Math.min(max, Math.max(0, Number.isFinite(n) ? n : 0));

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
	({ value, onChange, dateFormat = 'DD.MM.YYYY - HH:mm', onBlur, disabled, invalid, minDate, maxDate, weekStartsOn, captionLayout = 'dropdown', fromYear, toYear, hoursLabel = 'Hours', minutesLabel = 'Minutes', className }, ref) => {
		const [open, setOpen] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);
		const popupRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => containerRef.current!);

		// The popup is portalled with fixed positioning: it flips above the trigger near the bottom of the
		// screen and is never clipped by a modal's overflow — no page scroll, no consumer CSS workarounds.
		const { mounted, state } = usePresence(open);
		const style = useAnchoredPosition(containerRef, popupRef, { open: mounted, gap: 8 });

		const close = () => {
			if (!open) return;
			setOpen(false);
			onBlur?.();
		};
		useClickOutside([containerRef, popupRef], close, open);
		useEscape(close, open);

		const selectDay = (d: Dayjs) => onChange(value.year(d.year()).month(d.month()).date(d.date()));

		return (
			<div ref={containerRef} className={cn('relative w-full', className)}>
				<button
					type="button"
					disabled={disabled}
					aria-haspopup="dialog"
					aria-expanded={open}
					aria-invalid={invalid || undefined}
					onClick={() => (open ? close() : setOpen(true))}
					className={cn(fieldStyles, 'flex items-center justify-between gap-2 px-(--ui-field-px) py-(--ui-field-py) text-left cursor-pointer')}
				>
					<span className="truncate">{value.format(dateFormat)}</span>
					<CalendarIcon className="size-5 shrink-0 text-action" />
				</button>

				{mounted && (
					<Portal>
						<div data-pk-layer="" ref={popupRef} role="dialog" style={style} {...presenceAttrs(state)} className={cn('z-[200] w-80 overflow-y-auto ui-border border-line rounded-box bg-surface p-4 text-page-text shadow-pop', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none')}>
							<Calendar value={value} onSelect={selectDay} minDate={minDate} maxDate={maxDate} weekStartsOn={weekStartsOn} captionLayout={captionLayout} fromYear={fromYear} toYear={toYear} />
							<div className="mt-4 flex items-center justify-center gap-3 border-t border-line/30 pt-4">
								<label className="text-center">
									<span className="ui-label mb-1 block text-[10px] text-muted">{hoursLabel}</span>
									<input
										type="number"
										min={0}
										max={23}
										value={value.hour()}
										onChange={(e) => onChange(value.hour(clamp(parseInt(e.target.value, 10), 23)))}
										className="w-16 rounded-field ui-border border-line bg-control p-2 text-center font-mono text-sm outline-none focus:border-brand"
									/>
								</label>
								<span className="mt-4 text-xl font-bold text-muted">:</span>
								<label className="text-center">
									<span className="ui-label mb-1 block text-[10px] text-muted">{minutesLabel}</span>
									<input
										type="number"
										min={0}
										max={59}
										value={value.minute()}
										onChange={(e) => onChange(value.minute(clamp(parseInt(e.target.value, 10), 59)))}
										className="w-16 rounded-field ui-border border-line bg-control p-2 text-center font-mono text-sm outline-none focus:border-brand"
									/>
								</label>
							</div>
						</div>
					</Portal>
				)}
			</div>
		);
	},
);

DateTimePicker.displayName = 'DateTimePicker';
