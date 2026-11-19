import type { Dayjs } from 'dayjs';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { CalendarIcon } from '../lib/icons';
import { useLayer } from '../lib/layers';
import { presenceAttrs, usePresence } from '../lib/presence';
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

const timeInputClass =
	'w-16 rounded-field ui-border border-line bg-control px-2 py-1.5 text-center font-mono text-sm tabular-nums text-page-text outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:ring-3 focus:ring-brand/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
	({ value, onChange, dateFormat = 'DD.MM.YYYY - HH:mm', onBlur, disabled, invalid, minDate, maxDate, weekStartsOn, captionLayout = 'dropdown', fromYear, toYear, hoursLabel = 'Hours', minutesLabel = 'Minutes', className }, ref) => {
		const [open, setOpen] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);
		const triggerRef = useRef<HTMLButtonElement>(null);
		const popupRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => containerRef.current!);

		const { isTop, zIndex } = useLayer(open, 'floating');
		const { mounted, state } = usePresence(open, 140);
		const { style, side, align } = useAnchoredPosition(containerRef, popupRef, { open: mounted, gap: 6 });

		const close = (refocus = false) => {
			if (!open) return;
			setOpen(false);
			onBlur?.();
			if (refocus) triggerRef.current?.focus();
		};
		useClickOutside([containerRef, popupRef], () => close(false), open);
		useEscape(() => isTop() && close(true), open);

		const selectDay = (d: Dayjs) => onChange(value.year(d.year()).month(d.month()).date(d.date()));

		return (
			<div ref={containerRef} className={cn('relative w-full', className)}>
				<button
					ref={triggerRef}
					type="button"
					disabled={disabled}
					data-state={open ? 'open' : 'closed'}
					aria-haspopup="dialog"
					aria-expanded={open}
					aria-invalid={invalid || undefined}
					onClick={() => (open ? close(false) : setOpen(true))}
					className={cn(
						fieldStyles,
						'flex items-center justify-between gap-2 px-(--ui-field-px) text-left cursor-pointer',
						open && 'border-brand ring-3 ring-brand/15',
					)}
				>
					<span className="truncate tabular-nums">{value.format(dateFormat)}</span>
					<CalendarIcon className="size-4 shrink-0 text-muted" />
				</button>

				{mounted && (
					<Portal anchorRef={containerRef}>
						<div
							data-pk-layer=""
							data-side={side}
							data-align={align}
							ref={popupRef}
							role="dialog"
							style={{ ...style, zIndex }}
							{...presenceAttrs(state)}
							className={cn(
								'w-[min(20rem,calc(100vw-1rem))] overflow-y-auto ui-border border-line rounded-pop bg-elevated p-3.5 text-page-text shadow-pop pk-scrollbar',
								state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none',
							)}
						>
							<Calendar value={value} onSelect={selectDay} minDate={minDate} maxDate={maxDate} weekStartsOn={weekStartsOn} captionLayout={captionLayout} fromYear={fromYear} toYear={toYear} />
							<div className="mt-3.5 flex items-center justify-center gap-2.5 border-t border-line-subtle pt-3.5">
								<label className="text-center">
									<span className="ui-label mb-1 block text-[10px] text-muted">{hoursLabel}</span>
									<input
										type="number"
										min={0}
										max={23}
										value={value.hour()}
										onChange={(e) => onChange(value.hour(clamp(parseInt(e.target.value, 10), 23)))}
										className={timeInputClass}
									/>
								</label>
								<span className="mt-4 text-lg font-semibold text-muted">:</span>
								<label className="text-center">
									<span className="ui-label mb-1 block text-[10px] text-muted">{minutesLabel}</span>
									<input
										type="number"
										min={0}
										max={59}
										value={value.minute()}
										onChange={(e) => onChange(value.minute(clamp(parseInt(e.target.value, 10), 59)))}
										className={timeInputClass}
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
