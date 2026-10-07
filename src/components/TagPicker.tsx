import React, { useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { CheckIcon, CloseIcon, SearchIcon, TagIcon, TrashIcon } from '../lib/icons';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

export type TagColor = 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'stone';

export interface Tag {
	id: string;
	name: string;
	color: TagColor;
}

/** Fixed palette (not theme colours — a tag keeps its hue in every theme). Strings are literal so Tailwind picks them up. */
export const tagColors: Record<TagColor, { chip: string; dot: string }> = {
	rose: { chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-300', dot: 'bg-rose-500' },
	amber: { chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
	emerald: { chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
	sky: { chip: 'bg-sky-500/15 text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
	violet: { chip: 'bg-violet-500/15 text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
	stone: { chip: 'bg-stone-500/15 text-stone-600 dark:text-stone-300', dot: 'bg-stone-400' },
};
const palette = Object.keys(tagColors) as TagColor[];

/** Next colour in the palette — handy for `onCreate`. */
export const nextTagColor = (existingCount: number): TagColor => palette[existingCount % palette.length];

export interface TagPickerLabels {
	add: string;
	search: string;
	create: (name: string) => string;
	empty: string;
	done: string;
	remove: string;
}

const defaultLabels: TagPickerLabels = {
	add: 'Add tags',
	search: 'Search or create a tag',
	create: (name) => `Create "${name}"`,
	empty: 'No tags yet',
	done: 'Done',
	remove: 'Delete tag',
};

export interface TagPickerProps {
	allTags: Tag[];
	selectedTagIds: string[];
	onToggle: (tagId: string) => void;
	/** Called with the typed name; omit to disable creating tags. */
	onCreate?: (name: string) => void;
	/** Called when the trash icon is pressed; omit to hide it. Ask for confirmation yourself (e.g. `useConfirm`). */
	onDeleteTag?: (tag: Tag) => void;
	labels?: Partial<TagPickerLabels>;
	className?: string;
}

const Chip = ({ tag, onRemove }: { tag: Tag; onRemove?: () => void }) => (
	<span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', tagColors[tag.color].chip)}>
		{tag.name}
		{onRemove && (
			<button type="button" aria-label={`Remove ${tag.name}`} onClick={onRemove} className="cursor-pointer hover:opacity-70">
				<CloseIcon className="size-2.5" />
			</button>
		)}
	</span>
);

export const TagPicker = ({ allTags, selectedTagIds, onToggle, onCreate, onDeleteTag, labels, className }: TagPickerProps) => {
	const l = { ...defaultLabels, ...labels };
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const selected = allTags.filter((t) => selectedTagIds.includes(t.id));
	const q = query.trim().toLowerCase();
	const filtered = q ? allTags.filter((t) => t.name.toLowerCase().includes(q)) : allTags;
	const exact = allTags.some((t) => t.name.toLowerCase() === q);
	const canCreate = !!onCreate && !!q && !exact;

	const create = () => {
		if (!canCreate) return;
		onCreate!(query.trim());
		setQuery('');
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className={cn('w-full', className)}>
				<button
					type="button"
					className="flex w-full flex-wrap items-center gap-1.5 rounded-field border border-dashed border-line px-2.5 py-1.5 text-left transition-colors hover:bg-hover cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
				>
					{selected.length === 0 ? (
						<span className="flex items-center gap-1.5 text-xs text-muted">
							<TagIcon className="size-3.5" /> {l.add}
						</span>
					) : (
						selected.map((t) => <Chip key={t.id} tag={t} />)
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent className="p-2">
				<div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-field border border-line px-2 py-1.5">
					<SearchIcon className="size-3.5 shrink-0 text-muted" />
					{selected.map((t) => (
						<Chip key={t.id} tag={t} onRemove={() => onToggle(t.id)} />
					))}
					<input
						ref={inputRef}
						autoFocus
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && create()}
						placeholder={l.search}
						aria-label={l.search}
						className="min-w-16 flex-1 bg-transparent text-xs outline-none placeholder:text-muted"
					/>
				</div>

				<div className="max-h-48 overflow-y-auto pk-scrollbar">
					{canCreate && (
						<button type="button" onClick={create} className="flex w-full cursor-pointer items-center gap-2 rounded-item px-2 py-1.5 text-left text-sm hover:bg-hover">
							<TagIcon className="size-3.5" /> {l.create(query.trim())}
						</button>
					)}
					{filtered.length === 0 && !q && (
						<div className="flex flex-col items-center gap-2 px-2 py-6 text-center text-xs text-muted">
							<TagIcon className="size-7 opacity-50" />
							{l.empty}
						</div>
					)}
					{filtered.map((tag) => (
						<div key={tag.id} className="group flex items-center">
							<button
								type="button"
								onClick={() => onToggle(tag.id)}
								aria-pressed={selectedTagIds.includes(tag.id)}
								className="flex flex-1 cursor-pointer items-center justify-between gap-2 rounded-item px-2 py-1.5 text-left text-sm hover:bg-hover"
							>
								<span className="flex items-center gap-2">
									<span className={cn('size-2 rounded-full', tagColors[tag.color].dot)} />
									{tag.name}
								</span>
								{selectedTagIds.includes(tag.id) && <CheckIcon className="size-3.5 text-brand" />}
							</button>
							{onDeleteTag && (
								<button
									type="button"
									aria-label={`${l.remove}: ${tag.name}`}
									onClick={() => onDeleteTag(tag)}
									className="shrink-0 cursor-pointer rounded-item p-1.5 text-muted hover:bg-danger/10 hover:text-danger md:hidden md:group-hover:block"
								>
									<TrashIcon className="size-3.5" />
								</button>
							)}
						</div>
					))}
				</div>

				<div className="mt-2 flex justify-end border-t border-line/30 pt-2">
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="ui-label cursor-pointer rounded-control bg-brand px-3 py-1 text-xs text-brand-fg hover:bg-brand-hover"
					>
						{l.done}
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
};
