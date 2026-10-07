import React, { useEffect, useId, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { useAnchoredPosition, useClickOutside } from '../lib/dom';
import { CheckIcon, ChevronDownIcon, CloseIcon } from '../lib/icons';
import { presenceAttrs, usePresence } from '../lib/presence';
import { useControllableState } from '../lib/useControllableState';
import { fieldStyles } from './Input';
import type { SelectOption } from './Select';

export interface ComboboxProps {
	options: SelectOption[];
	value?: string | null;
	defaultValue?: string | null;
	onChange?: (value: string | null) => void;
	placeholder?: string;
	emptyText?: string;
	clearable?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	/** Lets the user pick the typed text as a new option (calls `onCreate`, then selects it). */
	onCreate?: (label: string) => void;
	createLabel?: (text: string) => string;
	name?: string;
	id?: string;
	className?: string;
}

/** Type-to-filter select (ARIA 1.2 combobox: the input keeps focus, arrows move `aria-activedescendant`). */
export const Combobox = ({ options, value, defaultValue = null, onChange, placeholder = 'Search…', emptyText = 'No results', clearable = true, disabled, invalid, onCreate, createLabel = (t) => `Create "${t}"`, name, id, className }: ComboboxProps) => {
	const [selected, setSelected] = useControllableState<string | null>(value, defaultValue, onChange);
	const current = options.find((o) => o.value === selected);
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');
	const [active, setActive] = useState(0);
	const wrapRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const uid = useId();
	const { mounted, state } = usePresence(open);
	const style = useAnchoredPosition(wrapRef, listRef, { open: mounted, matchWidth: true, gap: 4 });

	const q = text.trim().toLowerCase();
	const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
	const canCreate = !!onCreate && !!q && !options.some((o) => o.label.toLowerCase() === q);
	const rows = [...filtered.map((o) => ({ kind: 'option' as const, o })), ...(canCreate ? [{ kind: 'create' as const }] : [])];
	const idx = Math.min(active, Math.max(0, rows.length - 1));

	const close = () => {
		setOpen(false);
		setText('');
	};
	useClickOutside([wrapRef, listRef], close, open);
	useEffect(() => {
		if (open) document.getElementById(`${uid}-${idx}`)?.scrollIntoView({ block: 'nearest' });
	}, [open, idx, uid]);

	const commit = (i: number) => {
		const row = rows[i];
		if (!row) return;
		if (row.kind === 'create') {
			onCreate!(text.trim());
		} else if (!row.o.disabled) setSelected(row.o.value);
		close();
	};

	return (
		<div ref={wrapRef} className={cn('relative w-full', className)}>
			<input
				id={id ?? uid}
				role="combobox"
				aria-expanded={open}
				aria-controls={`${uid}-list`}
				aria-autocomplete="list"
				aria-activedescendant={open && rows.length ? `${uid}-${idx}` : undefined}
				aria-invalid={invalid || undefined}
				disabled={disabled}
				autoComplete="off"
				placeholder={current?.label ?? placeholder}
				value={open ? text : (current?.label ?? '')}
				onFocus={() => !disabled && setOpen(true)}
				onClick={() => !disabled && setOpen(true)}
				onChange={(e) => {
					setText(e.target.value);
					setActive(0);
					setOpen(true);
				}}
				onKeyDown={(e) => {
					if (e.key === 'ArrowDown') {
						e.preventDefault();
						setOpen(true);
						setActive((i) => Math.min(rows.length - 1, i + 1));
					} else if (e.key === 'ArrowUp') {
						e.preventDefault();
						setActive((i) => Math.max(0, i - 1));
					} else if (e.key === 'Enter' && open) {
						e.preventDefault();
						commit(idx);
					} else if (e.key === 'Escape') close();
					else if (e.key === 'Tab') close();
				}}
				className={cn(fieldStyles, 'px-(--ui-field-px) py-(--ui-field-py) pe-16', !open && current && 'placeholder:text-page-text')}
			/>
			<div className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-muted">
				{clearable && current && !disabled && (
					<button type="button" aria-label="Clear" onClick={() => setSelected(null)} className="cursor-pointer rounded-item p-0.5 hover:text-page-text outline-none focus-visible:ring-2 focus-visible:ring-brand">
						<CloseIcon className="size-4" />
					</button>
				)}
				<ChevronDownIcon className={cn('pointer-events-none size-4 transition-transform', open && 'rotate-180')} />
			</div>
			{name && <input type="hidden" name={name} value={selected ?? ''} />}

			{mounted && (
				<Portal>
					<div ref={listRef} data-pk-layer="" id={`${uid}-list`} role="listbox" style={style} {...presenceAttrs(state)} className={cn('z-[200] overflow-y-auto p-1 ui-border border-line rounded-box bg-surface text-page-text shadow-pop pk-scrollbar', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none')}>
						{rows.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted">{emptyText}</div>}
						{rows.map((row, i) =>
							row.kind === 'create' ? (
								<div key="create" id={`${uid}-${i}`} role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={() => commit(i)} onMouseEnter={() => setActive(i)} className={cn('cursor-pointer rounded-item px-3 py-2 text-sm text-action', i === idx && 'bg-hover')}>
									{createLabel(text.trim())}
								</div>
							) : (
								<div
									key={row.o.value}
									id={`${uid}-${i}`}
									role="option"
									aria-selected={row.o.value === selected}
									aria-disabled={row.o.disabled}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => commit(i)}
									onMouseEnter={() => !row.o.disabled && setActive(i)}
									className={cn('flex cursor-pointer items-center justify-between gap-2 rounded-item px-3 py-2 text-sm', i === idx && 'bg-hover', row.o.value === selected && 'font-bold text-action', row.o.disabled && 'cursor-not-allowed opacity-40')}
								>
									<span className="truncate">{row.o.label}</span>
									{row.o.value === selected && <CheckIcon className="size-4 shrink-0 text-brand" />}
								</div>
							),
						)}
					</div>
				</Portal>
			)}
		</div>
	);
};
