import React, { useMemo, useState } from 'react';
import { cn } from '../lib/cn';
import { ChevronDownIcon } from '../lib/icons';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Pagination } from './Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';

export interface DataTableColumn<T> {
	key: string;
	header: React.ReactNode;
	/** Raw value used for sorting and the text filter. Defaults to `row[key]`. */
	accessor?: (row: T) => string | number | null | undefined;
	/** Custom cell content. Defaults to the accessor value. */
	cell?: (row: T) => React.ReactNode;
	sortable?: boolean;
	align?: 'left' | 'right' | 'center';
	className?: string;
}

export interface DataTableProps<T> {
	columns: DataTableColumn<T>[];
	data: T[];
	rowKey: (row: T) => string;
	/** Adds a search box that filters across all columns' accessor values. */
	searchable?: boolean;
	searchPlaceholder?: string;
	/** Rows per page; omit for no pagination. */
	pageSize?: number;
	/** Adds a checkbox column; `selected` / `onSelectedChange` make it controlled. */
	selectable?: boolean;
	selected?: string[];
	onSelectedChange?: (keys: string[]) => void;
	onRowClick?: (row: T) => void;
	emptyText?: React.ReactNode;
	className?: string;
}

export function DataTable<T>({ columns, data, rowKey, searchable, searchPlaceholder = 'Filter…', pageSize, selectable, selected, onSelectedChange, onRowClick, emptyText = 'No results.', className }: DataTableProps<T>) {
	const [query, setQuery] = useState('');
	const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
	const [page, setPage] = useState(1);
	const [innerSel, setInnerSel] = useState<string[]>([]);
	const sel = selected ?? innerSel;
	const setSel = (v: string[]) => (onSelectedChange ? onSelectedChange(v) : setInnerSel(v));

	const value = (col: DataTableColumn<T>, row: T) => (col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key]) as string | number | null | undefined;

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase();
		let out = q ? data.filter((r) => columns.some((c) => String(value(c, r) ?? '').toLowerCase().includes(q))) : data;
		if (sort) {
			const col = columns.find((c) => c.key === sort.key)!;
			out = [...out].sort((a, b) => {
				const x = value(col, a);
				const y = value(col, b);
				const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true });
				return sort.dir === 'asc' ? r : -r;
			});
		}
		return out;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, query, sort, columns]);

	const pageCount = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
	const current = Math.min(page, pageCount);
	const shown = pageSize ? rows.slice((current - 1) * pageSize, current * pageSize) : rows;
	const shownKeys = shown.map(rowKey);
	const allOn = shownKeys.length > 0 && shownKeys.every((k) => sel.includes(k));
	const someOn = shownKeys.some((k) => sel.includes(k));

	const cycle = (key: string) => setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));

	return (
		<div className={cn('flex flex-col gap-3', className)}>
			{searchable && (
				<div className="max-w-xs">
					<Input
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setPage(1);
						}}
						placeholder={searchPlaceholder}
						aria-label={searchPlaceholder}
					/>
				</div>
			)}
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						{selectable && (
							<TableHead className="w-10">
								<Checkbox
									aria-label="Select all"
									checked={allOn}
									indeterminate={!allOn && someOn}
									onChange={() => setSel(allOn ? sel.filter((k) => !shownKeys.includes(k)) : [...new Set([...sel, ...shownKeys])])}
								/>
							</TableHead>
						)}
						{columns.map((c) => (
							<TableHead key={c.key} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined} className={cn(c.align === 'right' && 'text-end', c.align === 'center' && 'text-center', c.className)}>
								{c.sortable ? (
									<button type="button" onClick={() => cycle(c.key)} className="ui-label inline-flex cursor-pointer items-center gap-1 outline-none hover:text-page-text focus-visible:text-page-text">
										{c.header}
										<ChevronDownIcon className={cn('size-3.5 transition-transform', sort?.key === c.key ? 'text-brand' : 'opacity-30', sort?.key === c.key && sort.dir === 'asc' && 'rotate-180')} />
									</button>
								) : (
									c.header
								)}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{shown.length === 0 && (
						<TableRow>
							<TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="py-10 text-center text-muted">
								{emptyText}
							</TableCell>
						</TableRow>
					)}
					{shown.map((row) => {
						const key = rowKey(row);
						return (
							<TableRow key={key} data-selected={sel.includes(key) || undefined} onClick={onRowClick ? () => onRowClick(row) : undefined} className={cn(onRowClick && 'cursor-pointer', sel.includes(key) && 'bg-brand-bg')}>
								{selectable && (
									<TableCell onClick={(e) => e.stopPropagation()}>
										<Checkbox aria-label="Select row" checked={sel.includes(key)} onChange={() => setSel(sel.includes(key) ? sel.filter((k) => k !== key) : [...sel, key])} />
									</TableCell>
								)}
								{columns.map((c) => (
									<TableCell key={c.key} className={cn(c.align === 'right' && 'text-end', c.align === 'center' && 'text-center', c.className)}>
										{c.cell ? c.cell(row) : (value(c, row) ?? '')}
									</TableCell>
								))}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			{pageSize && pageCount > 1 && (
				<div className="flex items-center justify-between gap-3 text-sm text-muted">
					<span>{selectable ? `${sel.length} selected · ` : ''}{rows.length} rows</span>
					<Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
				</div>
			)}
		</div>
	);
}
