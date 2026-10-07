import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { SearchIcon } from '../lib/icons';
import { Kbd } from './Kbd';
import { Modal, ModalContent, ModalTitle } from './Modal';

export interface CommandItemDef {
	value: string;
	label: string;
	icon?: React.ReactNode;
	shortcut?: string;
	/** Extra words that should match the search (e.g. synonyms). */
	keywords?: string[];
	disabled?: boolean;
	onSelect?: () => void;
}
export interface CommandGroupDef {
	heading?: string;
	items: CommandItemDef[];
}

export interface CommandProps {
	groups: CommandGroupDef[];
	placeholder?: string;
	emptyText?: string;
	/** Called after an item ran its `onSelect` (a dialog uses it to close). */
	onItemSelected?: (item: CommandItemDef) => void;
	className?: string;
}

const matches = (item: CommandItemDef, q: string) => !q || [item.label, ...(item.keywords ?? [])].some((s) => s.toLowerCase().includes(q));

/** Searchable action list (⌘K style). Data-driven: pass `groups`, get filtering + keyboard navigation. */
export const Command = ({ groups, placeholder = 'Type a command or search…', emptyText = 'No results found.', onItemSelected, className }: CommandProps) => {
	const [query, setQuery] = useState('');
	const [active, setActive] = useState(0);
	const uid = useId();
	const inputRef = useRef<HTMLInputElement>(null);

	const q = query.trim().toLowerCase();
	const visible = groups.map((g) => ({ ...g, items: g.items.filter((i) => matches(i, q)) })).filter((g) => g.items.length);
	const flat = visible.flatMap((g) => g.items).filter((i) => !i.disabled);
	const idx = Math.min(active, Math.max(0, flat.length - 1));

	const activeValue = flat[idx]?.value;
	useEffect(() => {
		document.getElementById(`${uid}-${activeValue}`)?.scrollIntoView({ block: 'nearest' });
	}, [activeValue, uid]);

	const run = (item?: CommandItemDef) => {
		if (!item || item.disabled) return;
		item.onSelect?.();
		onItemSelected?.(item);
	};

	return (
		<div className={cn('flex w-full flex-col overflow-hidden rounded-box bg-surface text-page-text', className)}>
			<div className="flex items-center gap-2 border-b border-line/40 px-3">
				<SearchIcon className="size-4 shrink-0 text-muted" />
				<input
					ref={inputRef}
					autoFocus
					role="combobox"
					aria-expanded="true"
					aria-controls={`${uid}-list`}
					aria-activedescendant={flat[idx] ? `${uid}-${flat[idx].value}` : undefined}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setActive(0);
					}}
					onKeyDown={(e) => {
						if (e.key === 'ArrowDown') {
							e.preventDefault();
							setActive(Math.min(flat.length - 1, idx + 1));
						} else if (e.key === 'ArrowUp') {
							e.preventDefault();
							setActive(Math.max(0, idx - 1));
						} else if (e.key === 'Enter') {
							e.preventDefault();
							run(flat[idx]);
						}
					}}
					placeholder={placeholder}
					aria-label={placeholder}
					className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
				/>
			</div>
			<div id={`${uid}-list`} role="listbox" className="max-h-80 overflow-y-auto p-1 pk-scrollbar">
				{visible.length === 0 && <div className="py-8 text-center text-sm text-muted">{emptyText}</div>}
				{visible.map((g, gi) => (
					<div key={g.heading ?? gi} role="group" aria-label={g.heading} className={cn(gi > 0 && 'mt-1 border-t border-line/30 pt-1')}>
						{g.heading && <div className="ui-label px-3 py-1.5 text-[11px] text-muted">{g.heading}</div>}
						{g.items.map((item) => {
							const isActive = flat[idx]?.value === item.value;
							return (
								<div
									key={item.value}
									id={`${uid}-${item.value}`}
									role="option"
									aria-selected={isActive}
									aria-disabled={item.disabled}
									onMouseEnter={() => !item.disabled && setActive(flat.findIndex((f) => f.value === item.value))}
									onClick={() => run(item)}
									className={cn('flex cursor-pointer items-center gap-2 rounded-item px-3 py-2 text-sm', isActive && 'bg-hover', item.disabled && 'cursor-not-allowed opacity-40')}
								>
									{item.icon && <span className="flex size-4 shrink-0 items-center justify-center text-muted [&>svg]:size-4">{item.icon}</span>}
									<span className="flex-1 truncate">{item.label}</span>
									{item.shortcut && <Kbd>{item.shortcut}</Kbd>}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export interface CommandDialogProps extends CommandProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Global shortcut that toggles the dialog, e.g. `'k'` for ⌘K / Ctrl+K. Omit to disable. */
	hotkey?: string;
	title?: string;
}

export const CommandDialog = ({ open, onOpenChange, hotkey, title = 'Command palette', onItemSelected, ...props }: CommandDialogProps) => {
	const [inner, setInner] = useState(false);
	const isOpen = open ?? inner;
	const set = (v: boolean) => (onOpenChange ? onOpenChange(v) : setInner(v));

	useEffect(() => {
		if (!hotkey) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === hotkey.toLowerCase() && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				set(!isOpen);
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hotkey, isOpen]);

	return (
		<Modal open={isOpen} onOpenChange={set}>
			<ModalContent showCloseButton={false} className="sm:max-w-xl gap-0 overflow-hidden p-0">
				<ModalTitle className="sr-only">{title}</ModalTitle>
				<Command {...props} onItemSelected={(i) => { onItemSelected?.(i); set(false); }} />
			</ModalContent>
		</Modal>
	);
};
