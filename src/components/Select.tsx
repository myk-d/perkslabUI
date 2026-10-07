import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { useAnchoredPosition, useClickOutside } from '../lib/dom';
import { CheckIcon, ChevronDownIcon } from '../lib/icons';
import { presenceAttrs, usePresence } from '../lib/presence';
import { useControllableState } from '../lib/useControllableState';
import { fieldStyles } from './Input';

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface SelectProps {
	options: SelectOption[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	/** Visible label rendered above the trigger. */
	label?: string;
	/** Filter input above the options — for long lists. */
	searchable?: boolean;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	invalid?: boolean;
	/** Submits the value with a surrounding <form> (renders a hidden input). */
	name?: string;
	id?: string;
	className?: string;
}

/**
 * A themable select. Follows the WAI-ARIA "select-only combobox" pattern: the trigger is a real, always-focused
 * <button>, arrow keys move a highlighted option (announced through `aria-activedescendant`), Enter/Space selects,
 * Escape closes, Home/End jump, typing a letter jumps to the matching option. The list is portalled and flips
 * above the trigger when there is no room below, so it is never clipped by modals or scroll containers.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
	(
		{ options, value, defaultValue, onChange, placeholder = 'Select…', label, searchable = false, searchPlaceholder = 'Search…', emptyText = 'Nothing found', disabled, invalid, name, id, className },
		ref,
	) => {
		const [selected, setSelected] = useControllableState<string | undefined>(value, defaultValue, onChange as ((v: string | undefined) => void) | undefined);
		const [open, setOpen] = useState(false);
		const [search, setSearch] = useState('');
		const [highlighted, setHighlighted] = useState(0);
		const triggerRef = useRef<HTMLButtonElement>(null);
		const listRef = useRef<HTMLDivElement>(null);
		const searchRef = useRef<HTMLInputElement>(null);
		useImperativeHandle(ref, () => triggerRef.current!);

		const uid = useId();
		const listboxId = `${uid}-listbox`;
		const optionId = (i: number) => `${uid}-opt-${i}`;

		const query = search.trim().toLowerCase();
		const visible = searchable && query ? options.filter((o) => o.label.toLowerCase().includes(query)) : options;
		const current = options.find((o) => o.value === selected);
		const { mounted, state } = usePresence(open);
		const style = useAnchoredPosition(triggerRef, listRef, { open: mounted, matchWidth: true, gap: 4 });

		const close = (refocus = true) => {
			setOpen(false);
			setSearch('');
			if (refocus) triggerRef.current?.focus();
		};
		const openList = () => {
			if (disabled) return;
			const idx = options.findIndex((o) => o.value === selected && !o.disabled);
			setHighlighted(Math.max(0, idx));
			setOpen(true);
		};
		const commit = (opt?: SelectOption) => {
			if (!opt || opt.disabled) return;
			setSelected(opt.value);
			close();
		};

		useClickOutside([triggerRef, listRef], () => close(false), open);

		useEffect(() => {
			if (open && searchable) searchRef.current?.focus();
		}, [open, searchable]);

		const safeHighlight = Math.min(highlighted, Math.max(0, visible.length - 1));
		useEffect(() => {
			if (open) document.getElementById(optionId(safeHighlight))?.scrollIntoView({ block: 'nearest' });
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [open, safeHighlight]);

		const move = (dir: 1 | -1, from = safeHighlight) => {
			if (visible.length === 0) return;
			let i = from;
			for (let n = 0; n < visible.length; n++) {
				i = (i + dir + visible.length) % visible.length;
				if (!visible[i].disabled) break;
			}
			setHighlighted(i);
		};

		const onKeyDown = (e: React.KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					open ? move(1) : openList();
					break;
				case 'ArrowUp':
					e.preventDefault();
					open ? move(-1) : openList();
					break;
				case 'Home':
					if (open) {
						e.preventDefault();
						setHighlighted(0);
					}
					break;
				case 'End':
					if (open) {
						e.preventDefault();
						setHighlighted(visible.length - 1);
					}
					break;
				case 'Enter':
				case ' ':
					if (e.key === ' ' && searchable && open) break; // let the user type spaces in the search box
					e.preventDefault();
					open ? commit(visible[safeHighlight]) : openList();
					break;
				case 'Escape':
					if (open) {
						e.preventDefault();
						e.stopPropagation();
						close();
					}
					break;
				case 'Tab':
					if (open) close(false);
					break;
				default:
					if (!searchable && open && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
						const idx = visible.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
						if (idx >= 0) setHighlighted(idx);
					}
			}
		};

		return (
			<div className={cn('flex flex-col gap-1.5 w-full', className)} onKeyDown={onKeyDown}>
				{label && (
					<label htmlFor={id ?? uid} className="ui-label text-xs text-page-text/70">
						{label}
					</label>
				)}
				<button
					ref={triggerRef}
					id={id ?? uid}
					type="button"
					role="combobox"
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-controls={open ? listboxId : undefined}
					aria-activedescendant={open && visible.length ? optionId(safeHighlight) : undefined}
					aria-invalid={invalid || undefined}
					disabled={disabled}
					onClick={() => (open ? close() : openList())}
					className={cn(fieldStyles, 'flex items-center justify-between gap-2 px-(--ui-field-px) py-(--ui-field-py) text-start cursor-pointer')}
				>
					<span className={cn('truncate', !current && 'text-muted')}>{current?.label ?? placeholder}</span>
					<ChevronDownIcon className={cn('size-4 shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} />
				</button>
				{name && <input type="hidden" name={name} value={selected ?? ''} />}

				{mounted && (
					<Portal>
						<div
							data-pk-layer=""
ref={listRef}
							style={style}
							className={cn('z-[200] flex flex-col overflow-hidden ui-border border-line rounded-box bg-surface text-page-text shadow-pop', state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none')}
							{...presenceAttrs(state)}
						>
							{searchable && (
								<div className="p-2 border-b border-line/40">
									<input
										ref={searchRef}
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											setHighlighted(0);
										}}
										placeholder={searchPlaceholder}
										aria-label={searchPlaceholder}
										className="w-full bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted"
									/>
								</div>
							)}
							<div id={listboxId} role="listbox" className="overflow-y-auto p-1 pk-scrollbar">
								{visible.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted">{emptyText}</div>}
								{visible.map((opt, i) => (
									<div
										key={opt.value}
										id={optionId(i)}
										role="option"
										aria-selected={opt.value === selected}
										aria-disabled={opt.disabled}
										onMouseEnter={() => !opt.disabled && setHighlighted(i)}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => commit(opt)}
										className={cn(
											'flex items-center justify-between gap-2 rounded-item px-3 py-2 text-sm cursor-pointer',
											i === safeHighlight && 'bg-hover',
											opt.value === selected && 'font-bold text-action',
											opt.disabled && 'opacity-40 cursor-not-allowed',
										)}
									>
										<span className="truncate">{opt.label}</span>
										{opt.value === selected && <CheckIcon className="size-4 shrink-0 text-brand" />}
									</div>
								))}
							</div>
						</div>
					</Portal>
				)}
			</div>
		);
	},
);

Select.displayName = 'Select';
