import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { useAnchoredPosition, useClickOutside, useEscape } from '../lib/dom';
import { CalendarIcon, CloseIcon } from '../lib/icons';
import { useLayer } from '../lib/layers';
import { presenceAttrs, usePresence } from '../lib/presence';
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
		const triggerRef = useRef<HTMLButtonElement>(null);
		const popupRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => triggerRef.current!);

		const { isTop, zIndex } = useLayer(open, 'floating');
		const { mounted, state } = usePresence(open, 140);
		const { style, side, align } = useAnchoredPosition(anchorRef, popupRef, { open: mounted, gap: 6 });

		const close = (refocus = false) => {
			setOpen(false);
			if (refocus) triggerRef.current?.focus();
		};
		useClickOutside([anchorRef, popupRef], () => close(false), open);
		useEscape(() => isTop() && close(true), open);

		const pick = (d: Dayjs) => {
			onChange(d);
			close(true);
		};

		return (
			<div ref={anchorRef} className={cn('relative w-full', className)}>
				<button
					ref={triggerRef}
					type="button"
					disabled={disabled}
					data-state={open ? 'open' : 'closed'}
					aria-haspopup="dialog"
					aria-expanded={open}
					aria-invalid={invalid || undefined}
					onClick={() => setOpen((v) => !v)}
					className={cn(
						fieldStyles,
						'flex items-center justify-between gap-2 px-(--ui-field-px) text-start cursor-pointer',
						open && 'border-brand ring-3 ring-brand/15',
					)}
				>
					<span className={cn('truncate tabular-nums', !value && 'text-muted', clearable && value && !disabled && 'me-7')}>{value ? value.format(dateFormat) : placeholder}</span>
					<CalendarIcon className="size-4 shrink-0 text-muted" />
				</button>
				{clearable && value && !disabled && (
					<button
						type="button"
						aria-label="Clear date"
						onClick={() => onChange(null)}
						className="absolute end-9 top-1/2 -translate-y-1/2 rounded-item p-0.5 text-muted hover:text-page-text transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
					>
						<CloseIcon className="size-3.5" />
					</button>
				)}
				{mounted && (
					<Portal anchorRef={anchorRef}>
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
							{shortcuts && (
								<div className="mb-3 flex gap-1.5">
									{[
										{ label: shortcuts.today, date: dayjs() },
										{ label: shortcuts.tomorrow, date: dayjs().add(1, 'day') },
									].map((s) => (
										<button
											key={s.label}
											type="button"
											onClick={() => pick(s.date)}
											className="ui-label rounded-control bg-subtle px-3 py-1 text-xs text-page-text hover:bg-hover transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
